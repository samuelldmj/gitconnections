<script setup>
import Header from './components/layouts/Header.vue';
import Footer from './components/layouts/Footer.vue';
import { ref, provide, watchEffect } from 'vue';

const isDarkMode = ref(
  localStorage.getItem('theme') === 'dark' ||
  (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
);

// Provide the theme to all child components
provide('darkMode', {
  isDarkMode,
  toggle: () => isDarkMode.value = !isDarkMode.value
});

// Watch for changes
watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDarkMode.value);
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
    <Header />
    <router-view class="flex-1" />
    <Footer />
  </div>
</template>