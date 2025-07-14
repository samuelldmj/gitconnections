<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            :class="{ 'bg-white': !themeStore.isDarkMode, 'bg-gray-800': themeStore.isDarkMode }">
            <h3 class="text-lg font-medium mb-4"
                :class="{ 'text-gray-900': !themeStore.isDarkMode, 'text-white': themeStore.isDarkMode }">
                {{ title }}
            </h3>
            <p class="mb-6"
                :class="{ 'text-gray-600': !themeStore.isDarkMode, 'text-gray-300': themeStore.isDarkMode }">
                {{ message }}
            </p>
            <div class="flex justify-end space-x-3">
                <button @click="$emit('cancel')" class="px-4 py-2 rounded-md" :class="{
                    'text-gray-700 hover:bg-gray-100': !themeStore.isDarkMode,
                    'text-gray-200 hover:bg-gray-700': themeStore.isDarkMode
                }">
                    Cancel
                </button>
                <button @click="$emit('confirm')" class="px-4 py-2 rounded-md text-white" :class="{
                    'bg-red-600 hover:bg-red-700': !themeStore.isDarkMode,
                    'bg-red-700 hover:bg-red-800': themeStore.isDarkMode
                }">
                    Confirm
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme';

defineProps({
    title: {
        type: String,
        default: 'Confirm Action'
    },
    message: {
        type: String,
        default: 'Are you sure you want to perform this action?'
    }
});

const themeStore = useThemeStore();
</script>