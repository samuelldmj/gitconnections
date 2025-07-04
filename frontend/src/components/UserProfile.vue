<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps(['user'])
const emit = defineEmits(['unfollow'])

const handleUnfollow = () => {
    emit('unfollow', props.user.login)
}
</script>

<template>
    <div class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200">
        <img :src="user.avatar_url" :alt="user.login" class="w-16 h-16 rounded-full mx-auto mb-2" />
        <h3 class="text-center font-semibold text-gray-800">{{ user.login }}</h3>
        <a :href="`https://github.com/${user.login}`" target="_blank"
            class="block text-center text-blue-600 hover:text-blue-800 mb-2">Profile</a>
        <button @click="handleUnfollow"
            class="bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600 transition duration-200 w-full">
            Unfollow
        </button>
    </div>
</template>