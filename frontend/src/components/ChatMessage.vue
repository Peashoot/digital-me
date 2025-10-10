<template>
  <div
    class="flex gap-3 mb-4 fade-in"
    :class="[
      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
    ]"
  >
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <div
        class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
        :class="[
          message.role === 'user'
            ? 'bg-primary-500'
            : 'bg-gray-300 dark:bg-gray-700'
        ]"
      >
        <!-- User Avatar -->
        <img
          v-if="message.role === 'user' && userAvatar"
          :src="userAvatar"
          :alt="username"
          class="w-full h-full rounded-full object-cover"
        />
        <span
          v-else-if="message.role === 'user'"
          class="text-white text-sm sm:text-base font-medium"
        >
          {{ username.charAt(0).toUpperCase() }}
        </span>

        <!-- AI Avatar -->
        <svg
          v-else
          class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- Message Content -->
    <div
      class="flex-1 max-w-[85%] sm:max-w-[75%]"
      :class="[
        message.role === 'user' ? 'items-end' : 'items-start'
      ]"
    >
      <!-- Message Bubble -->
      <div
        class="px-4 py-3 rounded-2xl break-words"
        :class="[
          message.role === 'user'
            ? 'bg-primary-500 text-white rounded-tr-sm'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm'
        ]"
      >
        <!-- Markdown Content -->
        <div
          v-if="message.role === 'assistant'"
          class="prose prose-sm sm:prose dark:prose-invert max-w-none"
          v-html="renderedContent"
        ></div>

        <!-- Plain Text for User Messages -->
        <p
          v-else
          class="text-sm sm:text-base whitespace-pre-wrap"
        >
          {{ message.content }}
        </p>
      </div>

      <!-- Timestamp -->
      <div
        class="mt-1 px-2 text-xs text-gray-500 dark:text-gray-400"
        :class="[
          message.role === 'user' ? 'text-right' : 'text-left'
        ]"
      >
        {{ formattedTime }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const userStore = useUserStore()
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
