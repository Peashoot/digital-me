<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-800">
    <!-- Header -->
    <div class="flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          对话列表
        </h2>
        <button
          @click="createNewConversation"
          :disabled="loading"
          class="p-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors btn-touch disabled:opacity-50 disabled:cursor-not-allowed"
          title="新建对话"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <!-- Search Bar (optional) -->
      <div v-if="showSearch" class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索对话..."
          class="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 transition-all"
        />
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Conversation List -->
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <!-- Loading State -->
      <div v-if="loading" class="p-4 text-center">
        <svg class="w-8 h-8 mx-auto text-primary-500 spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">加载中...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredConversations.length === 0" class="p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="mt-4 text-gray-500 dark:text-gray-400">
          {{ searchQuery ? '没有找到匹配的对话' : '暂无对话，点击右上角创建新对话' }}
        </p>
      </div>

      <!-- Conversation Items -->
      <div v-else class="py-2">
        <div
          v-for="conversation in filteredConversations"
          :key="conversation.id"
          @click="selectConversation(conversation.id)"
          class="relative group px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-l-4"
          :class="[
            currentConversationId === conversation.id
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-transparent'
          ]"
        >
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <div class="flex-shrink-0 mt-1">
              <div class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                {{ conversation.title || '未命名对话' }}
              </h3>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ formatTime(conversation.updated_at) }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click.stop="deleteConversation(conversation.id)"
                class="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="删除对话"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'

const props = defineProps({
  showSearch: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'create', 'delete'])

const chatStore = useChatStore()
const searchQuery = ref('')

const loading = computed(() => chatStore.loading)
const conversations = computed(() => chatStore.conversations)
const currentConversationId = computed(() => chatStore.currentConversation?.id)

// Filter conversations by search query
const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return conversations.value
  }

  const query = searchQuery.value.toLowerCase()
  return conversations.value.filter(conv =>
    conv.title?.toLowerCase().includes(query)
  )
})

/**
 * Create new conversation
 */
const createNewConversation = async () => {
  const result = await chatStore.createConversation()
  if (result.success) {
    emit('create', result.conversation)
  }
}

/**
 * Select conversation
 */
const selectConversation = async (conversationId) => {
  await chatStore.selectConversation(conversationId)
  emit('select', conversationId)
}

/**
 * Delete conversation with confirmation
 */
const deleteConversation = async (conversationId) => {
  if (!confirm('确定要删除这个对话吗？')) {
    return
  }

  const result = await chatStore.deleteConversation(conversationId)
  if (result.success) {
    emit('delete', conversationId)
  }
}

/**
 * Format time
 */
const formatTime = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins} 分钟前`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} 小时前`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} 天前`

  const isSameYear = date.getFullYear() === now.getFullYear()
  if (isSameYear) {
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric'
    })
  }

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
