import { defineStore } from 'pinia';

// I defined a Pinia store named 'auth' for handling authentication and GitHub-related actions.
export const useAuthStore = defineStore('auth', {
    //   State: holds all reactive data for authentication
    state: () => ({
        isAuthenticated: false, // Boolean to track if user is logged in
        token: null,            // JWT or session token received from backend
        user: null,             // Object holding user profile info
        unfollowProgress: 0,    // Progress indicator (0–100%) for batch unfollow operation
        unfollowErrors: []      // Array to store failed unfollow attempts with error details
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user`, {
                headers: {
                    Authorization: `Bearer ${this.token}` // Include token in Authorization header
                },
            });

            this.user = await response.json();
            return this.user;
        },

        /**
         *  Get a list of users the authenticated user follows who don't follow back
         */
        async getNonFollowers() {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/non-followers`, {
                headers: {
                    Authorization: `Bearer ${this.token}`
                },
            });

            return response.json(); // Returns list of non-followers
        },

        /**
         *  Unfollow a single GitHub user
         * Sends a DELETE request to backend API
         */
        async unfollow(username) {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/following/${username}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    },
                }
            );

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
                `${import.meta.env.VITE_API_URL}/api/unfollow-batch`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.token}`
                    },
                    body: JSON.stringify({ usernames }),
                }
            );

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
