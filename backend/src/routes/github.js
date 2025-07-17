import express from 'express';
import axios from 'axios';
const router = express.Router();

// GitHub OAuth endpoints
router.post('/github', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: "No code provided" });

        // Adding delay to simulate processing (will remove in production)
        if (process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        const { data } = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            {
                headers: { Accept: 'application/json' },
                timeout: 5000 // timeout to prevent hanging
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
            retryable: true // Indicating if client can retry
        });
    }
});

// GitHub API proxy endpoints
router.get('/user', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.session.githubToken;
        const { data } = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${token}` }
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/followers', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.session.githubToken
        const { data } = await axios.get('https://api.github.com/user/followers', {
            headers: { Authorization: `token ${token}` }
        })
        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/non-followers', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.session.githubToken;

        // Get followers and following
        const [followers, following] = await Promise.all([
            axios.get('https://api.github.com/user/followers', {
                headers: { Authorization: `token ${token}` }
            }),
            axios.get('https://api.github.com/user/following', {
                headers: { Authorization: `token ${token}` }
            })
        ]);

        // Find non-followers
        const followerLogins = new Set(followers.data.map(user => user.login));
        const nonFollowers = following.data.filter(
            user => !followerLogins.has(user.login)
        );

        res.json(nonFollowers);
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