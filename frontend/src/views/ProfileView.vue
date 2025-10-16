<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <MobileHeader :title="t('settings.profile.title')" :show-back-button="true" :show-user-menu="false" @back-click="goBack" />

    <!-- Content -->
    <div class="max-w-2xl mx-auto px-4 py-6 sm:py-8 safe-bottom">
      <!-- Profile Card -->
      <div class="card p-6 sm:p-8 mb-6">
        <!-- Avatar Section -->
        <div class="text-center mb-6">
          <div class="relative inline-block">
            <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mx-auto">
              <img v-if="profile?.avatar_url" :src="profile.avatar_url" :alt="profile.username"
                class="w-full h-full object-cover" />
              <div v-else
                class="w-full h-full flex items-center justify-center bg-primary-500 text-white text-3xl sm:text-4xl font-bold">
                {{ profile?.username?.charAt(0).toUpperCase() || 'U' }}
              </div>
            </div>

            <!-- Edit Avatar Button -->
            <button @click="editAvatar"
              class="absolute bottom-0 right-0 p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg transition-colors btn-touch">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <h2 class="mt-4 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {{ profile?.nickname || profile?.username || t('settings.profile.notSet') }}
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
              {{ t('settings.profile.conversations') }}
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-primary-500">
              {{ messageCount }}
            </div>
            <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ t('settings.profile.messages') }}
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl font-bold text-primary-500">
              {{ daysSinceJoined }}
            </div>
            <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ t('settings.profile.days') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Form -->
      <div class="card p-6 sm:p-8 mb-6">
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {{ t('settings.profile.editProfile') }}
        </h3>

        <form @submit.prevent="handleSave" class="space-y-4 sm:space-y-5">
          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('settings.profile.username') }}
            </label>
            <input v-model="formData.username" type="text" disabled
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm sm:text-base" />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ t('settings.profile.usernameNotEditable') }}
            </p>
          </div>

          <!-- Nickname -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('settings.profile.nickname') }}
            </label>
            <input v-model="formData.nickname" type="text" :placeholder="t('settings.profile.nicknamePlaceholder')"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 outline-none transition-all text-sm sm:text-base" />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('settings.profile.email') }}
            </label>
            <input v-model="formData.email" type="email" :placeholder="t('settings.profile.emailPlaceholder')"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 outline-none transition-all text-sm sm:text-base" />
          </div>

          <!-- Bio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ t('settings.profile.bio') }}
            </label>
            <textarea v-model="formData.bio" rows="3" :placeholder="t('settings.profile.bioPlaceholder')"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 outline-none transition-all resize-none text-sm sm:text-base"></textarea>
          </div>

          <!-- Error Message -->
          <div v-if="error"
            class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-red-600 dark:text-red-400 text-sm">
              {{ error }}
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-2">
            <button type="button" @click="handleReset"
              class="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors btn-touch text-sm sm:text-base font-medium">
              {{ t('settings.profile.reset') }}
            </button>
            <button type="submit" :disabled="saving"
              class="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors btn-touch disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium">
              {{ saving ? t('settings.profile.saving') : t('settings.profile.save') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Language Preference -->
      <div class="card p-6 sm:p-8 mb-6">
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ t('settings.appearance.languagePreference') }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {{ t('settings.appearance.languageDescription') }}
        </p>

        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('settings.appearance.language') }}
          </label>
          <div class="relative">
            <select v-model="currentLocale" @change="handleLanguageChange(currentLocale)"
              class="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 outline-none transition-all text-sm sm:text-base appearance-none cursor-pointer">
              <option v-for="lang in supportedLocales" :key="lang.value" :value="lang.value">
                {{ lang.flag }} {{ lang.label }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Connected Accounts -->
      <div class="card p-6 sm:p-8 mb-6">
        <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {{ t('settings.profile.connectedAccounts') }}
        </h3>

        <div class="space-y-3">
          <!-- GitHub -->
          <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  GitHub
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ t('settings.profile.connected') }}
                </div>
              </div>
            </div>
            <span
              class="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full">
              {{ t('settings.profile.bound') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Digital Twin Settings -->
      <div class="card p-6 sm:p-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {{ t('settings.profile.digitalTwin') }}
          </h3>
          <span v-if="personaStore.hasPersona" :class="[
            'px-3 py-1 text-xs rounded-full',
            personaStore.isActive
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
          ]">
            {{ personaStore.isActive ? t('settings.profile.enabled') : t('settings.profile.disabled') }}
          </span>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {{ t('settings.profile.digitalTwinDescription') }}
        </p>

        <div class="space-y-3">
          <!-- Setup Button -->
          <button @click="goToPersonaSetup"
            class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg transition-all btn-touch shadow-md hover:shadow-lg">
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div class="text-left">
                <div class="text-sm font-semibold">
                  {{ personaStore.hasPersona ? t('settings.profile.editDigitalTwin') : t('settings.profile.createDigitalTwin') }}
                </div>
                <div v-if="personaStore.hasPersona" class="text-xs opacity-90">
                  {{ t('settings.profile.completeness') }}: {{ personaStore.completeness }}%
                </div>
              </div>
            </div>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Info Cards -->
          <div v-if="personaStore.hasPersona" class="grid grid-cols-2 gap-3">
            <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {{ t('settings.profile.displayName') }}
              </div>
              <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ personaStore.displayName || t('settings.profile.notSet') }}
              </div>
            </div>
            <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {{ t('settings.profile.lastUpdated') }}
              </div>
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ formatDate(personaStore.persona?.last_updated) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { usePersonaStore } from '@/stores/persona'
import { supportedLocales, setLocale, getLocale } from '@/i18n'
import { supabase } from '@/lib/supabase'
import MobileHeader from '@/components/MobileHeader.vue'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const chatStore = useChatStore()
const personaStore = usePersonaStore()

const profile = computed(() => userStore.profile)
const conversationCount = computed(() => chatStore.conversations.length)
const currentLocale = ref(getLocale())
const totalMessageCount = ref(0)

// Calculate total messages across all conversations
const messageCount = computed(() => totalMessageCount.value)

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

onMounted(async () => {
  loadProfile()
  personaStore.fetchPersona()
  // Initialize chatStore to load conversations
  await chatStore.initialize()
  // Fetch total message count
  await fetchMessageCount()
})

const fetchMessageCount = async () => {
  if (!userStore.user) return

  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', chatStore.conversations.map(c => c.id))

    if (error) throw error
    totalMessageCount.value = count || 0
  } catch (error) {
    console.error('Failed to fetch message count:', error)
    totalMessageCount.value = 0
  }
}

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

const goToPersonaSetup = () => {
  router.push({ name: 'PersonaSetup' })
}

const formatDate = (dateString) => {
  if (!dateString) return t('settings.profile.notSet')
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return t('settings.profile.today')
  if (diffDays === 1) return t('settings.profile.yesterday')
  if (diffDays < 7) return t('settings.profile.daysAgo', { days: diffDays })
  if (diffDays < 30) return t('settings.profile.weeksAgo', { weeks: Math.floor(diffDays / 7) })
  return t('settings.profile.monthsAgo', { months: Math.floor(diffDays / 30) })
}

const editAvatar = () => {
  // TODO: Implement avatar upload
  alert(t('settings.profile.uploadAvatar'))
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
      alert(t('settings.profile.saveSuccess'))
    } else {
      error.value = result.error || t('settings.profile.saveError')
    }
  } catch (err) {
    console.error('Failed to save:', err)
    error.value = t('settings.profile.saveErrorOccurred')
  } finally {
    saving.value = false
  }
}

const handleReset = () => {
  loadProfile()
  error.value = null
}

const handleLanguageChange = async (locale) => {
  // Update i18n and localStorage
  setLocale(locale)
  currentLocale.value = locale

  // Save to database
  try {
    await userStore.updateProfile({
      language_preference: locale
    })
  } catch (err) {
    console.error('Failed to save language preference:', err)
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
