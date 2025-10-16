import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { useUserStore } from './user'
import { usePersonaStore } from './persona'

/**
 * 获取国际化显示名称的辅助函数
 * @param {Object} item - 包含 display_names 或 display_name 的对象
 * @param {string} locale - 语言代码（如 'zh-CN', 'en-US'）
 * @returns {string} - 显示名称
 */
function getLocalizedName(item, locale = 'zh-CN') {
  if (!item) return ''

  // 如果有 display_names JSONB 字段，优先使用
  if (item.display_names) {
    // 尝试获取对应语言的名称
    if (item.display_names[locale]) {
      return item.display_names[locale]
    }
    // 如果没有对应语言，尝试获取默认语言（zh-CN）
    if (item.display_names['zh-CN']) {
      return item.display_names['zh-CN']
    }
    // 如果都没有，使用 en-US
    if (item.display_names['en-US']) {
      return item.display_names['en-US']
    }
  }

  // 如果没有 display_names，使用 display_name
  return item.display_name || item.name || ''
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [],
    currentConversation: null,
    messages: [],
    loading: false,
    sending: false, // Represents the entire duration of AI response, used to lock input
    isTyping: false, // Represents the "typing indicator" state, before first chunk arrives
    error: null,
    realtimeChannel: null,
    streamingMessage: null, // 存储正在流式接收的消息
    streamingThinking: null, // 存储正在流式接收的思考过程
    abortController: null, // 用于中断请求的控制器
    processedMessageIds: new Set(), // 记录已通过 SSE 处理的消息 ID，避免 Realtime 重复添加

    // 新增：对话配置
    conversationConfig: {
      model: 'glm-4-flash', // 默认模型
      thinkMode: false, // 深度思考模式
      webSearch: false, // 联网查询
      temperature: 0.7,
      maxTokens: 4096
    },

    // 新增：可用的 AI 模型列表
    availableModels: [],

    // 新增：提供商列表
    providers: [],

    // 新增:文件上传相关
    uploadingFiles: [],
    uploadProgress: {}
  }),

  getters: {
    currentMessages: (state) => state.messages,
    conversationList: (state) => state.conversations,
    isLoading: (state) => state.loading,
    isSending: (state) => state.sending,
    currentModel: (state) => state.conversationConfig.model,
    isThinkModeEnabled: (state) => state.conversationConfig.thinkMode,
    isWebSearchEnabled: (state) => state.conversationConfig.webSearch,
    // 获取当前模型的提供商
    currentProvider: (state) => {
      const model = state.availableModels.find(m => m.name === state.conversationConfig.model)
      return model?.provider || 'zhipu' // 默认返回 zhipu
    },
    // 获取当前提供商的头像URL
    currentProviderAvatar: (state) => {
      const model = state.availableModels.find(m => m.name === state.conversationConfig.model)
      const providerName = model?.provider || 'zhipu'
      const provider = state.providers.find(p => p.name === providerName)
      return provider?.avatar_url || null
    }
  },

  actions: {
    /**
     * 初始化聊天功能，加载会话列表和模型列表
     */
    async initialize() {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn) return

      this.loading = true
      try {
        await Promise.all([
          this.fetchConversations(),
          this.fetchProviders(),
          this.fetchAvailableModels()
        ])
      } catch (error) {
        console.error('初始化聊天失败:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取提供商列表
     */
    async fetchProviders() {
      try {
        const { data, error } = await supabase
          .from('providers')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (error) throw error

        this.providers = data || []
        return { success: true, providers: data }
      } catch (error) {
        console.error('获取提供商列表失败:', error)
        // 如果获取失败，使用默认提供商列表
        this.providers = [
          { name: 'anthropic', display_name: 'Anthropic (Claude)' },
          { name: 'zhipu', display_name: '智谱 AI (GLM)' },
          { name: 'moonshot', display_name: 'Moonshot (Kimi)' },
          { name: 'deepseek', display_name: 'DeepSeek' },
          { name: 'xai', display_name: 'xAI (Grok)' },
          { name: 'google', display_name: 'Google (Gemini)' },
          { name: 'alibaba', display_name: '阿里云 (通义千问)' },
          { name: 'bytedance', display_name: '字节跳动 (豆包)' },
          { name: 'tencent', display_name: '腾讯 (混元)' },
          { name: 'openai', display_name: 'OpenAI' }
        ]
        return { success: false, error: error.message }
      }
    },

    /**
     * 获取可用的 AI 模型列表
     */
    async fetchAvailableModels() {
      try {
        const { data, error } = await supabase
          .from('ai_models')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })

        if (error) throw error

        this.availableModels = data || []

        // 如果模型列表不为空，将第一个模型设为默认值
        if (data && data.length > 0) {
          this.conversationConfig.model = data[0].name
        }

        return { success: true, models: data }
      } catch (error) {
        console.error('获取模型列表失败:', error)
        // 如果获取失败，使用默认模型列表
        this.availableModels = [
          { name: 'glm-4-flash', display_name: 'GLM-4-Flash', provider: 'zhipu', sort_order: 1 },
          { name: 'claude-3-5-sonnet-20240620', display_name: 'Claude 3.5 Sonnet', provider: 'anthropic', sort_order: 2 },
          { name: 'moonshot-v1-8k', display_name: 'Kimi (8K)', provider: 'moonshot', sort_order: 3 }
        ]
        // 设置默认模型
        if (this.availableModels.length > 0) {
          this.conversationConfig.model = this.availableModels[0].name
        }
        return { success: false, error: error.message }
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
      // 清空已处理的消息 ID 集合
      this.processedMessageIds.clear()

      // 重置对话配置为默认值
      const defaultModel = this.availableModels.length > 0 ? this.availableModels[0].name : 'glm-4-flash'
      this.conversationConfig = {
        model: defaultModel,
        thinkMode: false,
        webSearch: false,
        temperature: 0.7,
        maxTokens: 4096
      }

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
        // 清空已处理的消息 ID 集合
        this.processedMessageIds.clear()

        // 加载会话配置
        if (conversation.metadata) {
          this.conversationConfig = {
            model: conversation.metadata.model || 'glm-4-flash',
            thinkMode: conversation.metadata.think_mode || false,
            webSearch: conversation.metadata.web_search || false,
            temperature: conversation.metadata.temperature || 0.7,
            maxTokens: conversation.metadata.max_tokens || 4096
          }
        }

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
     * 更新对话配置
     */
    async updateConversationConfig(config) {
      if (!this.currentConversation) {
        // When no conversation is active, just update local state
        this.conversationConfig = { ...this.conversationConfig, ...config }
        return { success: true }
      }

      try {
        // 合并配置
        const newConfig = {
          ...this.conversationConfig,
          ...config
        }

        // 更新到数据库
        const { error } = await supabase
          .from('conversations')
          .update({
            metadata: {
              model: newConfig.model,
              think_mode: newConfig.thinkMode,
              web_search: newConfig.webSearch,
              temperature: newConfig.temperature,
              max_tokens: newConfig.maxTokens
            }
          })
          .eq('id', this.currentConversation.id)

        if (error) throw error

        // 更新本地状态
        this.conversationConfig = newConfig

        // 更新conversations列表中的数据
        const index = this.conversations.findIndex(c => c.id === this.currentConversation.id)
        if (index !== -1) {
          this.conversations[index].metadata = {
            model: newConfig.model,
            think_mode: newConfig.thinkMode,
            web_search: newConfig.webSearch,
            temperature: newConfig.temperature,
            max_tokens: newConfig.maxTokens
          }
        }

        return { success: true }
      } catch (error) {
        console.error('更新会话配置失败:', error)
        return { success: false, error: error.message }
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
    async sendMessage(content, uploadedFiles = []) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, error: '用户未登录' }
      }

      if (this.sending) {
        console.log('正在发送中，忽略重复请求')
        return { success: false, error: '正在发送中' }
      }

      this.error = null
      this.sending = true
      this.isTyping = true // Start typing indicator

      try {
        if (!this.currentConversation) {
          const title = content.slice(0, 15)
          const result = await this.createConversation(title)
          if (!result.success) {
            throw new Error(result.error || '创建会话失败')
          }
        }

        const messageData = {
          conversation_id: this.currentConversation.id,
          role: 'user',
          content: content
        }

        if (uploadedFiles.length > 0) {
          messageData.attachments = uploadedFiles.map(file => ({
            file_id: file.id,
            file_name: file.file_name,
            file_type: file.file_type,
            file_size: file.file_size,
            storage_path: file.storage_path
          }))
        }

        const { data: userMessage, error: userMsgError } = await supabase
          .from('messages')
          .insert(messageData)
          .select()
          .single()

        if (userMsgError) throw userMsgError

        this.messages.push(userMessage)
        this.processedMessageIds.add(userMessage.id)

        // 获取当前模型的提供商
        const currentModel = this.availableModels.find(m => m.name === this.conversationConfig.model)
        const modelProvider = currentModel?.provider || 'zhipu'

        const tempMessageId = `temp-${Date.now()}`
        this.streamingMessage = {
          id: tempMessageId,
          role: 'assistant',
          content: '',
          thinking: '',
          conversation_id: this.currentConversation.id,
          created_at: new Date().toISOString(),
          model_provider: modelProvider // 添加提供商信息
        }
        this.streamingThinking = ''

        console.log('开始 SSE 连接...')
        const { data: { session } } = await supabase.auth.getSession()

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
            message: content,
            attachments: uploadedFiles,
            config: {
              model: this.conversationConfig.model,
              think_mode: this.conversationConfig.thinkMode,
              web_search: this.conversationConfig.webSearch,
              temperature: this.conversationConfig.temperature,
              max_tokens: this.conversationConfig.maxTokens
            }
          }),
          signal: this.abortController.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

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

                  if (parsed.type === 'thinking' && parsed.content) {
                    if (this.isTyping) this.isTyping = false // Stop typing indicator
                    this.streamingThinking += parsed.content
                    if (this.streamingMessage) {
                      this.streamingMessage.thinking = this.streamingThinking
                    }
                    if (!this.messages.find(m => m.id === tempMessageId)) {
                      this.messages.push(this.streamingMessage)
                    }
                  } else if (parsed.type === 'chunk' && parsed.content) {
                    if (this.isTyping) this.isTyping = false // Stop typing indicator
                    if (this.streamingMessage.content === '' && !this.messages.find(m => m.id === tempMessageId)) {
                      this.messages.push(this.streamingMessage)
                    }
                    this.streamingMessage.content += parsed.content
                  } else if (parsed.type === 'tool_call' && parsed.toolCall) {
                    console.log('工具调用:', parsed.toolCall)
                  } else if (parsed.type === 'done' && parsed.message) {
                    this.processedMessageIds.add(parsed.message.id)

                    const index = this.messages.findIndex(m => m.id === tempMessageId)
                    if (index !== -1) {
                      this.messages.splice(index, 1)
                    }

                    const exists = this.messages.some(m => m.id === parsed.message.id)
                    if (!exists) {
                      this.messages.push(parsed.message)
                    }

                    this.streamingMessage = null
                    this.streamingThinking = null
                    this.sending = false
                    this.isTyping = false
                    console.log('[SSE] 消息接收完成')
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
        } finally {
          try {
            reader.cancel()
          } catch (e) {
            console.log('Reader already closed')
          }
        }

        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', this.currentConversation.id)

        await this.fetchConversations()

        return { success: true, message: userMessage }
      } catch (error) {
        console.error('发送消息失败:', error)
        this.sending = false
        this.isTyping = false

        if (error.name === 'AbortError') {
          console.log('请求已被用户中断')
          return { success: true, aborted: true }
        }

        this.error = error.message

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

      if (this.abortController) {
        this.abortController.abort()
        this.abortController = null
      }

      if (this.streamingMessage && this.streamingMessage.content) {
        console.log('保存已生成的内容:', this.streamingMessage.content.length, '字符')
        const tempId = this.streamingMessage.id
        await this.savePartialMessage(this.streamingMessage.content, tempId)
      } else if (this.streamingMessage) {
        const index = this.messages.findIndex(m => m.id === this.streamingMessage.id)
        if (index !== -1) {
          this.messages.splice(index, 1)
        }
      }

      this.streamingMessage = null
      this.sending = false
      this.isTyping = false
    },

    /**
     * 保存部分消息内容到数据库
     */
    async savePartialMessage(content, tempId) {
      try {
        // 获取当前模型的提供商
        const currentModel = this.availableModels.find(m => m.name === this.conversationConfig.model)
        const modelProvider = currentModel?.provider || 'zhipu'

        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: this.currentConversation.id,
            role: 'assistant',
            content: content + '\n\n[生成已中断]',
            model_provider: modelProvider // 添加提供商信息
          })
          .select()
          .single()

        if (error) throw error

        const tempMessageIndex = this.messages.findIndex(m => m.id === tempId)
        if (tempMessageIndex !== -1) {
          this.messages[tempMessageIndex] = data
        }

        this.processedMessageIds.add(data.id)

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
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel)
      }

      console.log('订阅会话消息:', conversationId)

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
            console.log('[Realtime] 收到新消息事件, message ID:', payload.new.id)
            const newMessage = payload.new
            const exists = this.messages.some(m => m.id === newMessage.id)
            console.log('[Realtime] 消息是否已存在:', exists)

            const alreadyProcessed = this.processedMessageIds.has(newMessage.id)
            console.log('[Realtime] 消息是否已被 SSE 处理:', alreadyProcessed)

            if (!exists && !alreadyProcessed) {
              console.log('[Realtime] 添加新消息到本地列表')
              this.messages.push(newMessage)
            } else {
              console.log('[Realtime] 消息已存在或已处理,跳过')
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

        this.conversations = this.conversations.filter(c => c.id !== conversationId)

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
     * 上传文件
     */
    async uploadFile(file) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, error: '用户未登录' }
      }

      try {
        const timestamp = Date.now()
        const filePath = `${userStore.userId}/${this.currentConversation?.id || 'temp'}/${timestamp}-${file.name}`

        this.uploadingFiles.push(file.name)
        this.uploadProgress[file.name] = 0

        const { data, error } = await supabase.storage
          .from('chat-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        const { data: urlData } = supabase.storage
          .from('chat-files')
          .getPublicUrl(filePath)

        const { data: fileRecord, error: dbError } = await supabase
          .from('files')
          .insert({
            user_id: userStore.userId,
            conversation_id: this.currentConversation?.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: filePath
          })
          .select()
          .single()

        if (dbError) throw dbError

        this.uploadingFiles = this.uploadingFiles.filter(f => f !== file.name)
        delete this.uploadProgress[file.name]

        return {
          success: true,
          file: fileRecord,
          url: urlData.publicUrl
        }
      } catch (error) {
        console.error('文件上传失败:', error)
        this.uploadingFiles = this.uploadingFiles.filter(f => f !== file.name)
        delete this.uploadProgress[file.name]
        return { success: false, error: error.message }
      }
    },

    /**
     * 清理状态
     */
    cleanup() {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel)
      }
      this.currentConversation = null
      this.messages = []
      this.conversations = []
      this.error = null
      this.streamingMessage = null
      this.streamingThinking = null
      this.uploadingFiles = []
      this.uploadProgress = {}
      this.processedMessageIds.clear()
    }
  }
})

// 导出辅助函数供其他组件使用
export { getLocalizedName }