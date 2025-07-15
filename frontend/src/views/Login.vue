<script setup>
/*
  Vue 3 <script setup> syntax for cleaner composition API usage.
  This script handles GitHub OAuth login and theme-based logo switching.
*/

import { ref, onMounted, computed } from 'vue';          // Vue composition API helpers
import { useRouter } from 'vue-router';                  // Vue Router for navigation
import { useAuthStore } from '../stores/auth';           // Pinia auth store for user state management
import { useThemeStore } from '@/stores/theme';          // Pinia theme store for dark/light mode state
import githubMark from '../assets/github-mark.png';      // GitHub logo (light mode)
import githubMarkWhite from '../assets/github-mark-white.png'; // GitHub logo (dark mode)

// Create Vue Router instance to programmatically navigate pages
const router = useRouter();

// Create instances of Pinia stores to access shared state and actions
const authStore = useAuthStore();
const themeStore = useThemeStore();

// Reactive variable to hold potential error messages during login process
const error = ref('');

// Computed property that dynamically chooses the GitHub logo image
// based on the current theme (dark mode or light mode).
// When themeStore.isDarkMode is true, show the white logo, else show default.
const githubLogo = computed(() =>
    themeStore.isDarkMode ? githubMarkWhite : githubMark
);

// Function to initiate GitHub OAuth login flow by redirecting
// the browser to GitHub's OAuth authorization endpoint.
// Use environment variables for:
// - OAuth URL
// - Client ID
// - Redirect URI (where GitHub sends user after login)
// Requests "user:follow" scope and expects a code response type.
const handleGitHubLogin = () => {
    window.location.href = `${import.meta.env.VITE_GITHUB_OAUTH_URL}?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID
        }&redirect_uri=${import.meta.env.VITE_REDIRECT_URI
        }&scope=user:follow&response_type=code`;
};

// Lifecycle hook that runs once the component is mounted to the DOM.
// Checks if the URL contains a "code" query parameter (GitHub OAuth code).
// If yes, it exchanges this code with your backend API for an access token.
// Then:
// - If successful, calls authStore.loginWithGitHub() to update auth state
// - Redirects user to the /dashboard route
// - If error occurs, sets the error message to be shown to the user
onMounted(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    console.log('Received code:', code);

    if (code) {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/github`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) throw new Error('Login failed');

            const data = await response.json();

            if (data.token) {
                // Update store
                authStore.token = data.token;
                authStore.isAuthenticated = true;
                localStorage.setItem('token', data.token);

                // Fetch user profile before redirect
                await authStore.getUserProfile();

                // Clear the code from URL
                window.history.replaceState({}, document.title, window.location.pathname);

                // Redirect
                router.push('/dashboard');
            }
        } catch (err) {
            error.value = 'Login failed. Please try again.';
            console.error('Login error:', err);
        }
    }
});
</script>


<template>
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md">
            <div
                class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md transition-colors duration-300">
                <img :src="githubLogo" alt="GitHub Logo" class="w-20 h-20 mx-auto mb-4" />
                <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Sign in with GitHub</h2>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    <strong>We only request:</strong><br>
                    - Read your followers list<br>
                    - Unfollow on your behalf (optional)
                </p>
                <button @click="handleGitHubLogin"
                    class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-sm font-semibold transition w-full">
                    Sign in with GitHub
                </button>
                <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
            </div>
        </div>
    </div>
</template>