<script setup>
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import githubMark from '../../assets/github-mark.png';
import githubMarkWhite from '../../assets/github-mark-white.png';

const themeStore = useThemeStore();
const logo = computed(() =>
    themeStore.isDarkMode ? githubMarkWhite : githubMark
);
</script>

<template>
    <header class="bg-emerald-700 text-white p-4 shadow-lg">
        <div class="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <div class="flex items-center space-x-4 mb-4 md:mb-0">
                <img :src="logo" alt="Logo" class="w-10 h-10" />
                <h1 class="text-xl md:text-2xl font-bold">GitConnections</h1>
            </div>
            <div class="flex items-center gap-4">
                <button @click="themeStore.toggleTheme" class="flex items-center gap-2">
                    <span>{{ themeStore.isDarkMode ? 'Dark' : 'Light' }}</span>
                    <div class="w-12 h-6 bg-gray-200 rounded-full p-1 transition-all duration-300 dark:bg-gray-600">
                        <div class="w-4 h-4 bg-white rounded-full transition-all duration-300"
                            :class="{ 'translate-x-6': themeStore.isDarkMode }">
                        </div>
                    </div>
                </button>
            </div>
        </div>
    </header>
</template>