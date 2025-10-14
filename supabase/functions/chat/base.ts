/**
 * Base Model Adapter Interface
 * 所有 AI 模型适配器的基础接口
 */

export interface ModelConfig {
  model: string
  temperature?: number
  maxTokens?: number
  topP?: number
  stream?: boolean
  thinkMode?: boolean
  systemPrompt?: string
}

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
  thinking?: string // 思考过程（如果有）
}

export interface StreamChunk {
  type: 'thinking' | 'content' | 'tool_call' | 'done' | 'error'
  content?: string
  toolCall?: ToolCall
  message?: any
  error?: string
}

export interface ToolCall {
  tool: string
  query: string
  result?: any
}

export interface ModelResponse {
  content: string
  thinking?: string
  toolCalls?: ToolCall[]
  finishReason?: string
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
}

/**
 * Abstract base class for all model adapters
 */
export abstract class BaseModelAdapter {
  protected config: ModelConfig
  protected apiKey: string

  constructor(apiKey: string, config: ModelConfig) {
    this.apiKey = apiKey
    this.config = config
  }

  /**
   * Generate a streaming response
   */
  abstract streamGenerate(
    messages: Message[],
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ModelResponse>

  /**
   * Generate a non-streaming response
   */
  abstract generate(messages: Message[]): Promise<ModelResponse>

  /**
   * Check if the model supports a specific feature
   */
  abstract supportsFeature(feature: 'thinking' | 'vision' | 'tools'): boolean

  /**
   * Get the model name
   */
  getModelName(): string {
    return this.config.model
  }

  /**
   * Prepare system prompt with thinking instructions if enabled
   */
  protected prepareSystemPrompt(): string {
    let prompt = this.config.systemPrompt || 'You are a helpful AI assistant.'

    if (this.config.thinkMode && this.supportsFeature('thinking')) {
      prompt += '\n\nWhen responding, you should think deeply about the question before answering. Use the <thinking> tag to show your thought process, then provide your final answer.'
    }

    return prompt
  }
}
