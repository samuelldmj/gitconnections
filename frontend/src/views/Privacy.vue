<template>
    <div class="privacy-policy bg-gray-50 dark:bg-gray-900 min-h-screen p-4 md:p-8">
        <div class="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Privacy Policy for GitConnections
            </h1>

            <div class="prose dark:prose-invert max-w-none">
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                    <strong>Last Updated:</strong> July 04, 2025
                </p>

                <p class="text-gray-700 dark:text-gray-300 mb-6">
                    At GitConnections, we prioritize your privacy. This policy explains how we handle your data when you
                    sign in with GitHub.
                </p>

                <section class="mb-8">
                    <h2 class="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Data We Collect
                    </h2>
                    <p class="text-gray-700 dark:text-gray-300 mb-4">
                        When you sign in with GitHub, we request the following permissions:
                    </p>
                    <ul class="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>Read your followers list:</strong> To identify users who don't follow you back.</li>
                        <li><strong>Unfollow on your behalf (optional):</strong> To allow you to unfollow non-followers
                            with one click.</li>
                    </ul>
                    <p class="text-gray-700 dark:text-gray-300 mt-4">
                        We only access the data necessary to provide these features and do not store or share your
                        personal information beyond the GitHub API scope.
                    </p>
                </section>

                <section class="mb-8">
                    <h2 class="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        How We Use Your Data
                    </h2>
                    <ul class="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>Functionality:</strong> We use your followers list to compute non-followers and
                            enable unfollow actions.</li>
                        <li><strong>Security:</strong> Data is processed securely via our backend proxy and is not
                            persisted long-term.</li>
                        <li><strong>No Third-Party Sharing:</strong> We do not sell, rent, or share your data with third
                            parties.</li>
                    </ul>
                </section>

                <section class="mb-8">
                    <h2 class="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Data Retention
                    </h2>
                    <p class="text-gray-700 dark:text-gray-300">
                        We do not store your GitHub data after your session ends or upon sign-out. All processing occurs
                        in-memory during your active use.
                    </p>
                </section>

                <section class="mb-8">
                    <h2 class="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Your Rights
                    </h2>
                    <ul class="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                        <li>You can sign out at any time to revoke access.</li>
                        <li>Review GitHub's <a href="https://github.com/settings/applications"
                                class="text-emerald-600 dark:text-emerald-400 hover:underline">permissions settings</a>
                            to manage or revoke our app's access.</li>
                    </ul>
                </section>

                <section>
                    <h2 class="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Contact Us
                    </h2>
                    <p class="text-gray-700 dark:text-gray-300">
                        For questions, email us at <a href="mailto:support@gitconnections.com"
                            class="text-emerald-600 dark:text-emerald-400 hover:underline">programmerhub@proton.me</a>.
                    </p>
                </section>

                <div class="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6">
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        <em>This policy may update as the app evolves. Check back for changes.</em>
                    </p>
                </div>
            </div>
        </div>

        <div class="text-center mt-8">
            <button @click="goBack"
                class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md transition-colors">
                ← Back to Login
            </button>
        </div>
    </div>



</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
    // Check if we can go back in history
    if (window.history.state.back) {
        router.go(-1)
    } else {
        // Fallback to home if no history
        router.push('/')
    }
}
</script>

<style scoped>
.prose a {
    @apply transition-colors duration-200;
}
</style>