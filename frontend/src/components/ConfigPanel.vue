<template>
  <div class="config-panel p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
    <div class="flex items-center gap-3 flex-wrap max-w-4xl mx-auto">
      <!-- 模型选择 -->
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <ModelSelector />
      </div>

      <div class="flex-1"></div>

      <!-- 深度思考开关 -->
      <label class="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          v-model="thinkMode"
          @change="handleThinkModeChange"
          class="w-4 h-4 text-primary-500 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
        />
        <div class="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>深度思考</span>
        </div>
      </label>

      <!-- 联网查询开关 -->
      <label class="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          v-model="webSearch"
          @change="handleWebSearchChange"
          class="w-4 h-4 text-primary-500 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
        />
        <div class="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>联网查询</span>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import ModelSelector from './ModelSelector.vue'

const chatStore = useChatStore()

const thinkMode = ref(chatStore.isThinkModeEnabled)
const webSearch = ref(chatStore.isWebSearchEnabled)

const handleThinkModeChange = async () => {
  await chatStore.updateConversationConfig({ thinkMode: thinkMode.value })
}

const handleWebSearchChange = async () => {
  await chatStore.updateConversationConfig({ webSearch: webSearch.value })
}

// 监听 store 变化
watch(() => chatStore.isThinkModeEnabled, (value) => {
  thinkMode.value = value
})

watch(() => chatStore.isWebSearchEnabled, (value) => {
  webSearch.value = value
})
</script>
