<script setup>
import { ref, onMounted, computed, watch, watchEffect, triggerRef, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '@/stores/theme';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { useVirtualList } from '@vueuse/core';
import { debounce } from 'lodash';

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const { complete } = inject('globalLoading');

// Reactive state
const userProfile = ref(null);
const nonFollowers = ref([]);
const followers = ref([]);
const whitelist = ref([]);
const loading = ref(false);
const error = ref(null);
const showConfirm = ref(false);
const activeTab = ref('nonFollowers');
const selectedUsers = ref(new Set());
const loadTimeout = ref(false);
const LOAD_TIMEOUT_MS = 10000;
const totalStars = ref(0);
const isSidebarOpen = ref(false); // For mobile sidebar toggle

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 30;
const isLoadingMore = ref(false);

// Computed properties
const currentUsers = computed(() => {
    const users = activeTab.value === 'nonFollowers' ? nonFollowers.value :
        activeTab.value === 'followers' ? followers.value : whitelist.value;
    console.log(`Current users for tab ${activeTab.value}:`, users);
    return users;
});

// Virtual scroll setup (kept for future debugging)
// const containerRef = ref(null);
// const { list: virtualList, containerProps, wrapperProps } = useVirtualList(currentUsers, {
//     itemHeight: 72,
//     overscan: 10,
// });
// watchEffect(() => {
//     console.log('currentUsers:', currentUsers.value);
//     console.log('virtualList:', virtualList.value);
//     console.log('containerRef:', containerRef.value?.getBoundingClientRect());
//     if (virtualList.value.length > 0) {
//         console.log('virtualList first item:', virtualList.value[0]);
//     }
// });

const bodyClasses = computed(() =>
    themeStore.isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'
);

// Whitelist management
const isWhitelisted = (username) => {
    return whitelist.value.some(user => user.login === username);
};

const addToWhitelist = (username) => {
    if (!isWhitelisted(username)) {
        const userToAdd = nonFollowers.value.find(u => u.login === username) ||
            followers.value.find(u => u.login === username) ||
            { login: username, avatar_url: `https://github.com/${username}.png` };
        whitelist.value.push(userToAdd);
        localStorage.setItem('whitelist', JSON.stringify(whitelist.value));
    }
};

const removeFromWhitelist = (username) => {
    whitelist.value = whitelist.value.filter(user => user.login !== username);
    localStorage.setItem('whitelist', JSON.stringify(whitelist.value));
};

// Selection handling
const toggleUserSelection = (username) => {
    if (selectedUsers.value.has(username)) {
        selectedUsers.value.delete(username);
    } else {
        selectedUsers.value.add(username);
    }
};

const selectAllUsers = () => {
    const users = activeTab.value === 'nonFollowers' ? nonFollowers.value :
        activeTab.value === 'followers' ? followers.value : [];
    users.forEach(user => selectedUsers.value.add(user.login));
};

// Pagination controls with debouncing
const loadPage = debounce(async (page) => {
    try {
        isLoadingMore.value = true;
        error.value = null;
        currentPage.value = page;

        if (activeTab.value === 'followers') {
            const data = await authStore.getFollowers(page, itemsPerPage);
            followers.value = data.map(user => ({
                login: user.login,
                avatar_url: user.avatar_url,
                id: user.id,
            }));
            triggerRef(followers);
            console.log('Normalized followers:', followers.value);
        } else if (activeTab.value === 'nonFollowers') {
            nonFollowers.value = await authStore.getNonFollowers(page, itemsPerPage);
            triggerRef(nonFollowers);
            console.log('Fetched non-followers:', nonFollowers.value);
        }
    } catch (err) {
        error.value = err.message;
        console.error('Load page error:', err);
    } finally {
        isLoadingMore.value = false;
    }
}, 300);

// Data fetching
onMounted(async () => {
    document.body.className = bodyClasses.value;

    const timeoutId = setTimeout(() => {
        loadTimeout.value = true;
    }, LOAD_TIMEOUT_MS);

    if (!authStore.isAuthenticated || !authStore.token) {
        router.push('/login');
        return;
    }

    loading.value = true;
    try {
        const [profile, starsData] = await Promise.all([
            authStore.getUserProfile(),
            authStore.getUserStars()
        ]);

        totalStars.value = starsData.totalStars;
        userProfile.value = profile;

        await loadPage(1);

        const savedWhitelist = localStorage.getItem('whitelist');
        if (savedWhitelist) {
            whitelist.value = JSON.parse(savedWhitelist);
            triggerRef(whitelist);
        }

        complete();
    } catch (error) {
        console.error('Error fetching data:', error);
        authStore.logout();
        router.push('/login');
    } finally {
        clearTimeout(timeoutId);
        loading.value = false;
    }
});

// Watch for tab changes to reset pagination
watch(activeTab, () => {
    currentPage.value = 1;
    loadPage(1);
});

// Actions
const handleUnfollow = async (username) => {
    if (isWhitelisted(username)) {
        alert('Cannot unfollow whitelisted users');
        return;
    }

    try {
        await authStore.unfollow(username);
        nonFollowers.value = nonFollowers.value.filter(user => user.login !== username);
        followers.value = followers.value.filter(user => user.login !== username);
        triggerRef(followers);
        triggerRef(nonFollowers);
    } catch (error) {
        console.error('Error unfollowing:', error);
    }
};

const handleUnfollowAll = async () => {
    showConfirm.value = false;
    loading.value = true;
    try {
        const toUnfollow = [...selectedUsers.value].filter(
            username => !isWhitelisted(username)
        );

        await authStore.unfollowAll(toUnfollow);
        nonFollowers.value = nonFollowers.value.filter(
            user => !selectedUsers.value.has(user.login));
        followers.value = followers.value.filter(
            user => !selectedUsers.value.has(user.login));
        triggerRef(followers);
        triggerRef(nonFollowers);
        selectedUsers.value.clear();
    } catch (error) {
        console.error('Error unfollowing all:', error);
    } finally {
        loading.value = false;
    }
};

const logout = () => {
    authStore.logout();
    router.push('/login');
};

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
    <div class="min-h-screen" :class="{ 'bg-gray-100': !themeStore.isDarkMode, 'bg-gray-900': themeStore.isDarkMode }">
        <!-- Loading State -->
        <div v-if="loading" class="text-center p-4 sm:p-10">
            <LoadingSpinner v-if="!loadTimeout" />
            <div v-else class="text-red-500">
                Unable to load data. Please try again later.
                <button @click="router.go(0)" class="text-blue-500 underline">Refresh</button>
            </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="text-red-500 text-center p-4 sm:p-10">
            Error loading data: {{ error }}
            <button @click="loadPage(currentPage)" class="text-blue-500 underline">Retry</button>
        </div>

        <!-- Empty Profile State -->
        <div v-else-if="!userProfile" class="text-center p-4 sm:p-10"
            :class="{ 'text-gray-500': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
            Loading profile...
        </div>

        <!-- Main Content -->
        <div v-else class="flex flex-col md:flex-row mt-1 rounded-sm">
            <!-- Mobile Sidebar Toggle Button -->
            <div class="md:hidden p-4">
                <button @click="toggleSidebar"
                    class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>

            <!-- Sidebar User Card -->
            <div :class="{
                'w-full md:w-64 p-4 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:sticky md:top-0 md:h-screen md:transform-none': true,
                'translate-x-0': isSidebarOpen,
                '-translate-x-full': !isSidebarOpen,
                'bg-white': !themeStore.isDarkMode,
                'bg-gray-800': themeStore.isDarkMode
            }">
                <div class="flex flex-col items-center h-full">
                    <!-- Close Button for Mobile -->
                    <button @click="toggleSidebar"
                        class="md:hidden self-end p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
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
                        :class="{ 'bg-red-600 text-white hover:bg-red-700': !themeStore.isDarkMode, 'bg-red-700 text-white hover:bg-red-800': themeStore.isDarkMode }">
                        Logout
                    </button>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="flex-1 p-4 sm:p-6">
                <h2 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6"
                    :class="{ 'text-gray-800': !themeStore.isDarkMode, 'text-white': themeStore.isDarkMode }">
                    Dashboard
                </h2>

                <!-- Tab Navigation -->
                <div class="flex border-b mb-4 overflow-x-auto"
                    :class="{ 'border-gray-200': !themeStore.isDarkMode, 'border-gray-700': themeStore.isDarkMode }">
                    <button v-for="tab in ['nonFollowers', 'followers', 'whitelist']" :key="tab"
                        @click="activeTab = tab" class="px-3 sm:px-4 py-2 font-medium capitalize whitespace-nowrap"
                        :class="{
                            'text-blue-600 border-b-2 border-blue-600': activeTab === tab && !themeStore.isDarkMode,
                            'text-blue-400 border-b-2 border-blue-400': activeTab === tab && themeStore.isDarkMode,
                            'text-gray-500': activeTab !== tab && !themeStore.isDarkMode,
                            'text-gray-400': activeTab !== tab && themeStore.isDarkMode
                        }">
                        {{ tab }}
                    </button>
                </div>

                <!-- Table Container -->
                <div class="overflow-x-auto" style="max-height: 60vh;">
                    <table class="min-w-full divide-y"
                        :class="{ 'divide-gray-200': !themeStore.isDarkMode, 'divide-gray-700': themeStore.isDarkMode }">
                        <thead :class="{ 'bg-gray-50': !themeStore.isDarkMode, 'bg-gray-800': themeStore.isDarkMode }">
                            <tr>
                                <th v-if="activeTab !== 'whitelist'"
                                    class="px-2 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    :class="{ 'text-gray-500': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
                                    <input type="checkbox" class="h-4 w-4 rounded"
                                        :checked="selectedUsers.size === currentUsers.length && currentUsers.length > 0"
                                        @change="selectedUsers.size === currentUsers.length ? selectedUsers.clear() : selectAllUsers()"
                                        :class="{ 'border-gray-300 text-blue-600': !themeStore.isDarkMode, 'border-gray-600 text-blue-500': themeStore.isDarkMode }" />
                                </th>
                                <th class="px-2 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    :class="{ 'text-gray-500': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
                                    {{ activeTab === 'whitelist' ? 'Whitelisted Users' : 'Username' }}
                                </th>
                                <th class="px-2 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    :class="{ 'text-gray-500': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="currentUsers.length === 0 && !error" class="text-center py-4">
                                <td colspan="3"
                                    :class="{ 'text-gray-500': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
                                    <span v-if="activeTab === 'nonFollowers'">No non-followers found!</span>
                                    <span v-else-if="activeTab === 'followers'">No followers found!</span>
                                    <span v-else>Your whitelist is empty!</span>
                                </td>
                            </tr>
                            <tr v-for="user in currentUsers" :key="user.login" :class="{
                                'divide-gray-200': !themeStore.isDarkMode,
                                'divide-gray-700': themeStore.isDarkMode,
                                'bg-white': !themeStore.isDarkMode,
                                'bg-gray-800': themeStore.isDarkMode
                            }">
                                <td v-if="activeTab !== 'whitelist'"
                                    class="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                    <input type="checkbox" class="h-4 w-4 rounded"
                                        :checked="selectedUsers.has(user.login)"
                                        @change="toggleUserSelection(user.login)" :disabled="isWhitelisted(user.login)"
                                        :class="{ 'border-gray-300 text-blue-600': !themeStore.isDarkMode, 'border-gray-600 text-blue-500': themeStore.isDarkMode }" />
                                </td>
                                <td class="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <img class="h-8 w-8 sm:h-10 sm:w-10 rounded-full" :src="user.avatar_url"
                                            :alt="user.login" />
                                        <div class="ml-2 sm:ml-4">
                                            <div class="text-sm font-medium"
                                                :class="{ 'text-gray-900': !themeStore.isDarkMode, 'text-white': themeStore.isDarkMode }">
                                                {{ user.login }}
                                                <span v-if="isWhitelisted(user.login)"
                                                    class="ml-2 text-xs px-2 py-1 rounded-full"
                                                    :class="{ 'bg-green-100 text-green-800': !themeStore.isDarkMode, 'bg-green-800 text-green-100': themeStore.isDarkMode }">
                                                    Whitelisted
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap space-x-1 sm:space-x-2">
                                    <button v-if="activeTab !== 'whitelist' && !isWhitelisted(user.login)"
                                        @click="handleUnfollow(user.login)"
                                        class="text-red-600 hover:text-red-900 text-sm">
                                        Unfollow
                                    </button>
                                    <button v-if="activeTab !== 'whitelist' && !isWhitelisted(user.login)"
                                        @click="addToWhitelist(user.login)"
                                        class="text-green-600 hover:text-green-900 text-sm">
                                        Whitelist
                                    </button>
                                    <button v-if="activeTab === 'whitelist'" @click="removeFromWhitelist(user.login)"
                                        class="text-red-600 hover:text-red-900 text-sm">
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination Controls -->
                <div class="flex justify-center mt-4 sm:mt-6">
                    <div class="flex items-center space-x-2">
                        <button @click="loadPage(currentPage - 1)" :disabled="currentPage === 1"
                            class="px-2 sm:px-3 py-1 rounded-md border" :class="{
                                'bg-gray-200 cursor-not-allowed': currentPage === 1,
                                'hover:bg-gray-100 dark:hover:bg-gray-700': currentPage > 1,
                                'text-gray-700': !themeStore.isDarkMode,
                                'text-gray-300': themeStore.isDarkMode
                            }">
                            < </button>
                                <template v-for="page in [currentPage - 1, currentPage, currentPage + 1]">
                                    <button
                                        v-if="page > 0 && (authStore.pagination[activeTab]?.hasMore || page <= currentPage)"
                                        @click="loadPage(page)" class="px-2 sm:px-3 py-1 rounded-md border" :class="{
                                            'bg-blue-500 text-white': page === currentPage,
                                            'hover:bg-gray-100 dark:hover:bg-gray-700': page !== currentPage,
                                            'text-gray-700': !themeStore.isDarkMode && page !== currentPage,
                                            'text-gray-300': themeStore.isDarkMode && page !== currentPage
                                        }">
                                        {{ page }}
                                    </button>
                                </template>
                                <button @click="loadPage(currentPage + 1)"
                                    :disabled="!authStore.pagination[activeTab]?.hasMore"
                                    class="px-2 sm:px-3 py-1 rounded-md border" :class="{
                                        'bg-gray-200 cursor-not-allowed': !authStore.pagination[activeTab]?.hasMore,
                                        'hover:bg-gray-100 dark:hover:bg-gray-700': authStore.pagination[activeTab]?.hasMore,
                                        'text-gray-700': !themeStore.isDarkMode,
                                        'text-gray-300': themeStore.isDarkMode
                                    }">
                                    >
                                </button>
                    </div>
                </div>

                <!-- Batch Actions -->
                <div v-if="selectedUsers.size > 0 && activeTab !== 'whitelist'"
                    class="mt-4 space-x-2 flex flex-wrap gap-2">
                    <button @click="showConfirm = true"
                        class="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-md font-medium hover:bg-red-700 transition text-sm">
                        Unfollow Selected ({{ selectedUsers.size }})
                    </button>
                    <button @click="selectedUsers.forEach(user => addToWhitelist(user))"
                        class="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-md font-medium hover:bg-green-700 transition text-sm">
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