<template>
  <header
    class="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 safe-top"
  >
    <div class="flex items-center justify-between h-14 sm:h-16 px-4">
      <!-- Left Section -->
      <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <!-- Menu Button (mobile) -->
        <button
          v-if="showMenuButton"
          @click="$emit('menu-click')"
          class="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors btn-touch lg:hidden"
          aria-label="打开菜单"
        >
          <svg class="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Back Button -->
        <button
          v-if="showBackButton"
          @click="$emit('back-click')"
          class="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors btn-touch"
          aria-label="返回"
        >
          <svg class="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Title -->
        <div class="flex-1 min-w-0">
          <h1 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Right Section -->
      <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <!-- Custom Actions Slot -->
        <slot name="actions"></slot>

        <!-- Settings Button -->
        <button
          v-if="showSettings"
          @click="$emit('settings-click')"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors btn-touch"
          aria-label="设置"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <!-- User Menu -->
        <div v-if="showUserMenu" class="relative">
          <button
            @click="toggleUserMenu"
            class="p-1 rounded-full hover:ring-2 hover:ring-primary-500 transition-all btn-touch"
            aria-label="用户菜单"
          >
            <img
              v-if="userAvatar"
              :src="userAvatar"
              :alt="username"
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
            />
            <div
              v-else
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary-500 flex items-center justify-center"
            >
              <span class="text-white text-sm font-medium">
                {{ username.charAt(0).toUpperCase() }}
              </span>
            </div>
          </button>

          <!-- Dropdown Menu -->
          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="userMenuOpen"
              v-click-outside="closeUserMenu"
              class="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 overflow-hidden"
            >
              <div class="py-1">
                <button
                  @click="handleProfile"
                  class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  个人资料
                </button>

                <button
                  @click="handleThemeToggle"
                  class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  {{ isDark ? '浅色模式' : '深色模式' }}
                </button>

                <hr class="my-1 border-gray-200 dark:border-gray-700" />

                <button
                  @click="handleLogout"
                  class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  退出登录
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useDark, useToggle } from '@vueuse/core'

const props = defineProps({
  title: {
    type: String,
    default: 'Digital Me'
  },
  subtitle: {
    type: String,
    default: ''
  },
  showMenuButton: {
    type: Boolean,
    default: true
  },
  showBackButton: {
    type: Boolean,
    default: false
  },
  showSettings: {
    type: Boolean,
    default: false
  },
  showUserMenu: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['menu-click', 'back-click', 'settings-click'])

const router = useRouter()
const userStore = useUserStore()

const username = computed(() => userStore.username || userStore.profile?.username || 'User')
const userAvatar = computed(() => userStore.profile?.avatar_url)

const userMenuOpen = ref(false)
const isDark = useDark()
const toggleDark = useToggle(isDark)

// Click outside directive implementation
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const closeUserMenu = () => {
  userMenuOpen.value = false
}

const handleProfile = () => {
  closeUserMenu()
  router.push({ name: 'Profile' })
}

const handleThemeToggle = () => {
  toggleDark()
  closeUserMenu()
}

const handleLogout = async () => {
  closeUserMenu()
  if (confirm('确定要退出登录吗？')) {
    await userStore.logout()
    router.push({ name: 'Login' })
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
