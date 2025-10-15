<template>
  <div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 safe-bottom">
    <div class="max-w-4xl mx-auto px-4 py-3 sm:py-4">
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Textarea Input -->
        <div class="flex-1 relative">
          <textarea ref="textareaRef" v-model="inputText" @keydown="handleKeyDown" @input="adjustHeight"
            :placeholder="placeholder" :disabled="disabled" :maxlength="maxLength"
            class="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base overflow-hidden"
            :style="{ height: textareaHeight + 'px' }" rows="1"></textarea>

          <!-- Character Count (optional) -->
          <div v-if="showCharCount && maxLength"
            class="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
            {{ inputText.length }}/{{ maxLength }}
          </div>
        </div>

        <!-- Send Button -->
        <button v-if="!canStop" @click="handleSend" :disabled="!canSend"
          class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white transition-all duration-200 btn-touch disabled:cursor-not-allowed disabled:opacity-50 shadow-md active:shadow-sm">
          <!-- Send Icon -->
          <svg v-if="!sending" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>

          <!-- Loading Spinner -->
          <svg v-else class="w-5 h-5 sm:w-6 sm:h-6 spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
        </button>

        <!-- Stop Button -->
        <button v-else @click="handleStop"
          class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 btn-touch shadow-md active:shadow-sm">
          <!-- Stop Icon -->
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
      </div>

      <!-- Quick Actions (optional) -->
      <div v-if="showQuickActions" class="flex gap-2 mt-2 overflow-x-auto pb-1">
        <button v-for="action in quickActions" :key="action.text" @click="handleQuickAction(action)"
          class="flex-shrink-0 px-3 py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors btn-touch">
          {{ action.text }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: '输入消息...'
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
  showQuickActions: {
    type: Boolean,
    default: false
  },
  quickActions: {
    type: Array,
    default: () => []
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

const emit = defineEmits(['send', 'quick-action', 'stop'])

const inputText = ref('')
const textareaRef = ref(null)
const textareaHeight = ref(props.minHeight)

const canSend = computed(() => {
  return (
    inputText.value.trim().length > 0 &&
    !props.disabled &&
    !props.sending &&
    (!props.maxLength || inputText.value.length <= props.maxLength)
  )
})

/**
 * Auto-adjust textarea height
 */
const adjustHeight = () => {
  nextTick(() => {
    if (!textareaRef.value) return

    // Reset height to minHeight to get accurate scrollHeight
    textareaHeight.value = props.minHeight
    textareaRef.value.style.height = props.minHeight + 'px'

    // Get the scroll height after reset
    const scrollHeight = textareaRef.value.scrollHeight

    // Calculate new height within min/max bounds
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
  // Enter to send (without Shift)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }

  // Shift+Enter for new line (default behavior)
}

/**
 * Stop generation
 */
const handleStop = () => {
  emit('stop')
}

/**
 * Send message
 */
const handleSend = () => {
  if (!canSend.value) return

  const message = inputText.value.trim()
  emit('send', message)

  // Clear input and reset height
  inputText.value = ''
  textareaHeight.value = props.minHeight
}

/**
 * Handle quick action click
 */
const handleQuickAction = (action) => {
  emit('quick-action', action)

  // Optionally insert text into input
  if (action.insertText) {
    inputText.value = action.insertText
    adjustHeight()
    textareaRef.value?.focus()
  }
}

/**
 * Focus input on mount
 */
onMounted(() => {
  // Don't auto-focus on mobile to prevent keyboard from showing
  if (window.innerWidth >= 768) {
    textareaRef.value?.focus()
  }
})

/**
 * Expose focus method for parent components
 */
defineExpose({
  focus: () => textareaRef.value?.focus(),
  clear: () => {
    inputText.value = ''
    textareaHeight.value = props.minHeight
  }
})
</script>

<style scoped>
/* Hide scrollbar for textarea */
textarea {
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
}

textarea::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
}

/* Hide scrollbar for quick actions on mobile */
.overflow-x-auto {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style>
