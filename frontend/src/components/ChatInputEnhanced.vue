<template>
  <div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 safe-bottom">
    <div class="max-w-4xl mx-auto px-4 py-3 sm:py-4">
      <!-- Config Bar (Collapsible) -->
      <div
        v-if="showConfig || !isMobile"
        class="mb-3 transition-all duration-300"
        :class="{ 'opacity-0 max-h-0 overflow-hidden': !showConfig && isMobile }"
      >
        <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
          <!-- Model Selector -->
          <div class="flex items-center gap-1.5">
            <ModelSelector />
          </div>

          <!-- Think Mode Toggle Button -->
          <button
            type="button"
            @click="toggleThinkMode"
            :disabled="disabled || !isClaudeModel"
            :title="!isClaudeModel ? t('chat.input.thinkModeHint') : ''"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200"
            :class="[
              localConfig.thinkMode
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300'
                : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-amber-300 dark:hover:border-amber-700',
              (disabled || !isClaudeModel) && 'opacity-50 cursor-not-allowed'
            ]"
          >
            <svg
              class="w-4 h-4 transition-colors"
              :class="localConfig.thinkMode ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span class="text-xs sm:text-sm font-medium select-none">{{ t('chat.input.thinkMode') }}</span>
            <span
              v-if="localConfig.thinkMode"
              class="ml-0.5 w-1.5 h-1.5 bg-amber-600 dark:bg-amber-400 rounded-full"
            ></span>
          </button>

          <!-- Web Search Toggle Button -->
          <button
            type="button"
            @click="toggleWebSearch"
            :disabled="disabled"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200"
            :class="[
              localConfig.webSearch
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700',
              disabled && 'opacity-50 cursor-not-allowed'
            ]"
          >
            <svg
              class="w-4 h-4 transition-colors"
              :class="localConfig.webSearch ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span class="text-xs sm:text-sm font-medium select-none">{{ t('chat.input.webSearch') }}</span>
            <span
              v-if="localConfig.webSearch"
              class="ml-0.5 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"
            ></span>
          </button>

          <!-- File Upload Button -->
          <input
            ref="fileInputRef"
            type="file"
            class="hidden"
            multiple
            accept=".pdf,.txt,.doc,.docx,.md,image/*"
            @change="handleFileSelect"
            :disabled="disabled"
          />
          <button
            @click="$refs.fileInputRef.click()"
            :disabled="disabled"
            :class="{ 'opacity-50 cursor-not-allowed': disabled }"
            class="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 transition-colors cursor-pointer group"
            :title="t('chat.input.attachFile')"
          >
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span class="text-xs sm:text-sm text-gray-700 dark:text-gray-300 select-none">{{ t('chat.input.attachFile') }}</span>
            <!-- File count badge -->
            <span
              v-if="attachedFiles.length > 0"
              class="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-primary-500 text-white text-xs rounded-full"
            >
              {{ attachedFiles.length }}
            </span>
          </button>

          <!-- Spacer -->
          <div class="flex-1 min-w-2"></div>

          <!-- Toggle Config Button (Mobile Only) -->
          <button
            v-if="isMobile"
            @click="toggleConfig"
            class="md:hidden px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            {{ showConfig ? t('chat.input.collapseConfig') : t('chat.input.expandConfig') }}
          </button>
        </div>
      </div>

      <!-- Config Toggle Button (Mobile, when config is hidden) -->
      <div
        v-if="isMobile && !showConfig"
        class="mb-2 flex justify-center"
      >
        <button
          @click="toggleConfig"
          class="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          {{ t('chat.input.expandConfig') }}
        </button>
      </div>

      <!-- Attached Files (if any) -->
      <div v-if="attachedFiles.length > 0" class="mb-2 flex flex-wrap gap-2">
        <div
          v-for="(file, index) in attachedFiles"
          :key="index"
          class="flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg text-sm group"
        >
          <!-- File Icon -->
          <svg class="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>

          <!-- File Info -->
          <div class="flex-1 min-w-0">
            <div class="font-medium text-primary-900 dark:text-primary-100 truncate">{{ file.name }}</div>
            <div class="text-xs text-primary-600 dark:text-primary-400">{{ formatFileSize(file.size) }}</div>
          </div>

          <!-- Remove Button -->
          <button
            @click="removeFile(index)"
            class="p-1 hover:bg-primary-100 dark:hover:bg-primary-800 rounded transition-colors"
            :title="t('chat.file.remove')"
          >
            <svg class="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Input Area -->
      <div class="flex items-end gap-2 sm:gap-3">
        <!-- Textarea Container -->
        <div class="flex-1 relative">
          <!-- Textarea -->
          <textarea
            ref="textareaRef"
            v-model="inputText"
            @keydown="handleKeyDown"
            @input="adjustHeight"
            :placeholder="placeholder"
            :disabled="disabled"
            :maxlength="maxLength"
            class="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base overflow-hidden"
            :class="{
              'pr-16': showCharCount && maxLength
            }"
            :style="{ height: textareaHeight + 'px' }"
            rows="1"
          ></textarea>

          <!-- Character Count -->
          <div
            v-if="showCharCount && maxLength"
            class="absolute bottom-3 right-3 text-xs select-none pointer-events-none"
            :class="{
              'text-red-500 dark:text-red-400': inputText.length > maxLength * 0.9,
              'text-gray-400 dark:text-gray-500': inputText.length <= maxLength * 0.9
            }"
          >
            {{ inputText.length }}/{{ maxLength }}
          </div>
        </div>

        <!-- Send/Stop Button -->
        <button
          v-if="!canStop"
          @click="handleSend"
          :disabled="!canSend"
          class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white transition-all duration-200 btn-touch disabled:cursor-not-allowed disabled:opacity-50 shadow-md hover:shadow-lg active:shadow-sm"
          :title="canSend ? t('chat.input.sendHint') : ''"
        >
          <!-- Send Icon -->
          <svg
            v-if="!sending"
            class="w-5 h-5 sm:w-6 sm:h-6 transform transition-transform group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>

          <!-- Loading Spinner -->
          <svg
            v-else
            class="w-5 h-5 sm:w-6 sm:h-6 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>

        <!-- Stop Button -->
        <button
          v-else
          @click="handleStop"
          class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 btn-touch shadow-md hover:shadow-lg active:shadow-sm"
          :title="t('chat.input.stop')"
        >
          <svg
            class="w-5 h-5 sm:w-6 sm:h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
      </div>

      <!-- Helper Text -->
      <div class="flex items-center justify-between mt-2 px-1">
        <p class="text-xs text-gray-400 dark:text-gray-500">
          <kbd class="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Enter</kbd>
          {{ t('chat.input.sendHint') }}
          <span class="mx-1">•</span>
          <kbd class="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Shift+Enter</kbd>
          {{ t('chat.input.newlineHint') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/stores/chat'
import ModelSelector from './ModelSelector.vue'

const { t } = useI18n()

const props = defineProps({
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  sending: {
    type: Boolean,
    default: false
  },
  canStop: {
    type: Boolean,
    default: false
  },
  maxLength: {
    type: Number,
    default: 2000
  },
  showCharCount: {
    type: Boolean,
    default: true
  },
  minHeight: {
    type: Number,
    default: 48
  },
  maxHeight: {
    type: Number,
    default: 200
  }
})

const emit = defineEmits(['send', 'stop', 'config-change'])

const chatStore = useChatStore()

// State
const inputText = ref('')
const textareaRef = ref(null)
const fileInputRef = ref(null)
const textareaHeight = ref(props.minHeight)
const showConfig = ref(true)
const isMobile = ref(window.innerWidth < 768)
const attachedFiles = ref([])

// Local config state
const localConfig = ref({
  thinkMode: chatStore.isThinkModeEnabled || false,
  webSearch: chatStore.isWebSearchEnabled || false
})

// Model options (no longer needed, using ModelSelector component)
// const modelOptions = computed(() => {
//   return chatStore.availableModels.map(model => ({
//     label: model.display_name,
//     value: model.name
//   }))
// })

// Check if current model is Claude
const isClaudeModel = computed(() => {
  return chatStore.currentModel.toLowerCase().includes('claude')
})

// Can send message
const canSend = computed(() => {
  return (
    inputText.value.trim().length > 0 &&
    !props.disabled &&
    !props.sending &&
    (!props.maxLength || inputText.value.length <= props.maxLength)
  )
})

/**
 * Toggle config visibility
 */
const toggleConfig = () => {
  showConfig.value = !showConfig.value
}

/**
 * Toggle think mode
 */
const toggleThinkMode = async () => {
  if (props.disabled || !isClaudeModel.value) return

  localConfig.value.thinkMode = !localConfig.value.thinkMode
  await handleConfigChange()
}

/**
 * Toggle web search
 */
const toggleWebSearch = async () => {
  if (props.disabled) return

  localConfig.value.webSearch = !localConfig.value.webSearch
  await handleConfigChange()
}

/**
 * Handle config change
 */
const handleConfigChange = async () => {
  // Disable think mode if not Claude
  if (!isClaudeModel.value) {
    localConfig.value.thinkMode = false
  }

  // Update store
  await chatStore.updateConversationConfig({
    thinkMode: localConfig.value.thinkMode,
    webSearch: localConfig.value.webSearch
  })

  emit('config-change', localConfig.value)
}

/**
 * Auto-adjust textarea height
 */
const adjustHeight = () => {
  nextTick(() => {
    if (!textareaRef.value) return

    textareaHeight.value = props.minHeight
    textareaRef.value.style.height = props.minHeight + 'px'

    const scrollHeight = textareaRef.value.scrollHeight
    const newHeight = Math.min(
      Math.max(scrollHeight, props.minHeight),
      props.maxHeight
    )

    textareaHeight.value = newHeight
  })
}

/**
 * Handle keyboard shortcuts
 */
const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

/**
 * Handle file selection
 */
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || [])

  // Validate and add files
  files.forEach(file => {
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert(t('chat.input.fileSizeLimit', { name: file.name }))
      return
    }

    // Check if already attached
    if (attachedFiles.value.some(f => f.name === file.name && f.size === file.size)) {
      return
    }

    attachedFiles.value.push(file)
  })

  // Clear input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

/**
 * Remove file from attached list
 */
const removeFile = (index) => {
  attachedFiles.value.splice(index, 1)
}

/**
 * Format file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Send message (with files if any)
 */
const handleSend = async () => {
  if (!canSend.value) return

  const message = inputText.value.trim()

  // If there are attached files, upload them first
  if (attachedFiles.value.length > 0) {
    const uploadedFiles = []

    for (const file of attachedFiles.value) {
      const result = await chatStore.uploadFile(file)
      if (result.success) {
        uploadedFiles.push(result.file)
      }
    }

    emit('send', message, uploadedFiles)
  } else {
    emit('send', message)
  }

  inputText.value = ''
  attachedFiles.value = []
  textareaHeight.value = props.minHeight
}

/**
 * Stop generation
 */
const handleStop = () => {
  emit('stop')
}

/**
 * Handle window resize
 */
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    showConfig.value = true
  }
}

/**
 * Watch store changes
 */
watch(() => chatStore.isThinkModeEnabled, (value) => {
  localConfig.value.thinkMode = value
})

watch(() => chatStore.isWebSearchEnabled, (value) => {
  localConfig.value.webSearch = value
})

// Watch model change to disable think mode
watch(() => chatStore.currentModel, (newModel) => {
  if (!newModel.toLowerCase().includes('claude')) {
    localConfig.value.thinkMode = false
    handleConfigChange()
  }
})

/**
 * Lifecycle
 */
onMounted(() => {
  if (window.innerWidth >= 768) {
    textareaRef.value?.focus()
  }

  window.addEventListener('resize', handleResize)
})

/**
 * Expose methods
 */
defineExpose({
  focus: () => textareaRef.value?.focus(),
  clear: () => {
    inputText.value = ''
    attachedFiles.value = []
    textareaHeight.value = props.minHeight
  }
})
</script>

<style scoped>
/* Hide scrollbar for textarea */
textarea {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

textarea::-webkit-scrollbar {
  display: none;
}

/* Custom kbd styling */
kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Button touch feedback */
.btn-touch:active {
  transform: scale(0.95);
}

/* Animation for config panel */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.config-enter-active {
  animation: slideDown 0.3s ease-out;
}
</style>
