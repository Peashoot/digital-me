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
      ]" :title="message.role === 'assistant' ? aiModelName : username">
        <!-- User Avatar -->
        <img v-if="message.role === 'user' && userAvatar" :src="userAvatar" :alt="username"
          class="w-full h-full rounded-full object-cover" />
        <span v-else-if="message.role === 'user'" class="text-white text-sm sm:text-base font-medium">
          {{ username.charAt(0).toUpperCase() }}
        </span>

        <!-- AI Avatar -->
        <img v-if="message.role === 'assistant' && aiAvatar" :src="aiAvatar" :alt="aiModelName"
          class="max-w-4/5 max-h-4/5 rounded-full object-contain" />
        <svg v-else-if="message.role === 'assistant'" class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor"
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
            {{ t('chat.message.thinkingProcess') }}
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
      <div class="px-4 py-3 rounded-2xl break-words max-w-full overflow-hidden" :class="[
        message.role === 'user'
          ? 'bg-primary-500 text-white rounded-tr-sm'
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm'
      ]">
        <!-- Assistant Message with Parts -->
        <template v-if="message.role === 'assistant'">
          <template v-for="(part, index) in messageParts" :key="index">
            <CodeBlock v-if="part.type === 'code'" :code="part.code" :lang="part.lang" />
            <div v-else-if="part.type === 'interrupted'" class="mt-2 flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg">
              <svg class="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span class="text-sm font-semibold text-orange-700 dark:text-orange-300">{{ t('chat.message.interrupted') }}</span>
            </div>
            <div v-else class="prose prose-sm sm:prose dark:prose-invert" v-html="part.html"></div>
          </template>
        </template>

        <!-- Plain Text for User Messages -->
        <p v-else class="text-sm sm:text-base whitespace-pre-wrap">
          {{ message.content }}
        </p>
      </div>

      <!-- Actions and Timestamp -->
      <div v-if="message.id !== chatStore.streamingMessage?.id" class="mt-1.5 flex items-center justify-between w-full text-xs">
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
            {{ t('chat.message.query') }}: {{ call.query }}
          </div>
          <!-- Show search results if available -->
          <div v-if="call.results && call.results.length > 0" class="mt-1 pl-5">
            <div class="text-xs text-gray-500 dark:text-gray-500">
              {{ t('chat.message.referenceSources') }}:
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
import CodeBlock from './CodeBlock.vue'
import { supabase } from '@/lib/supabase'

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

// 获取AI提供商头像
const aiAvatar = computed(() => {
  if (props.message.role !== 'assistant') return null

  let avatarUrl = null

  // 如果消息有 model_provider 字段，使用它
  if (props.message.model_provider) {
    const provider = chatStore.providers.find(p => p.name === props.message.model_provider)
    avatarUrl = provider?.avatar_url
  } else {
    // 否则使用当前对话配置的模型对应的提供商
    avatarUrl = chatStore.currentProviderAvatar
  }

  // 如果 avatarUrl 是相对路径，转换为完整 URL
  if (avatarUrl) {
    // 如果是相对路径（以 /storage 开头），拼接完整 URL
    if (avatarUrl.startsWith('/storage/')) {
      return `${supabase.supabaseUrl}${avatarUrl}`
    }
    // 如果已经是完整 URL，直接返回
    return avatarUrl
  }

  return null
})

// 获取AI模型的显示名称（用于 tooltip）
const aiModelName = computed(() => {
  if (props.message.role !== 'assistant') return ''

  let providerName = ''
  let modelName = ''

  // 如果消息有 model_provider 字段
  if (props.message.model_provider) {
    const provider = chatStore.providers.find(p => p.name === props.message.model_provider)
    // 获取提供商名称
    providerName = provider?.display_names?.['zh-CN'] || provider?.display_name || props.message.model_provider

    // 尝试从消息中获取模型名称
    if (props.message.model_name) {
      modelName = props.message.model_name
    } else {
      // 如果消息没有模型名称，尝试从当前配置的模型中推断
      const currentModel = chatStore.availableModels.find(m =>
        m.provider === props.message.model_provider
      )
      if (currentModel) {
        modelName = currentModel.display_names?.['zh-CN'] || currentModel.display_name || currentModel.name
      }
    }
  } else {
    // 使用当前对话配置的模型
    const currentModel = chatStore.availableModels.find(m => m.name === chatStore.currentModel)
    if (currentModel) {
      // 获取提供商名称
      const provider = chatStore.providers.find(p => p.name === currentModel.provider)
      providerName = provider?.display_names?.['zh-CN'] || provider?.display_name || currentModel.provider || ''

      // 获取模型名称
      modelName = currentModel.display_names?.['zh-CN'] || currentModel.display_name || currentModel.name
    }
  }

  // 组合显示：提供商（模型）
  if (providerName && modelName) {
    return `${providerName}（${modelName}）`
  } else if (modelName) {
    return modelName
  } else if (providerName) {
    return providerName
  }

  return 'AI'
})

// Configure marked for better rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
})

// Parse the message content into parts (markdown and code)
const messageParts = computed(() => {
  if (props.message.role !== 'assistant' || !props.message.content) {
    return []
  }

  const parts = []
  let content = props.message.content

  // 检查是否包含 [生成已中断] 标记
  const interruptedMarker = '[生成已中断]'
  const hasInterrupted = content.includes(interruptedMarker)

  // 如果有标记，先移除它，稍后单独显示
  if (hasInterrupted) {
    content = content.replace(/\n*\[生成已中断\]\n*/g, '')
  }

  // Regex to split by code blocks, keeping the delimiters
  const regex = /(```[a-zA-Z]*\n[\s\S]*?```)/g
  const splitContent = content.split(regex)

  for (const text of splitContent) {
    if (!text) continue

    if (text.startsWith('```')) {
      const match = text.match(/```([a-zA-Z]*)\n([\s\S]*?)```/)
      if (match) {
        parts.push({
          type: 'code',
          lang: match[1] || 'plaintext',
          code: match[2].trim()
        })
      }
    } else {
      try {
        const rawHtml = marked.parse(text)
        const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
          ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
        })
        parts.push({ type: 'markdown', html: sanitizedHtml })
      } catch (error) {
        console.error('Markdown rendering failed for a part:', error)
        parts.push({ type: 'markdown', html: text })
      }
    }
  }

  // 如果有中断标记，添加到末尾
  if (hasInterrupted) {
    parts.push({ type: 'interrupted', marker: interruptedMarker })
  }

  return parts
})

// Format timestamp
const formattedTime = computed(() => {
  if (!props.message.created_at) return ''

  const date = new Date(props.message.created_at)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)

  // Just now
  if (diffMins < 1) return t('chat.time.justNow')

  // Minutes ago
  if (diffMins < 60) return t('chat.time.minutesAgo', { minutes: diffMins })

  // Hours ago
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return t('chat.time.hoursAgo', { hours: diffHours })

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
      messageApi.success(t('success.copied'))
    })
    .catch(err => {
      console.error('Failed to copy:', err)
      messageApi.error(t('error.copyFailed'))
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
    'web_search': t('chat.tools.webSearch'),
    'code_interpreter': t('chat.tools.codeInterpreter'),
    'file_reader': t('chat.tools.fileReader')
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