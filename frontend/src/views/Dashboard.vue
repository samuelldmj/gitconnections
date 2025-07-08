<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import UserProfileCard from '../components/UserProfileCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const userProfile = ref(null)
const nonFollowers = ref([])
const loading = ref(false)
const showConfirm = ref(false)

onMounted(async () => {
    if (!authStore.isAuthenticated) router.push('/login')
    else {
        loading.value = true
        try {
            userProfile.value = await authStore.getUserProfile()
            nonFollowers.value = await authStore.getNonFollowers()
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            loading.value = false
        }
    }
})

const handleUnfollow = async (username) => {
    await authStore.unfollow(username)
    nonFollowers.value = nonFollowers.value.filter(user => user.login !== username)
}

const handleUnfollowAll = async () => {
    showConfirm.value = false
    loading.value = true
    try {
        await authStore.unfollowAll(nonFollowers.value.map(user => user.login))
        nonFollowers.value = []
    } catch (error) {
        console.error('Error unfollowing all:', error)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-100">
        <div v-if="loading" class="text-center p-10">
            <LoadingSpinner />
        </div>
        <div v-else-if="!userProfile" class="text-center p-10 text-gray-500">Loading profile...</div>
        <div v-else class="container mx-auto p-6">
            <h2 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
            <div v-if="nonFollowers.length === 0" class="text-center text-gray-500 mb-6">No non-followers!</div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <UserProfileCard v-for="user in nonFollowers" :key="user.id" :user="user" @unfollow="handleUnfollow" />
            </div>
            <button v-if="nonFollowers.length > 0" @click="showConfirm = true"
                class="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 transition duration-200 mt-6">
                Unfollow All
            </button>
            <ConfirmDialog v-if="showConfirm" @confirm="handleUnfollowAll" @cancel="showConfirm = false" />
        </div>
    </div>
</template>