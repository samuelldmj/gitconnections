import express from 'express';
import axios from 'axios'; // Import axios directly since it's used throughout
const router = express.Router();
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Helper function for GitHub API calls with caching
async function fetchWithCache(cacheKey, fetchFn) {
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    const freshData = await fetchFn();
    cache.set(cacheKey, freshData);
    return freshData;
}

// Rate Limit Monitoring Endpoint
router.get('/rate-limit', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        const { data } = await axios.get('https://api.github.com/rate_limit', {
            headers: { Authorization: `token ${token}` }
        });

        res.json(data.rate);
    } catch (error) {
        console.error('Error fetching rate limit:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

// GitHub OAuth endpoints
router.post('/github', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: "No code provided" });

        const { data } = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            {
                headers: { Accept: 'application/json' },
                timeout: 5000
            }
        );

        if (data.error) {
            return res.status(400).json({
                error: data.error_description || 'GitHub authentication failed'
            });
        }

        res.json({
            token: data.access_token,
            expires_in: data.expires_in || 3600
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({
            error: error.message,
            retryable: true
        });
    }
});

// GitHub API proxy endpoints
router.get('/user', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const cacheKey = `user_${token}`;

        const data = await fetchWithCache(cacheKey, async () => {
            const response = await axios.get('https://api.github.com/user', {
                headers: { Authorization: `token ${token}` }
            });

            return response.data;
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/followers', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 30;
        const cacheKey = `followers_${token}_${page}_${per_page}`;

        const data = await fetchWithCache(cacheKey, async () => {
            const response = await axios.get('https://api.github.com/user/followers', {
                headers: { Authorization: `token ${token}` },
                params: { page, per_page }
            });
            return response.data;
        });

        res.json(data);
    } catch (error) {
        console.error('Error fetching followers:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

router.get('/non-followers', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const cacheKey = `non_followers_${token}_all`;

        const data = await fetchWithCache(cacheKey, async () => {
            let followers = [], following = [];
            let page = 1;
            while (true) {
                const [followersRes, followingRes] = await Promise.all([
                    axios.get('https://api.github.com/user/followers', {
                        headers: { Authorization: `token ${token}` },
                        params: { page, per_page: 100 }
                    }),
                    axios.get('https://api.github.com/user/following', {
                        headers: { Authorization: `token ${token}` },
                        params: { page, per_page: 100 }
                    })
                ]);
                followers = followers.concat(followersRes.data);
                following = following.concat(followingRes.data);

                if (followersRes.data.length < 100 && followingRes.data.length < 100) break;
                page++;
                await new Promise(resolve => setTimeout(resolve, 500)); // Respect rate limits
            }

            const followerLogins = new Set(followers.map(user => user.login));
            const nonFollowers = following.filter(user => !followerLogins.has(user.login));

            return nonFollowers;
        });

        res.json(data);
    } catch (error) {
        console.error('Error fetching non-followers:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

// Single unfollow
router.delete('/following/:username', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.session.githubToken;
        const response = await axios.delete(
            `https://api.github.com/user/following/${req.params.username}`,
            { headers: { Authorization: `token ${token}` } }
        );

        cache.flushAll(); // Clear cache to ensure fresh data after unfollow
        res.json({ success: true });
    } catch (error) {
        console.error('Error unfollowing:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

// Batch unfollow
router.post('/unfollow-batch', async (req, res) => {
    try {
        const { usernames } = req.body;
        const token = req.headers.authorization?.split(' ')[1] || req.session.githubToken;
        const results = [];

        for (const username of usernames) {
            try {
                const response = await axios.delete(
                    `https://api.github.com/user/following/${username}`,
                    { headers: { Authorization: `token ${token}` } }
                );

                results.push({ username, success: true });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
            } catch (error) {
                results.push({ username, success: false, error: error.message });
            }
        }

        cache.flushAll(); // Clear cache to ensure fresh data after batch unfollow
        res.json({ results });
    } catch (error) {
        console.error('Error in batch unfollow:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

router.get('/user-stars', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.session.githubToken;
        let stars = 0;
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const response = await axios.get(`https://api.github.com/user/repos?per_page=100&page=${page}`, {
                headers: { Authorization: `token ${token}` }
            });

            if (response.data.length === 0) {
                hasMore = false;
            } else {
                stars += response.data.reduce((sum, repo) => sum + repo.stargazers_count, 0);
                page++;
                await new Promise(resolve => setTimeout(resolve, 500)); // Respect rate limits
            }
        }

        res.json({ totalStars: stars });
    } catch (error) {
        console.error('Error fetching user stars:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

export default router;