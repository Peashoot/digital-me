<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <!-- Mobile Header -->
    <MobileHeader :title="currentConversationTitle" :subtitle="currentConversationSubtitle"
      :show-menu-button="!showSidebar" @menu-click="toggleSidebar">
      <template #actions>
        <!-- Language Selector -->
        <LanguageSelector class="mr-2" />

        <!-- New Chat Button (desktop) -->
        <button @click="createNewChat"
          class="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors btn-touch">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ t('chat.conversationList.newChat') }}
        </button>
      </template>
    </MobileHeader>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden min-h-0">
      <!-- Sidebar (Conversation List) -->
      <transition name="slide" @enter="onSidebarEnter" @leave="onSidebarLeave">
        <div v-show="showSidebar" class="fixed inset-0 z-40 lg:relative lg:z-0 lg:block"
          :class="{ 'lg:w-80': showSidebar }">
          <!-- Overlay for mobile -->
          <div v-if="showSidebar" @click="closeSidebar" class="absolute inset-0 bg-black bg-opacity-50 lg:hidden"></div>

          <!-- Sidebar Content -->
          <div
            class="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-xl lg:shadow-none lg:relative lg:w-full">
            <ConversationList @select="handleConversationSelect" @create="handleConversationCreate" />
          </div>
        </div>
      </transition>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col min-w-0 min-h-0 relative">
        <!-- Welcome State (no conversation selected) -->
        <div v-if="!currentConversation" class="flex-1 flex flex-col items-center justify-center p-8">
          <div class="text-center max-w-2xl w-full">
            <div
              class="inline-flex items-center justify-center w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-6">
              <svg class="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {{ t('chat.welcome.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-8">
              {{ t('chat.welcome.subtitle') }}
            </p>

            <!-- Quick Action Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div
                class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{{
                  t('chat.welcome.quickActions.deepThink.title') }}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{
                  t('chat.welcome.quickActions.deepThink.description')
                  }}</p>
              </div>

              <div
                class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
                <div
                  class="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{{
                  t('chat.welcome.quickActions.code.title') }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('chat.welcome.quickActions.code.description')
                  }}
                </p>
              </div>

              <div
                class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
                <div
                  class="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{{
                  t('chat.welcome.quickActions.translation.title') }}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{
                  t('chat.welcome.quickActions.translation.description') }}</p>
              </div>

              <div
                class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
                <div class="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{{
                  t('chat.welcome.quickActions.document.title') }}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{
                  t('chat.welcome.quickActions.document.description')
                  }}</p>
              </div>
            </div>
          </div>

          <!-- Chat Input at bottom -->
          <div class="w-full max-w-4xl">
            <ChatInputEnhanced :sending="sending" @send="handleSendMessage"
              @stop="handleStopGeneration" />
          </div>
        </div>

        <!-- Chat Messages (conversation selected) -->
        <div v-else class="flex-1 flex flex-col min-h-0">
          <!-- Messages Container -->
          <div ref="messagesContainer" @scroll="handleScroll" class="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 min-h-0">
            <div class="max-w-4xl mx-auto">
              <!-- Loading State -->
              <div v-if="loading" class="flex justify-center py-8">
                <svg class="w-8 h-8 text-primary-500 spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
              </div>

              <!-- Messages -->
              <div v-else-if="messages.length > 0">
                <ChatMessage v-for="message in messages" :key="message.id" :message="message" />
              </div>

              <!-- Empty Conversation -->
              <div v-else class="text-center py-12">
                <p class="text-gray-500 dark:text-gray-400">
                  开始一段新的对话吧...
                </p>
              </div>

              <!-- Typing Indicator -->
              <div v-show="isTyping" class="flex gap-3 mb-4">
                <div
                  class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div
                  class="flex items-center px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm">
                  <div class="flex gap-1">
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Scroll to Bottom Button -->
          <div class="absolute bottom-44 right-1/2 translate-x-1/2 z-30 transition-opacity duration-300"
            :class="[showScrollToBottomButton ? 'opacity-100' : 'opacity-0 pointer-events-none']">
            <button @click="scrollToBottom(true)"
              class="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </button>
          </div>

          <!-- Chat Input -->
          <ChatInputEnhanced :sending="sending" @send="handleSendMessage"
            @stop="handleStopGeneration" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useChatStore } from '@/stores/chat'
import MobileHeader from '@/components/MobileHeader.vue'
import ConversationList from '@/components/ConversationList.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInputEnhanced from '@/components/ChatInputEnhanced.vue'
import LanguageSelector from '@/components/LanguageSelector.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()

const showSidebar = ref(window.innerWidth >= 1024) // Show on desktop by default
const messagesContainer = ref(null)
const showScrollToBottomButton = ref(false)

const currentConversation = computed(() => chatStore.currentConversation)
const messages = computed(() => chatStore.messages)
const loading = computed(() => chatStore.loading)
const sending = computed(() => chatStore.sending)
const isTyping = computed(() => chatStore.isTyping)


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

  // Check if there's a conversation ID in the route
  const conversationId = route.params.conversationId

  if (conversationId) {
    // Load conversation from route parameter
    await chatStore.selectConversation(conversationId)
    await nextTick()
    setTimeout(() => {
      scrollToBottom()
    }, 150)
  } else {
    // No route param, stay in new conversation mode
    chatStore.enterNewConversationMode()
  }

  // Handle window resize
  window.addEventListener('resize', handleResize)
  // Add scroll listener
  messagesContainer.value?.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // Remove scroll listener
  messagesContainer.value?.removeEventListener('scroll', handleScroll)
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
const createNewChat = () => {
  chatStore.enterNewConversationMode()
  router.push('/')
  closeSidebar()
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
 * Handle stop generation
 */
const handleStopGeneration = () => {
  chatStore.stopGeneration()
}

/**
 * Handle scroll event on messages container
 */
const handleScroll = () => {
  const container = messagesContainer.value
  if (!container) return

  const threshold = 100 // Show button if scrolled up more than 100px
  const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold

  showScrollToBottomButton.value = !atBottom
}

/**
 * Handle send message
 */
const handleSendMessage = async (content, uploadedFiles = []) => {
  const result = await chatStore.sendMessage(content, uploadedFiles)

  if (result.success) {
    // If a new conversation was created, update the URL
    if (chatStore.currentConversation && route.path === '/') {
      await router.replace(`/${chatStore.currentConversation.id}`)
    }

    await nextTick()
    scrollToBottom()
  } else {
    // 将错误作为系统消息显示在聊天中
    console.error('发送消息失败:', result.error)

    // 添加系统错误消息
    const errorMessage = {
      id: `error-${Date.now()}`,
      role: 'system',
      content: `发送消息失败: ${result.error}`,
      created_at: new Date().toISOString(),
      is_error: true
    }
    chatStore.messages.push(errorMessage)

    await nextTick()
    scrollToBottom()
  }
}

/**
 * Scroll to bottom of messages
 */
const scrollToBottom = (smooth = false) => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
  })
}

/**
 * Watch messages and auto-scroll
 */
watch(
  () => messages.value.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      // Only auto-scroll if user is already near the bottom
      const container = messagesContainer.value
      if (container) {
        const threshold = 150
        const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold
        if (atBottom) {
          scrollToBottom()
        }
      }
    }
  }
)

/**
 * Watch route changes to load conversation
 */
watch(
  () => route.params.conversationId,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      await chatStore.selectConversation(newId)
      await nextTick()
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    } else if (!newId && oldId) {
      // Navigated to root, enter new conversation mode
      chatStore.enterNewConversationMode()
    }
  }
)

/**
 * Watch current conversation change and scroll to bottom
 */
watch(
  () => currentConversation.value?.id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      // Wait for messages to load
      await nextTick()
      // Add a small delay to ensure DOM is fully rendered
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
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