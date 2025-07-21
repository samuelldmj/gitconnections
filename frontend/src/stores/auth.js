import { defineStore } from 'pinia';

// I defined a Pinia store named 'auth' for handling authentication and GitHub-related actions.
export const useAuthStore = defineStore('auth', {
    //   State: holds all reactive data for authentication
    state: () => ({
        isAuthenticated: false, // Boolean to track if user is logged in
        token: null,            // JWT or session token received from backend
        user: null,             // Object holding user profile info
        unfollowProgress: 0,    // Progress indicator (0–100%) for batch unfollow operation
        unfollowErrors: [],     // Array to store failed unfollow attempts with error details
        pagination: {
            followers: { page: 1, perPage: 30, hasMore: true },
            nonFollowers: { page: 1, perPage: 30, hasMore: true }
        },
        cache: {
            followers: [],
            nonFollowers: []
        }

    }),

    //   Actions: methods to modify state or perform async logic (e.g. API calls)
    actions: {
        /**
         *  Login via GitHub
         * Called after redirect back from GitHub with an OAuth `code`.
         * - Sends `code` to backend to get access token.
         * - Sets authentication state and stores token.
         * - Loads user profile after successful login.
         */
        async loginWithGitHub(code) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/github`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Save token and update auth state
                this.token = data.token;
                this.isAuthenticated = true;

                // Store token in localStorage for persistence across refreshes
                localStorage.setItem('token', this.token);

                // Load user profile
                await this.getUserProfile();
            } catch (error) {
                console.error('Login failed:', error);
                throw error;
            }
        },

        /**
         * Fetch the authenticated user's GitHub profile from the backend
         * Requires the user to be logged in (i.e. token must be set)
         */
        async getUserProfile() {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user`, {
                headers: {
                    Authorization: `Bearer ${this.token}`
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.user = await response.json();
            return this.user;
        },


        async getUserStars() {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/user-stars`, {
                headers: { Authorization: `Bearer ${this.token}` }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        },

        async getFollowers(page = 1, perPage = 30) {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/auth/followers?page=${page}&per_page=${perPage}`,
                    { headers: { Authorization: `Bearer ${this.token}` } }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
                }

                const data = await response.json();
                console.log('Followers data:', data); // Debug log
                this.pagination.followers.page = page;
                this.pagination.followers.hasMore = data.length === perPage;
                this.cache.followers = data; // Update cache
                return data;
            } catch (error) {
                console.error('Error fetching followers:', error);
                throw error;
            }
        },

        /**
         *  Get a list of users the authenticated user follows who don't follow back
         */
        async getNonFollowers(page = 1, perPage = 30) {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/auth/non-followers?page=${page}&per_page=${perPage}`,
                    { headers: { Authorization: `Bearer ${this.token}` } }
                );

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                this.pagination.nonFollowers.page = page;
                this.pagination.nonFollowers.hasMore = data.length === perPage;
                return data;
            } catch (error) {
                console.error('Error fetching non-followers:', error);
                throw error;
            }
        },

        /**
         *  Unfollow a single GitHub user
         * Sends a DELETE request to backend API
         */
        async unfollow(username) {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/following/${username}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json(); // Returns success/failure result
        },

        /**
         *  Unfollow multiple users in batch
         * - Sends a POST request with an array of usernames
         * - Tracks progress using `unfollowProgress`
         * - Logs errors in `unfollowErrors`
         */
        async unfollowAll(usernames) {
            this.unfollowProgress = 0;
            this.unfollowErrors = [];
            const total = usernames.length;

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/unfollow-batch`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.token}`
                    },
                    body: JSON.stringify({ usernames }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { results } = await response.json();

            // Loop through each result to track progress and collect any errors
            results.forEach((result, index) => {
                this.unfollowProgress = Math.floor(((index + 1) / total) * 100);

                if (!result.success) {
                    this.unfollowErrors.push({
                        username: result.username,
                        error: result.error
                    });
                }
            });

            return results;
        },

        /**
         *  Logout the current user
         * Clears state and removes token from localStorage
         */
        logout() {
            this.token = null;
            this.isAuthenticated = false;
            this.user = null;
            localStorage.removeItem('token'); // Clear token from localStorage
        }
    }
});
