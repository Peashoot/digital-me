<template>
  <!-- System Message -->
  <div v-if="message.role === 'system'" class="flex justify-center mb-4 fade-in">
    <div class="max-w-2xl px-4 py-3 rounded-lg text-sm" :class="[
      message.is_error
        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
    ]">
      <div class="flex items-start gap-2">
        <svg v-if="message.is_error" class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="whitespace-pre-wrap">{{ message.content }}</span>
      </div>
    </div>
  </div>

  <!-- User/Assistant Message -->
  <div v-else class="flex gap-3 mb-4 fade-in" :class="[
    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
  ]">
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" :class="[
        message.role === 'user'
          ? 'bg-primary-500'
          : 'bg-gray-300 dark:bg-gray-700'
      ]">
        <!-- User Avatar -->
        <img v-if="message.role === 'user' && userAvatar" :src="userAvatar" :alt="username"
          class="w-full h-full rounded-full object-cover" />
        <span v-else-if="message.role === 'user'" class="text-white text-sm sm:text-base font-medium">
          {{ username.charAt(0).toUpperCase() }}
        </span>

        <!-- AI Avatar -->
        <svg v-else class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- Message Content -->

    <div class="max-w-[85%] sm:max-w-[75%]" :class="[

      message.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'

    ]"> <!-- Thinking Process (Assistant only) -->
      <div v-if="message.role === 'assistant' && message.thinking" class="mb-2 w-full">
        <details
          class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer">
          <summary class="font-semibold text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2 select-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            思考过程
          </summary>
          <div class="mt-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {{ message.thinking }}
          </div>
        </details>
      </div>

      <!-- Attachments (User only) -->
      <div v-if="message.role === 'user' && message.attachments && message.attachments.length > 0"
        class="mb-2 flex flex-col gap-2 w-full">
        <div v-for="(attachment, index) in message.attachments" :key="index"
          class="flex items-center gap-2 px-3 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg border border-primary-200 dark:border-primary-800">
          <svg class="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div class="flex-1 min-w-0">
            <div class="text-xs sm:text-sm font-medium text-primary-900 dark:text-primary-100 truncate">
              {{ attachment.file_name }}
            </div>
            <div class="text-xs text-primary-600 dark:text-primary-400">
              {{ formatFileSize(attachment.file_size) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Message Bubble -->
      <div class="px-4 py-3 rounded-2xl break-words inline-block" :class="[
        message.role === 'user'
          ? 'bg-primary-500 text-white rounded-tr-sm'
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm'
      ]">
        <!-- Markdown Content -->
        <div v-if="message.role === 'assistant'" class="prose prose-sm sm:prose dark:prose-invert max-w-none"
          v-html="renderedContent"></div>

        <!-- Plain Text for User Messages -->
        <p v-else class="text-sm sm:text-base whitespace-pre-wrap">
          {{ message.content }}
        </p>
      </div>

      <!-- Actions and Timestamp -->
      <div v-if="!chatStore.isSending" class="mt-1.5 flex items-center justify-between w-full text-xs">
        <!-- Layout for User Messages -->
        <template v-if="message.role === 'user'">
          <div class="flex items-center gap-3">
            <button @click="handleRegenerate"
              class="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              :title="t('chat.message.regenerate')">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19.5 12a7.5 7.5 0 11-7.5-7.5M19.5 4.5v3h-3" />
              </svg>
              <span>{{ t('chat.message.regenerate') }}</span>
            </button>
            <button @click="copyToClipboard"
              class="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              :title="t('common.copy')">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{{ t('common.copy') }}</span>
            </button>
          </div>
          <div class="ml-4 text-gray-500 dark:text-gray-400">{{ formattedTime }}</div>
        </template>

        <!-- Layout for AI Messages -->
        <template v-else>
          <div class="text-gray-500 dark:text-gray-400">{{ formattedTime }}</div>
          <div class="ml-4 flex items-center gap-3">
            <button @click="copyToClipboard"
              class="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              :title="t('common.copy')">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{{ t('common.copy') }}</span>
            </button>
          </div>
        </template>
      </div>

      <!-- Tool Calls (Assistant only) -->
      <div v-if="message.role === 'assistant' && message.tool_calls && message.tool_calls.length > 0"
        class="mt-2 w-full">
        <div v-for="(call, index) in message.tool_calls" :key="index"
          class="p-2 bg-green-50 dark:bg-green-900/20 rounded-md text-xs border border-green-200 dark:border-green-800 mb-2">
          <div class="flex items-center gap-2 mb-1">
            <svg class="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="font-semibold text-green-700 dark:text-green-300">
              {{ getToolName(call.tool) }}
            </span>
          </div>
          <div class="text-gray-600 dark:text-gray-400 pl-5">
            查询: {{ call.query }}
          </div>
          <!-- Show search results if available -->
          <div v-if="call.results && call.results.length > 0" class="mt-1 pl-5">
            <div class="text-xs text-gray-500 dark:text-gray-500">
              参考来源:
              <a v-for="(result, idx) in call.results.slice(0, 3)" :key="idx" :href="result.url" target="_blank"
                rel="noopener noreferrer" class="text-green-600 dark:text-green-400 hover:underline ml-1">
                {{ result.title }}
              </a>
            </div>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { useMessage } from 'naive-ui'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()
const userStore = useUserStore()
const chatStore = useChatStore()
const messageApi = useMessage()
const username = computed(() => userStore.username)
const userAvatar = computed(() => userStore.avatar)

// Configure marked for better rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
})

// Render markdown content safely
const renderedContent = computed(() => {
  if (props.message.role !== 'assistant') {
    return props.message.content
  }

  try {
    const rawHtml = marked.parse(props.message.content)
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'code', 'pre',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'a',
        'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
    })
  } catch (error) {
    console.error('Markdown 渲染失败:', error)
    return props.message.content
  }
})

// Format timestamp
const formattedTime = computed(() => {
  if (!props.message.created_at) return ''

  const date = new Date(props.message.created_at)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)

  // Just now
  if (diffMins < 1) return '刚刚'

  // Minutes ago
  if (diffMins < 60) return `${diffMins} 分钟前`

  // Hours ago
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} 小时前`

  // Same year
  const isSameYear = date.getFullYear() === now.getFullYear()
  if (isSameYear) {
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Different year
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

/**
 * Copy message content to clipboard
 */
const copyToClipboard = () => {
  if (!props.message.content) return
  navigator.clipboard.writeText(props.message.content)
    .then(() => {
      messageApi.success(t('success.copied', '复制成功'))
    })
    .catch(err => {
      console.error('复制失败:', err)
      messageApi.error(t('error.copyFailed', '复制失败'))
    })
}

/**
 * Resend the user's message to get a new response.
 */
const handleRegenerate = () => {
  if (props.message.role === 'user' && props.message.content && !chatStore.isSending) {
    chatStore.sendMessage(props.message.content, props.message.attachments)
  }
}

/**
 * Format file size
 */
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get tool display name
 */
const getToolName = (toolName) => {
  const toolNames = {
    'web_search': '网络搜索',
    'code_interpreter': '代码执行',
    'file_reader': '文件读取'
  }
  return toolNames[toolName] || toolName
}
</script>

<style scoped>
/* Prose styling for markdown content */
:deep(.prose) {
  color: inherit;
}

:deep(.prose p) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

:deep(.prose code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

:deep(.prose pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

:deep(.prose pre code) {
  background-color: transparent;
  padding: 0;
}

:deep(.prose a) {
  color: #3b82f6;
  text-decoration: underline;
}

:deep(.prose ul),
:deep(.prose ol) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  padding-left: 1.5em;
}

:deep(.prose li) {
  margin-top: 0.25em;
  margin-bottom: 0.25em;
}

:deep(.prose blockquote) {
  border-left: 3px solid rgba(0, 0, 0, 0.1);
  padding-left: 1em;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  font-style: italic;
}

:deep(.prose table) {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

:deep(.prose th),
:deep(.prose td) {
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.5em;
  text-align: left;
}

:deep(.prose th) {
  background-color: rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

/* Dark mode adjustments */
.dark :deep(.prose code),
.dark :deep(.prose pre) {
  background-color: rgba(255, 255, 255, 0.05);
}

.dark :deep(.prose blockquote) {
  border-left-color: rgba(255, 255, 255, 0.2);
}

.dark :deep(.prose th),
.dark :deep(.prose td) {
  border-color: rgba(255, 255, 255, 0.1);
}

.dark :deep(.prose th) {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>