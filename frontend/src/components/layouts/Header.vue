<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleAuthAction = () => {
    if (!authStore.isAuthenticated) router.push('/login')
    else authStore.logout()
}

onMounted(() => {
    // Ensure token is loaded from localStorage on mount
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
        authStore.token = storedToken
        authStore.isAuthenticated = true
    }
})
</script>

<template>
    <header
        class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center shadow-lg">
        <div class="flex items-center">
            <img src="/github-logo.png" alt="GitConnections Logo" class="w-10 h-10 mr-2" />
            <h1 class="text-2xl font-bold">GitConnections</h1>
        </div>
        <div>
            <button @click="handleAuthAction"
                class="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition duration-200">
                {{ authStore.isAuthenticated ? 'Sign Out' : 'Sign in with GitHub' }}
            </button>
            <a href="#" class="ml-4 text-sm underline hover:text-gray-200">Learn how we use your data</a>
        </div>
    </header>
</template>