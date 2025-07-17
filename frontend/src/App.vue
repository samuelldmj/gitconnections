<script setup>
import Header from './components/layouts/Header.vue';
import Footer from './components/layouts/Footer.vue';
import LoadingSpinner from './components/LoadingSpinner.vue';
import { ref, provide, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Global loading state
const globalLoading = ref(false);
const loadingMessage = ref('');
const loadingProgress = ref(0);

// Watch for route changes to handle dashboard loading
watch(() => router.currentRoute.value, (to) => {
  if (to.path === '/dashboard' && authStore.isAuthenticated) {
    loadingMessage.value = 'Loading your dashboard...';
    loadingProgress.value = 90;
  }
});

// Making these available to all child components
provide('globalLoading', {
  state: globalLoading,
  message: loadingMessage,
  progress: loadingProgress,
  complete: () => {
    loadingProgress.value = 100;
    setTimeout(() => {
      globalLoading.value = false;
      loadingMessage.value = '';
      loadingProgress.value = 0;
    }, 500); // Brief pause to show completion
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
    <!-- Global Loading Overlay -->
    <div v-if="globalLoading"
      class="fixed inset-0 z-50 bg-black bg-opacity-70 flex flex-col items-center justify-center">
      <LoadingSpinner class="w-16 h-16" />
      <p class="mt-4 text-white text-lg">{{ loadingMessage }}</p>
      <div v-if="loadingProgress > 0" class="w-64 mt-4 bg-gray-200 rounded-full h-2.5">
        <div class="bg-blue-600 h-2.5 rounded-full" :style="`width: ${loadingProgress}%`"></div>
      </div>
    </div>

    <Header />
    <router-view class="flex-1" />
    <Footer />
  </div>
</template>