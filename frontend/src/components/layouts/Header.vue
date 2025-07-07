<script setup>
import { inject, computed } from 'vue';
import githubMark from '../../assets/github-mark.png';
import githubMarkWhite from '../../assets/github-mark-white.png';

const { isDarkMode, toggle } = inject('darkMode');
const logo = computed(() => isDarkMode.value ? githubMarkWhite : githubMark);
</script>

<template>
    <header class="bg-emerald-700 text-white p-4 shadow-lg">
        <div class="container mx-auto flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <img :src="logo" alt="Logo" class="w-10 h-10" />
                <h1 class="text-2xl font-bold">GitConnections</h1>
            </div>
            <button @click="toggle" class="flex items-center gap-2">
                <span>{{ isDarkMode ? 'Dark' : 'Light' }}</span>
                <div class="w-12 h-6 bg-gray-200 rounded-full p-1 transition-all duration-300 dark:bg-gray-600">
                    <div class="w-4 h-4 bg-white rounded-full transition-all duration-300"
                        :class="{ 'translate-x-6': isDarkMode }"></div>
                </div>
            </button>
        </div>
    </header>
</template>