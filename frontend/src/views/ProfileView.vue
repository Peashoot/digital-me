<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <MobileHeader
      title="个人资料"
      :show-back-button="true"
      :show-user-menu="false"
      @back-click="goBack"
    />

    <!-- Content -->
    <div class="max-w-2xl mx-auto px-4 py-6 sm:py-8 safe-bottom">
      <!-- Profile Card -->
      <div class="card p-6 sm:p-8 mb-6">
        <!-- Avatar Section -->
        <div class="text-center mb-6">
          <div class="relative inline-block">
            <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mx-auto">
              <img
                v-if="profile?.avatar_url"
                :src="profile.avatar_url"
                :alt="profile.username"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center bg-primary-500 text-white text-3xl sm:text-4xl font-bold"
              >
                {{ profile?.username?.charAt(0).toUpperCase() || 'U' }}
              </div>
            </div>

            <!-- Edit Avatar Button -->
            <button
              @click="editAvatar"
              class="absolute bottom-0 right-0 p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg transition-colors btn-touch"
            >
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <h2 class="mt-4 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {{ profile?.nickname || profile?.username || '未设置昵称' }}
          </h2>
          <p class="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">
            @{{ profile?.username || 'username' }}
          </p>
        </div>

        <!-- Bio -->
        <div v-if="profile?.bio" class="text-center mb-6">
          <p class="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            {{ profile.bio }}
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-primary-500">
              {{ conversationCount }}
            </div>
            <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              对话
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-primary-500">
              {{ messageCount }}
            </div>
            <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              消息
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-primary-500">
              {{ daysSinceJoined }}
            </div>
            <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              天数
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Form -->
      <div class="card p-6 sm:p-8 mb-6">
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6">
          编辑资料
        </h3>

        <form @submit.prevent="handleSave" class="space-y-4 sm:space-y-5">
          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              用户名
            </label>
            <input
              v-model="formData.username"
              type="text"
              disabled
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm sm:text-base"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              用户名不可修改
            </p>
          </div>

          <!-- Nickname -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              昵称
            </label>
            <input
              v-model="formData.nickname"
              type="text"
              placeholder="输入昵称"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 outline-none transition-all text-sm sm:text-base"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              邮箱
            </label>
            <input
              v-model="formData.email"
              type="email"
              placeholder="输入邮箱"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 outline-none transition-all text-sm sm:text-base"
            />
          </div>

          <!-- Bio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              个人简介
            </label>
            <textarea
              v-model="formData.bio"
              rows="3"
              placeholder="介绍一下自己..."
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 outline-none transition-all resize-none text-sm sm:text-base"
            ></textarea>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-red-600 dark:text-red-400 text-sm">
              {{ error }}
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="handleReset"
              class="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors btn-touch text-sm sm:text-base font-medium"
            >
              重置
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors btn-touch disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
            >
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Connected Accounts -->
      <div class="card p-6 sm:p-8">
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
          关联账号
        </h3>

        <div class="space-y-3">
          <!-- GitHub -->
          <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  GitHub
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  已连接
                </div>
              </div>
            </div>
            <span class="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full">
              已绑定
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import MobileHeader from '@/components/MobileHeader.vue'

const router = useRouter()
const userStore = useUserStore()
const chatStore = useChatStore()

const profile = computed(() => userStore.profile)
const conversationCount = computed(() => chatStore.conversations.length)

// Calculate total messages across all conversations
const messageCount = computed(() => {
  return chatStore.conversations.reduce((total, conv) => {
    // This is an estimate - you'd need to track this in the database
    return total + 0 // Placeholder
  }, 0)
})

const daysSinceJoined = computed(() => {
  if (!profile.value?.created_at) return 0
  const joinDate = new Date(profile.value.created_at)
  const now = new Date()
  const diffMs = now - joinDate
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
})

const formData = ref({
  username: '',
  nickname: '',
  email: '',
  bio: ''
})

const saving = ref(false)
const error = ref(null)

onMounted(() => {
  loadProfile()
})

const loadProfile = () => {
  if (profile.value) {
    formData.value = {
      username: profile.value.username || '',
      nickname: profile.value.nickname || '',
      email: profile.value.email || '',
      bio: profile.value.bio || ''
    }
  }
}

const goBack = () => {
  router.back()
}

const editAvatar = () => {
  // TODO: Implement avatar upload
  alert('头像上传功能即将推出')
}

const handleSave = async () => {
  error.value = null
  saving.value = true

  try {
    const result = await userStore.updateProfile({
      nickname: formData.value.nickname,
      email: formData.value.email,
      bio: formData.value.bio
    })

    if (result.success) {
      alert('保存成功')
    } else {
      error.value = result.error || '保存失败'
    }
  } catch (err) {
    console.error('保存失败:', err)
    error.value = '保存过程中发生错误'
  } finally {
    saving.value = false
  }
}

const handleReset = () => {
  loadProfile()
  error.value = null
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
