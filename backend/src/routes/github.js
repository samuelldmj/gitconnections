import express from 'express';
import axios from 'axios';
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
            const { data } = await axios.get('https://api.github.com/user', {
                headers: { Authorization: `token ${token}` }
            });
            return data;
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

        // Temporarily disable cache for debugging
        // const data = cache.get(cacheKey);
        // if (data) return res.json(data);

        const data = await fetchWithCache(cacheKey, async () => {
            const response = await axios.get('https://api.github.com/user/followers', {
                headers: { Authorization: `token ${token}` },
                params: { page, per_page }
            });
            console.log('GitHub followers response:', response.data);
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
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 30;
        const cacheKey = `non_followers_${token}_${page}_${per_page}`;

        const data = await fetchWithCache(cacheKey, async () => {
            // Get paginated followers and following
            const [followersRes, followingRes] = await Promise.all([
                axios.get('https://api.github.com/user/followers', {
                    headers: { Authorization: `token ${token}` },
                    params: { page, per_page }
                }),
                axios.get('https://api.github.com/user/following', {
                    headers: { Authorization: `token ${token}` },
                    params: { page, per_page }
                })
            ]);

            const followerLogins = new Set(followersRes.data.map(user => user.login));
            return followingRes.data.filter(user => !followerLogins.has(user.login));
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Single unfollow
router.delete('/following/:username', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.session.githubToken;
        await axios.delete(
            `https://api.github.com/user/following/${req.params.username}`,
            { headers: { Authorization: `token ${token}` } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
                await axios.delete(
                    `https://api.github.com/user/following/${username}`,
                    { headers: { Authorization: `token ${token}` } }
                );
                results.push({ username, success: true });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
            } catch (error) {
                results.push({ username, success: false, error: error.message });
            }
        }

        res.json({ results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/user-stars', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.session.githubToken;
        let stars = 0;
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const { data } = await axios.get(`https://api.github.com/user/repos?per_page=100&page=${page}`, {
                headers: { Authorization: `token ${token}` }
            });

            if (data.length === 0) {
                hasMore = false;
            } else {
                stars += data.reduce((sum, repo) => sum + repo.stargazers_count, 0);
                page++;
                // Respect GitHub rate limits
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        res.json({ totalStars: stars });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;