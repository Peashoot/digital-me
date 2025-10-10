<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4 safe-bottom">
    <div class="w-full max-w-md">
      <!-- Logo and Title -->
      <div class="text-center mb-8 fade-in">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-4">
          <svg class="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {{ appTitle }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          您的智能对话伙伴
        </p>
      </div>

      <!-- Login Card -->
      <div class="card p-6 sm:p-8 slide-up">
        <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          欢迎回来
        </h2>

        <!-- GitHub Login Button -->
        <button
          @click="handleGitHubLogin"
          :disabled="loading"
          class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium shadow-md hover:shadow-lg active:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-touch"
        >
          <!-- GitHub Icon -->
          <svg v-if="!loading" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>

          <!-- Loading Spinner -->
          <svg v-else class="w-6 h-6 spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>

          <span class="text-base sm:text-lg">
            {{ loading ? '正在登录...' : '使用 GitHub 登录' }}
          </span>
        </button>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg fade-in">
          <p class="text-red-600 dark:text-red-400 text-sm text-center">
            {{ error }}
          </p>
        </div>

        <!-- Info Text -->
        <div class="mt-6 text-center">
          <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            登录即表示您同意我们的
            <a href="#" class="text-primary-600 hover:text-primary-700 underline">服务条款</a>
            和
            <a href="#" class="text-primary-600 hover:text-primary-700 underline">隐私政策</a>
          </p>
        </div>
      </div>

      <!-- Features List -->
      <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="text-center fade-in" style="animation-delay: 0.1s">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow mb-2">
            <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">快速响应</p>
        </div>

        <div class="text-center fade-in" style="animation-delay: 0.2s">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow mb-2">
            <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">安全可靠</p>
        </div>

        <div class="text-center fade-in" style="animation-delay: 0.3s">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow mb-2">
            <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">多端同步</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const appTitle = import.meta.env.VITE_APP_TITLE || 'Digital Me'
const loading = computed(() => userStore.loading)
const error = ref(null)

const handleGitHubLogin = async () => {
  error.value = null

  try {
    const result = await userStore.loginWithGitHub()

    if (!result.success) {
      error.value = result.error || '登录失败，请重试'
    }
    // If successful, OAuth will redirect automatically
  } catch (err) {
    console.error('Login error:', err)
    error.value = '登录过程中发生错误，请重试'
  }
}
</script>

<style scoped>
/* Additional component-specific styles if needed */
</style>
