<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4">
    <div class="text-center">
      <!-- Loading State -->
      <div v-if="!error" class="fade-in">
        <div
          class="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-6">
          <svg class="w-12 h-12 text-primary-500 spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          正在登录...
        </h2>
        <p class="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          请稍候，我们正在为您完成登录
        </p>
      </div>

      <!-- Error State -->
      <div v-else class="fade-in">
        <div
          class="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-2xl shadow-lg mb-6">
          <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          登录失败
        </h2>
        <p class="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-6">
          {{ error }}
        </p>
        <button @click="goToLogin"
          class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 btn-touch">
          返回登录页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const error = ref(null)

const goToLogin = () => {
  router.push({ name: 'Login' })
}

onMounted(async () => {
  try {
    // Supabase will automatically handle the OAuth callback
    // and update the auth state via onAuthStateChange listener

    // Check for errors in URL params
    const errorParam = route.query.error
    const errorDescription = route.query.error_description

    if (errorParam) {
      error.value = errorDescription || '登录过程中发生错误'
      return
    }

    // Wait a moment for the auth state to update
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if user is now logged in
    if (userStore.isLoggedIn) {
      // Get the redirect path from query params or default to home
      const redirectPath = route.query.redirect || '/'
      router.replace(redirectPath)
    } else {
      error.value = '登录未完成，请重试'
    }
  } catch (err) {
    console.error('Auth callback error:', err)
    error.value = '处理登录回调时发生错误'
  }
})
</script>

<style scoped>
/* Additional component-specific styles if needed */
</style>
