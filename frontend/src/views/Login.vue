<script setup>
import { ref, onMounted, computed, inject } from 'vue';  // Added missing imports
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import githubMark from '../assets/github-mark.png';
import githubMarkWhite from '../assets/github-mark-white.png';

const router = useRouter();
const authStore = useAuthStore();
const error = ref('');

// Safely get dark mode with fallback
const darkMode = inject('darkMode', {
    isDarkMode: ref(false)
});

const githubLogo = computed(() =>
    darkMode.isDarkMode.value ? githubMarkWhite : githubMark
);

const handleGitHubLogin = () => {
    window.location.href = `${import.meta.env.VITE_GITHUB_OAUTH_URL}?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID
        }&redirect_uri=${import.meta.env.VITE_REDIRECT_URI
        }&scope=user:follow&response_type=code`;
};

onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        fetch(`${import.meta.env.VITE_API_URL}/auth/github`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    authStore.loginWithGitHub();
                    router.push('/dashboard');
                }
            })
            .catch(err => {
                error.value = 'Login failed. Please try again.';
            });
    }
});
</script>

<template>
    <div
        class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md transition-colors duration-300">
            <img :src="githubLogo" alt="GitHub Logo" class="w-20 h-20 mx-auto mb-4" />
            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Sign in with GitHub</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
                🔒 We only request:<br>
                - Read your followers list<br>
                - Unfollow on your behalf (optional)
            </p>
            <button @click="handleGitHubLogin"
                class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-md font-semibold transition w-full">
                Sign in with GitHub
            </button>
            <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
        </div>
    </div>
</template>