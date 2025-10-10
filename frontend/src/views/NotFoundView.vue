<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4">
    <div class="text-center max-w-md">
      <!-- 404 Animation -->
      <div class="mb-8 fade-in">
        <div class="text-8xl sm:text-9xl font-bold text-primary-500 dark:text-primary-400 mb-4">
          404
        </div>

        <!-- Illustration -->
        <div class="inline-flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-6">
          <svg class="w-20 h-20 sm:w-24 sm:h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <!-- Text Content -->
      <div class="fade-in" style="animation-delay: 0.1s">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          页面未找到
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base">
          抱歉，您访问的页面不存在或已被移除。
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            @click="goBack"
            class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all btn-touch"
          >
            返回上一页
          </button>
          <button
            @click="goHome"
            class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all btn-touch"
          >
            回到首页
          </button>
        </div>
      </div>

      <!-- Popular Links -->
      <div class="mt-12 fade-in" style="animation-delay: 0.2s">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          您可能想要：
        </p>
        <div class="flex flex-wrap justify-center gap-2">
          <a
            href="/"
            class="px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            聊天页面
          </a>
          <a
            href="/profile"
            class="px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            个人资料
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push({ name: 'Home' })
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
