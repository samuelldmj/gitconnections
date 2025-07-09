import { ref, watchEffect } from 'vue';
import { defineStore } from 'pinia';

/**
 * Theme Store - handles light/dark mode state using Vue reactivity + Pinia
 */
export const useThemeStore = defineStore('theme', () => {
    /**
     * ref(): Creates a reactive variable. Changes to it update the UI.
     *
     * This value is computed once at app load:
     *
     * localStorage.getItem('theme') === 'dark'
     *     → returns true if the saved theme is explicitly 'dark'
     *
     * window.matchMedia('(prefers-color-scheme: dark)').matches
     *     → returns true if system preference is dark mode
     *
     * Final result (examples):
     * - If theme in storage is 'dark' → true
     * - If no theme saved & system prefers dark → true
     * - If theme is 'light' → false
     */
    const isDarkMode = ref(
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    /**
     * watchEffect(): Runs automatically whenever any reactive value inside changes.
     *
     * - Adds or removes the `dark` class on the <html> element.
     *   Tailwind's dark mode uses this class to activate `dark:` styles.
     *
     * - Saves the theme to localStorage so it persists on reload.
     *
     * Examples:
     * - isDarkMode.value = true → <html class="dark">, localStorage = 'dark'
     * - isDarkMode.value = false → <html> (no dark class), localStorage = 'light'
     */
    watchEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode.value);
        localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
    });

    /**
     * toggleTheme(): Action to switch between dark and light mode.
     * - Flips the value of isDarkMode.
     * - Triggers watchEffect automatically.
     *
     * Example:
     * - isDarkMode was true → becomes false
     */
    const toggleTheme = () => {
        isDarkMode.value = !isDarkMode.value;
    };

    // Expose state and actions for use in components
    return { isDarkMode, toggleTheme };
});
