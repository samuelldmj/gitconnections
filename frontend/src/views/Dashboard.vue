<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '@/stores/theme'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

// Reactive state
const userProfile = ref(null)
const nonFollowers = ref([])
const followers = ref([])
const whitelist = ref([])
const loading = ref(false)
const showConfirm = ref(false)
const activeTab = ref('nonFollowers')
const selectedUsers = ref(new Set())
const loadTimeout = ref(false)
const LOAD_TIMEOUT_MS = 10000
const totalStars = ref(0)

// Computed property for current tab's users
const currentUsers = computed(() => {
    switch (activeTab.value) {
        case 'nonFollowers': return nonFollowers.value
        case 'followers': return followers.value
        case 'whitelist': return whitelist.value
        default: return []
    }
})

// Dark mode handling
const bodyClasses = computed(() =>
    themeStore.isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'
)

// Whitelist management
const addToWhitelist = (username) => {
    if (!whitelist.value.some(user => user.login === username)) {
        const userToAdd = nonFollowers.value.find(u => u.login === username) ||
            followers.value.find(u => u.login === username) ||
            { login: username, avatar_url: `https://github.com/${username}.png` }

        whitelist.value.push(userToAdd)
        localStorage.setItem('whitelist', JSON.stringify(whitelist.value))
    }
}

const removeFromWhitelist = (username) => {
    whitelist.value = whitelist.value.filter(user => user.login !== username)
    localStorage.setItem('whitelist', JSON.stringify(whitelist.value))
}

// Selection handling
const toggleUserSelection = (username) => {
    if (selectedUsers.value.has(username)) {
        selectedUsers.value.delete(username)
    } else {
        selectedUsers.value.add(username)
    }
}

const selectAllUsers = () => {
    const users = activeTab.value === 'nonFollowers' ? nonFollowers.value :
        activeTab.value === 'followers' ? followers.value : []

    users.forEach(user => selectedUsers.value.add(user.login))
}

// Data fetching
onMounted(async () => {
    document.body.className = bodyClasses.value

    const timeoutId = setTimeout(() => {
        loadTimeout.value = true
    }, LOAD_TIMEOUT_MS)

    if (!authStore.isAuthenticated || !authStore.token) {
        router.push('/login')
        return
    }

    loading.value = true
    try {
        const [profile, nonFollowersData, followersData, starsData] = await Promise.all([
            authStore.getUserProfile(),
            authStore.getNonFollowers(),
            authStore.getFollowers(),
            authStore.getUserStars()
        ]);

        totalStars.value = starsData.totalStars;
        userProfile.value = profile
        nonFollowers.value = nonFollowersData
        followers.value = followersData

        // Initialize whitelist from localStorage
        const savedWhitelist = localStorage.getItem('whitelist')
        if (savedWhitelist) {
            whitelist.value = JSON.parse(savedWhitelist)
        }
    } catch (error) {
        console.error('Error fetching data:', error)
        authStore.logout()
        router.push('/login')
    } finally {
        clearTimeout(timeoutId)
        loading.value = false
    }
})

// Actions
const handleUnfollow = async (username) => {
    await authStore.unfollow(username)
    nonFollowers.value = nonFollowers.value.filter(user => user.login !== username)
    followers.value = followers.value.filter(user => user.login !== username)
}

const handleUnfollowAll = async () => {
    showConfirm.value = false
    loading.value = true
    try {
        await authStore.unfollowAll([...selectedUsers.value])
        nonFollowers.value = nonFollowers.value.filter(user => !selectedUsers.value.has(user.login))
        followers.value = followers.value.filter(user => !selectedUsers.value.has(user.login))
        selectedUsers.value.clear()
    } catch (error) {
        console.error('Error unfollowing all:', error)
    } finally {
        loading.value = false
    }
}

const logout = () => {
    authStore.logout()
    router.push('/login')
}
</script>

<template>
    <div class="min-h-screen" :class="{ 'bg-gray-100': !themeStore.isDarkMode, 'bg-gray-900': themeStore.isDarkMode }">
        <!-- Loading State -->
        <div v-if="loading" class="text-center p-10">
            <LoadingSpinner v-if="!loadTimeout" />
            <div v-else class="text-red-500">
                Unable to load data. Please try again later.
                <button @click="router.go(0)" class="text-blue-500 underline">Refresh</button>
            </div>
        </div>

        <!-- Empty Profile State -->
        <div v-else-if="!userProfile" class="text-center p-10"
            :class="{ 'text-gray-500': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
            Loading profile...
        </div>

        <!-- Main Content -->
        <div v-else class="flex mt-1 rounded-sm">
            <!-- Sidebar User Card -->
            <div class="w-64 p-4 sticky top-0 h-screen"
                :class="{ 'bg-white': !themeStore.isDarkMode, 'bg-gray-800': themeStore.isDarkMode }">
                <div class="flex flex-col items-center h-full">
                    <img :src="userProfile.avatar_url" class="w-24 h-24 rounded-full mb-4" />
                    <h3 class="text-lg font-bold text-center"
                        :class="{ 'text-gray-800': !themeStore.isDarkMode, 'text-white': themeStore.isDarkMode }">
                        {{ userProfile.login }}
                    </h3>
                    <p class="text-sm text-center mb-6"
                        :class="{ 'text-gray-600': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
                        {{ userProfile.name || 'No name provided' }}
                    </p>

                    <div class="w-full space-y-2">
                        <div class="flex justify-between">
                            <span
                                :class="{ 'text-gray-600': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
                                Followers:
                            </span>
                            <span class="font-medium">{{ userProfile.followers }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span
                                :class="{ 'text-gray-600': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
                                Following:
                            </span>
                            <span class="font-medium">{{ userProfile.following }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span
                                :class="{ 'text-gray-600': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
                                Repos:
                            </span>
                            <span class="font-medium">{{ userProfile.public_repos }}</span>
                        </div>

                        <div class="flex justify-between">
                            <span
                                :class="{ 'text-gray-600': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
                                Total Stars:
                            </span>
                            <span class="font-medium">{{ totalStars }}</span>
                        </div>
                    </div>

                    <button @click="logout" class="mt-auto w-full py-2 rounded-md"
                        :class="{ 'bg-red-600 text-white': !themeStore.isDarkMode, 'bg-red-700 text-white': themeStore.isDarkMode }">
                        Logout
                    </button>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="flex-1 p-6">
                <h2 class="text-3xl font-bold mb-6"
                    :class="{ 'text-gray-800': !themeStore.isDarkMode, 'text-white': themeStore.isDarkMode }">
                    Dashboard
                </h2>

                <!-- Tab Navigation -->
                <div class="flex border-b mb-4"
                    :class="{ 'border-gray-200': !themeStore.isDarkMode, 'border-gray-700': themeStore.isDarkMode }">
                    <button v-for="tab in ['nonFollowers', 'followers', 'whitelist']" :key="tab"
                        @click="activeTab = tab" class="px-4 py-2 font-medium capitalize" :class="{
                            'text-blue-600 border-b-2 border-blue-600': activeTab === tab && !themeStore.isDarkMode,
                            'text-blue-400 border-b-2 border-blue-400': activeTab === tab && themeStore.isDarkMode,
                            'text-gray-500': activeTab !== tab && !themeStore.isDarkMode,
                            'text-gray-400': activeTab !== tab && themeStore.isDarkMode
                        }">
                        {{ tab }}
                    </button>
                </div>

                <!-- Table for Current Tab -->
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y"
                        :class="{ 'divide-gray-200': !themeStore.isDarkMode, 'divide-gray-700': themeStore.isDarkMode }">
                        <thead :class="{ 'bg-gray-50': !themeStore.isDarkMode, 'bg-gray-800': themeStore.isDarkMode }">
                            <tr>
                                <th v-if="activeTab !== 'whitelist'"
                                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    :class="{ 'text-gray-500': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
                                    <input type="checkbox" class="h-4 w-4 rounded"
                                        :checked="selectedUsers.size === currentUsers.length && currentUsers.length > 0"
                                        @change="selectedUsers.size === currentUsers.length ? selectedUsers.clear() : selectAllUsers()"
                                        :class="{ 'border-gray-300 text-blue-600': !themeStore.isDarkMode, 'border-gray-600 text-blue-500': themeStore.isDarkMode }" />
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    :class="{ 'text-gray-500': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
                                    {{ activeTab === 'whitelist' ? 'Whitelisted Users' : 'Username' }}
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    :class="{ 'text-gray-500': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y"
                            :class="{ 'divide-gray-200': !themeStore.isDarkMode, 'divide-gray-700': themeStore.isDarkMode, 'bg-white': !themeStore.isDarkMode, 'bg-gray-800': themeStore.isDarkMode }">
                            <tr v-for="user in currentUsers" :key="user.id">
                                <td v-if="activeTab !== 'whitelist'" class="px-6 py-4 whitespace-nowrap">
                                    <input type="checkbox" class="h-4 w-4 rounded"
                                        :checked="selectedUsers.has(user.login)"
                                        @change="toggleUserSelection(user.login)"
                                        :class="{ 'border-gray-300 text-blue-600': !themeStore.isDarkMode, 'border-gray-600 text-blue-500': themeStore.isDarkMode }" />
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <img class="h-10 w-10 rounded-full" :src="user.avatar_url" :alt="user.login" />
                                        <div class="ml-4">
                                            <div class="text-sm font-medium"
                                                :class="{ 'text-gray-900': !themeStore.isDarkMode, 'text-white': themeStore.isDarkMode }">
                                                {{ user.login }}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap space-x-2">
                                    <button v-if="activeTab !== 'whitelist'" @click="handleUnfollow(user.login)"
                                        class="text-red-600 hover:text-red-900">
                                        Unfollow
                                    </button>
                                    <button v-if="activeTab !== 'whitelist'" @click="addToWhitelist(user.login)"
                                        class="text-green-600 hover:text-green-900">
                                        Whitelist
                                    </button>
                                    <button v-if="activeTab === 'whitelist'" @click="removeFromWhitelist(user.login)"
                                        class="text-red-600 hover:text-red-900">
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Empty State -->
                <div v-if="currentUsers.length === 0" class="text-center py-10"
                    :class="{ 'text-gray-500': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
                    <span v-if="activeTab === 'nonFollowers'">No non-followers found!</span>
                    <span v-else-if="activeTab === 'followers'">No followers found!</span>
                    <span v-else>Your whitelist is empty!</span>
                </div>

                <!-- Batch Actions -->
                <div v-if="selectedUsers.size > 0 && activeTab !== 'whitelist'" class="mt-4 space-x-2">
                    <button @click="showConfirm = true"
                        class="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition">
                        Unfollow Selected ({{ selectedUsers.size }})
                    </button>
                    <button @click="selectedUsers.forEach(user => addToWhitelist(user))"
                        class="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition">
                        Whitelist Selected
                    </button>
                </div>
            </div>
        </div>

        <!-- Confirmation Dialog -->
        <ConfirmDialog v-if="showConfirm" @confirm="handleUnfollowAll" @cancel="showConfirm = false"
            title="Confirm Unfollow" message="Are you sure you want to unfollow the selected users?" />
    </div>
</template>
