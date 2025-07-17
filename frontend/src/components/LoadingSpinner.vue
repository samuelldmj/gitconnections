<template>
    <div class="flex justify-center items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
            :class="{ 'border-blue-500': !themeStore.isDarkMode, 'border-blue-400': themeStore.isDarkMode }"></div>
    </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme';
const themeStore = useThemeStore();
</script>

<style scoped>
.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>