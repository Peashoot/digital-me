<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <!-- Mobile Header -->
    <MobileHeader
      :title="currentConversationTitle"
      :subtitle="currentConversationSubtitle"
      :show-menu-button="!showSidebar"
      @menu-click="toggleSidebar"
    >
      <template #actions>
        <!-- New Chat Button (desktop) -->
        <button
          @click="createNewChat"
          class="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors btn-touch"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新对话
        </button>
      </template>
    </MobileHeader>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden min-h-0">
      <!-- Sidebar (Conversation List) -->
      <transition
        name="slide"
        @enter="onSidebarEnter"
        @leave="onSidebarLeave"
      >
        <div
          v-show="showSidebar"
          class="fixed inset-0 z-40 lg:relative lg:z-0 lg:block"
          :class="{ 'lg:w-80': showSidebar }"
        >
          <!-- Overlay for mobile -->
          <div
            v-if="showSidebar"
            @click="closeSidebar"
            class="absolute inset-0 bg-black bg-opacity-50 lg:hidden"
          ></div>

          <!-- Sidebar Content -->
          <div class="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-xl lg:shadow-none lg:relative lg:w-full">
            <ConversationList
              @select="handleConversationSelect"
              @create="handleConversationCreate"
            />
          </div>
        </div>
      </transition>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col min-w-0 min-h-0">
        <!-- Empty State -->
        <div
          v-if="!currentConversation"
          class="flex-1 flex items-center justify-center p-8"
        >
          <div class="text-center max-w-md">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-6">
              <svg class="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              开始新对话
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              选择一个对话或创建新的对话来开始聊天
            </p>
            <button
              @click="createNewChat"
              class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all btn-touch"
            >
              创建新对话
            </button>
          </div>
        </div>

        <!-- Chat Messages -->
        <div
          v-else
          class="flex-1 flex flex-col min-h-0"
        >
          <!-- Messages Container -->
          <div
            ref="messagesContainer"
            class="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 min-h-0"
          >
            <div class="max-w-4xl mx-auto">
              <!-- Loading State -->
              <div v-if="loading" class="flex justify-center py-8">
                <svg class="w-8 h-8 text-primary-500 spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>

              <!-- Messages -->
              <div v-else-if="messages.length > 0">
                <ChatMessage
                  v-for="message in messages"
                  :key="message.id"
                  :message="message"
                />
              </div>

              <!-- Empty Conversation -->
              <div v-else class="text-center py-12">
                <p class="text-gray-500 dark:text-gray-400">
                  开始一段新的对话吧...
                </p>
              </div>

              <!-- Typing Indicator -->
              <div v-if="sending" class="flex gap-3 mb-4">
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div class="flex items-center px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm">
                  <div class="flex gap-1">
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Input -->
          <ChatInput
            :disabled="!currentConversation"
            :sending="sending"
            @send="handleSendMessage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import MobileHeader from '@/components/MobileHeader.vue'
import ConversationList from '@/components/ConversationList.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'

const chatStore = useChatStore()

const showSidebar = ref(window.innerWidth >= 1024) // Show on desktop by default
const messagesContainer = ref(null)

const currentConversation = computed(() => chatStore.currentConversation)
const messages = computed(() => chatStore.messages)
const loading = computed(() => chatStore.loading)
const sending = computed(() => chatStore.sending)

const currentConversationTitle = computed(() => {
  return currentConversation.value?.title || 'Digital Me'
})

const currentConversationSubtitle = computed(() => {
  if (!currentConversation.value) return ''
  const count = messages.value.length
  return count > 0 ? `${count} 条消息` : '开始对话'
})

/**
 * Initialize chat store
 */
onMounted(async () => {
  await chatStore.initialize()

  // Auto-select first conversation if exists
  if (chatStore.conversations.length > 0 && !currentConversation.value) {
    await chatStore.selectConversation(chatStore.conversations[0].id)
  }

  // Handle window resize
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chatStore.cleanup()
})

/**
 * Handle window resize
 */
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    showSidebar.value = true
  }
}

/**
 * Toggle sidebar
 */
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

const closeSidebar = () => {
  if (window.innerWidth < 1024) {
    showSidebar.value = false
  }
}

/**
 * Sidebar transitions
 */
const onSidebarEnter = (el) => {
  el.style.transition = 'none'
}

const onSidebarLeave = (el) => {
  el.style.transition = 'transform 0.3s ease-in-out'
}

/**
 * Create new chat
 */
const createNewChat = async () => {
  const result = await chatStore.createConversation('新对话')
  if (result.success) {
    closeSidebar()
    scrollToBottom()
  }
}

/**
 * Handle conversation selection
 */
const handleConversationSelect = async (conversationId) => {
  closeSidebar()
  await nextTick()
  scrollToBottom()
}

/**
 * Handle conversation creation
 */
const handleConversationCreate = () => {
  closeSidebar()
}

/**
 * Handle send message
 */
const handleSendMessage = async (content) => {
  const result = await chatStore.sendMessage(content)

  if (result.success) {
    await nextTick()
    scrollToBottom()
  } else {
    // Show error notification (you can use Naive UI's notification here)
    console.error('发送消息失败:', result.error)
    alert('发送消息失败: ' + result.error)
  }
}

/**
 * Scroll to bottom of messages
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

/**
 * Watch messages and auto-scroll
 */
watch(
  () => messages.value.length,
  () => {
    scrollToBottom()
  }
)
</script>

<style scoped>
/* Sidebar slide animation */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

@media (min-width: 1024px) {
  .slide-enter-from,
  .slide-leave-to {
    transform: translateX(0);
  }
}
</style>

