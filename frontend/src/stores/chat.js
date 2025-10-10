import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { useUserStore } from './user'

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    currentConversation: null,
    messages: [],
    loading: false,
    sending: false,
    error: null,
    realtimeChannel: null
  }),

  getters: {
    currentMessages: (state) => state.messages,
    conversationList: (state) => state.conversations,
    isLoading: (state) => state.loading,
    isSending: (state) => state.sending
  },

  actions: {
    /**
     * 初始化聊天功能，加载会话列表
     */
    async initialize() {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn) return

      this.loading = true
      try {
        await this.fetchConversations()
      } catch (error) {
        console.error('初始化聊天失败:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取会话列表
     */
    async fetchConversations() {
      const userStore = useUserStore()
      if (!userStore.userId) return { success: false, error: '用户未登录' }

      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', userStore.userId)
          .order('updated_at', { ascending: false })

        if (error) throw error

        this.conversations = data || []
        return { success: true, conversations: data }
      } catch (error) {
        console.error('获取会话列表失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    /**
     * 创建新会话
     */
    async createConversation(title = '新对话') {
      const userStore = useUserStore()
      if (!userStore.userId) return { success: false, error: '用户未登录' }

      try {
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_id: userStore.userId,
            title: title
          })
          .select()
          .single()

        if (error) throw error

        this.conversations.unshift(data)
        this.currentConversation = data
        this.messages = []

        return { success: true, conversation: data }
      } catch (error) {
        console.error('创建会话失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    /**
     * 选择当前会话
     */
    async selectConversation(conversationId) {
      this.loading = true
      try {
        // 找到会话
        const conversation = this.conversations.find(c => c.id === conversationId)
        if (!conversation) {
          throw new Error('会话不存在')
        }

        this.currentConversation = conversation

        // 加载消息
        await this.fetchMessages(conversationId)

        // 订阅实时更新
        this.subscribeToMessages(conversationId)

        return { success: true }
      } catch (error) {
        console.error('选择会话失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取会话的消息列表
     */
    async fetchMessages(conversationId) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })

        if (error) throw error

        this.messages = data || []
        return { success: true, messages: data }
      } catch (error) {
        console.error('获取消息失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    /**
     * 发送消息（调用 Edge Function）
     */
    async sendMessage(content) {
      if (!this.currentConversation) {
        return { success: false, error: '请先选择或创建会话' }
      }

      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, error: '用户未登录' }
      }

      this.sending = true
      this.error = null

      try {
        // 1. 创建用户消息
        const { data: userMessage, error: userMsgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: this.currentConversation.id,
            role: 'user',
            content: content
          })
          .select()
          .single()

        if (userMsgError) throw userMsgError

        // 添加到本地消息列表
        this.messages.push(userMessage)

        // 2. 调用 Edge Function 获取 AI 回复
        const { data: functionData, error: functionError } = await supabase.functions.invoke('chat', {
          body: {
            conversation_id: this.currentConversation.id,
            message: content
          }
        })

        if (functionError) throw functionError

        // Edge Function 会直接在数据库中创建 AI 消息
        // 通过 Realtime 订阅会自动更新到本地

        // 3. 更新会话的 updated_at
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', this.currentConversation.id)

        // 刷新会话列表顺序
        await this.fetchConversations()

        return { success: true, message: userMessage }
      } catch (error) {
        console.error('发送消息失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.sending = false
      }
    },

    /**
     * 订阅消息实时更新
     */
    subscribeToMessages(conversationId) {
      // 取消之前的订阅
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel)
      }

      // 创建新订阅
      this.realtimeChannel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            // 新消息插入时添加到本地
            const newMessage = payload.new
            const exists = this.messages.some(m => m.id === newMessage.id)
            if (!exists) {
              this.messages.push(newMessage)
            }
          }
        )
        .subscribe()
    },

    /**
     * 删除会话
     */
    async deleteConversation(conversationId) {
      try {
        const { error } = await supabase
          .from('conversations')
          .delete()
          .eq('id', conversationId)

        if (error) throw error

        // 从本地列表移除
        this.conversations = this.conversations.filter(c => c.id !== conversationId)

        // 如果删除的是当前会话，清空当前会话
        if (this.currentConversation?.id === conversationId) {
          this.currentConversation = null
          this.messages = []
          if (this.realtimeChannel) {
            supabase.removeChannel(this.realtimeChannel)
            this.realtimeChannel = null
          }
        }

        return { success: true }
      } catch (error) {
        console.error('删除会话失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    /**
     * 更新会话标题
     */
    async updateConversationTitle(conversationId, newTitle) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .update({ title: newTitle })
          .eq('id', conversationId)
          .select()
          .single()

        if (error) throw error

        // 更新本地会话
        const index = this.conversations.findIndex(c => c.id === conversationId)
        if (index !== -1) {
          this.conversations[index] = data
        }

        if (this.currentConversation?.id === conversationId) {
          this.currentConversation = data
        }

        return { success: true, conversation: data }
      } catch (error) {
        console.error('更新会话标题失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    /**
     * 清理状态
     */
    cleanup() {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel)
        this.realtimeChannel = null
      }
      this.currentConversation = null
      this.messages = []
      this.conversations = []
      this.error = null
    }
  }
})
