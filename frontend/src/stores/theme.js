import { ref, watchEffect } from 'vue';
import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', () => {
    const isDarkMode = ref(
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    watchEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode.value);
        localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
    });

    const toggleTheme = () => {
        isDarkMode.value = !isDarkMode.value;
    };

    return { isDarkMode, toggleTheme };
});