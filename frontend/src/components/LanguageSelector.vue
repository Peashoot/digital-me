<template>
  <div class="language-selector">
    <n-dropdown
      :options="languageOptions"
      @select="handleLanguageChange"
      placement="bottom-end"
    >
      <button
        class="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-400 dark:hover:border-primary-600 transition-colors"
      >
        <span class="text-lg">{{ currentLanguage.flag }}</span>
        <span class="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline">
          {{ currentLanguage.label }}
        </span>
        <svg
          class="w-4 h-4 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </n-dropdown>
  </div>
</template>

<script setup>
import { computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { NDropdown } from 'naive-ui'
import { supportedLocales, setLocale } from '@/i18n'

const { locale } = useI18n()

// 当前语言
const currentLanguage = computed(() => {
  return supportedLocales.find(lang => lang.value === locale.value) || supportedLocales[0]
})

// 语言选项
const languageOptions = computed(() => {
  return supportedLocales.map(lang => ({
    label: () => h('div', { class: 'flex items-center gap-2' }, [
      h('span', { class: 'text-lg' }, lang.flag),
      h('span', lang.label)
    ]),
    key: lang.value
  }))
})

// 切换语言
const handleLanguageChange = (key) => {
  setLocale(key)
}
</script>

<style scoped>
.language-selector {
  display: inline-block;
}
</style>
