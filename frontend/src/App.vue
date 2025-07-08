<script setup>
import Header from './components/layouts/Header.vue';
import Footer from './components/layouts/Footer.vue';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
    <Header />
    <router-view class="flex-1" />
    <Footer />
  </div>
</template>