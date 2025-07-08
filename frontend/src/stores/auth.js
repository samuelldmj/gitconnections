import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: false,
        token: null,
    }),
    actions: {
        async loginWithGitHub() {
            // Simulate GitHub OAuth flow via backend
            const response = await fetch('/api/auth/github', { method: 'POST' })
            const data = await response.json()
            this.token = data.token
            this.isAuthenticated = true
            localStorage.setItem('token', this.token) // Optional persistence
        },
        logout() {
            this.token = null
            this.isAuthenticated = false
            localStorage.removeItem('token')
        },
        async getUserProfile() {
            // Fetch user profile from backend
            const response = await fetch('/api/user', {
                headers: { Authorization: `Bearer ${this.token}` },
            })
            return response.json()
        },
        async getNonFollowers() {
            // Fetch non-followers from backend
            const response = await fetch('/api/non-followers', {
                headers: { Authorization: `Bearer ${this.token}` },
            })
            return response.json()
        },
        async unfollow(username) {
            await fetch(`/api/following/${username}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${this.token}` },
            })
        },
        async unfollowAll(usernames) {
            for (const username of usernames) {
                await this.unfollow(username)
                await new Promise((resolve) => setTimeout(resolve, 1000)) // Rate limit
            }
        },
    },
})