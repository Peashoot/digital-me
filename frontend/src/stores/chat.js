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
    realtimeChannel: null,
    streamingMessage: null, // 存储正在流式接收的消息
    abortController: null // 用于中断请求的控制器
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
     * 进入新对话模式(不立即创建会话,等用户发送消息时再创建)
     */
    enterNewConversationMode() {
      // 清空当前会话和消息,进入"待创建"状态
      this.currentConversation = null
      this.messages = []

      // 取消之前的订阅
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel)
        this.realtimeChannel = null
      }

      console.log('进入新对话模式')
      return { success: true }
    },

    /**
     * 创建新会话(实际创建数据库记录)
     */
    async createConversation(title = '新对话') {
      const userStore = useUserStore()
      if (!userStore.userId) return { success: false, error: '用户未登录' }

      try {
        console.log('创建新会话:', title)
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

        // 订阅新会话的实时更新
        this.subscribeToMessages(data.id)

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
     * 发送消息(使用 SSE 流式接收)
     */
    async sendMessage(content) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, error: '用户未登录' }
      }
      this.error = null

      try {
        // 如果没有当前会话,先创建一个(使用消息前15个字符作为标题)
        if (!this.currentConversation) {
          const title = content.slice(0, 15)
          const result = await this.createConversation(title)
          if (!result.success) {
            throw new Error(result.error || '创建会话失败')
          }
        }

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

        // 2. 创建临时的流式消息对象(不立即添加到列表)
        const tempMessageId = `temp-${Date.now()}`
        this.streamingMessage = {
          id: tempMessageId,
          role: 'assistant',
          content: '',
          conversation_id: this.currentConversation.id,
          created_at: new Date().toISOString()
        }

        this.sending = true

        // 3. 调用 Edge Function 使用 SSE 流式接收
        console.log('开始 SSE 连接...')
        const { data: { session } } = await supabase.auth.getSession()

        // 创建 AbortController 用于中断请求
        this.abortController = new AbortController()

        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': supabase.supabaseKey
          },
          body: JSON.stringify({
            conversation_id: this.currentConversation.id,
            message: content
          }),
          signal: this.abortController.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        // 4. 处理 SSE 流
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('无法读取响应流')
        }

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              console.log('SSE 流结束')
              break
            }

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)

                try {
                  const parsed = JSON.parse(data)

                  if (parsed.type === 'chunk' && parsed.content) {
                    // 第一次收到内容时,将流式消息添加到列表
                    if (this.streamingMessage.content === '') {
                      this.messages.push(this.streamingMessage)
                    }
                    // 更新流式消息内容
                    this.streamingMessage.content += parsed.content
                    this.sending = false
                  } else if (parsed.type === 'done' && parsed.message) {
                    // 流式接收完成,用数据库中的消息替换临时消息
                    const index = this.messages.findIndex(m => m.id === tempMessageId)
                    if (index !== -1) {
                      this.messages[index] = parsed.message
                    }
                    this.streamingMessage = null
                    console.log('消息接收完成:', parsed.message)
                  } else if (parsed.type === 'error') {
                    throw new Error(parsed.error)
                  }
                } catch (e) {
                  if (data.trim()) {
                    console.error('解析 SSE 数据失败:', e, data)
                  }
                }
              }
            }
          }
        } catch (error) {
          // 如果是 AbortError，直接重新抛出让外层处理
          if (error.name === 'AbortError') {
            throw error
          }
          // 其他错误也重新抛出
          throw error
        } finally {
          // 确保 reader 被正确关闭
          try {
            reader.cancel()
          } catch (e) {
            console.log('Reader already closed')
          }
        }

        // 5. 更新会话的 updated_at
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', this.currentConversation.id)

        // 刷新会话列表顺序
        await this.fetchConversations()

        return { success: true, message: userMessage }
      } catch (error) {
        console.error('发送消息失败:', error)

        // 检查是否是用户主动中断
        if (error.name === 'AbortError') {
          console.log('请求已被用户中断')
          return { success: true, aborted: true }
        }

        this.error = error.message

        // 清理临时消息
        if (this.streamingMessage) {
          const index = this.messages.findIndex(m => m.id === this.streamingMessage.id)
          if (index !== -1) {
            this.messages.splice(index, 1)
          }
          this.streamingMessage = null
        }

        return { success: false, error: error.message }
      } finally {
        this.abortController = null
      }
    },

    /**
     * 停止消息生成
     */
    async stopGeneration() {
      console.log('停止消息生成')

      // 中断当前请求
      if (this.abortController) {
        this.abortController.abort()
        this.abortController = null
      }

      // 如果有正在流式接收的消息，保存当前内容
      if (this.streamingMessage && this.streamingMessage.content) {
        console.log('保存已生成的内容:', this.streamingMessage.content.length, '字符')

        // 保存临时消息的 ID，用于后续过滤实时订阅
        const tempId = this.streamingMessage.id

        // 保存到数据库
        await this.savePartialMessage(this.streamingMessage.content, tempId)
      } else if (this.streamingMessage) {
        // 如果还没有收到任何内容，直接移除临时消息
        const index = this.messages.findIndex(m => m.id === this.streamingMessage.id)
        if (index !== -1) {
          this.messages.splice(index, 1)
        }
      }

      // 清理流式消息
      this.streamingMessage = null
      this.sending = false
    },

    /**
     * 保存部分消息内容到数据库
     */
    async savePartialMessage(content, tempId) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: this.currentConversation.id,
            role: 'assistant',
            content: content + '\n\n[生成已中断]'
          })
          .select()
          .single()

        if (error) throw error

        // 更新本地消息列表 - 用数据库消息替换临时消息
        const tempMessageIndex = this.messages.findIndex(m => m.id === tempId)
        if (tempMessageIndex !== -1) {
          this.messages[tempMessageIndex] = data
        }

        console.log('部分消息已保存:', data)
        return { success: true, message: data }
      } catch (error) {
        console.error('保存部分消息失败:', error)
        return { success: false, error: error.message }
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

      console.log('订阅会话消息:', conversationId)

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
            console.log('收到新消息:', payload.new)
            // 新消息插入时添加到本地
            const newMessage = payload.new
            const exists = this.messages.some(m => m.id === newMessage.id)
            if (!exists) {
              console.log('添加新消息到本地列表')
              this.messages.push(newMessage)
            } else {
              console.log('消息已存在,跳过')
            }
          }
        )
        .subscribe((status) => {
          console.log('订阅状态:', status)
        })
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
