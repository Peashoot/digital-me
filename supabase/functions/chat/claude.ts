/**
 * Claude Model Adapter (Anthropic)
 */

import { BaseModelAdapter, Message, ModelConfig, ModelResponse, StreamChunk } from './base.ts'

export class ClaudeAdapter extends BaseModelAdapter {
  private endpoint = 'https://api.anthropic.com/v1/messages'

  constructor(apiKey: string, config: ModelConfig) {
    super(apiKey, config)
  }

  supportsFeature(feature: 'thinking' | 'vision' | 'tools'): boolean {
    // Claude 3.5 supports all features
    return true
  }

  async streamGenerate(
    messages: Message[],
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ModelResponse> {
    const anthropicMessages = this.convertMessages(messages)

    const requestBody = {
      model: this.config.model,
      max_tokens: this.config.maxTokens || 8192,
      temperature: this.config.temperature || 0.7,
      messages: anthropicMessages,
      stream: true,
      ...(this.config.thinkMode && {
        thinking: {
          type: 'enabled',
          budget_tokens: 2000
        }
      })
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Claude API error: ${JSON.stringify(error)}`)
    }

    return this.processStream(response, onChunk)
  }

  async generate(messages: Message[]): Promise<ModelResponse> {
    const anthropicMessages = this.convertMessages(messages)

    const requestBody = {
      model: this.config.model,
      max_tokens: this.config.maxTokens || 8192,
      temperature: this.config.temperature || 0.7,
      messages: anthropicMessages,
      stream: false,
      ...(this.config.thinkMode && {
        thinking: {
          type: 'enabled',
          budget_tokens: 2000
        }
      })
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Claude API error: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    return this.parseResponse(data)
  }

  private convertMessages(messages: Message[]) {
    // Claude API 不使用 system role，而是在请求体中单独设置
    const systemMessage = messages.find(m => m.role === 'system')
    const userMessages = messages.filter(m => m.role !== 'system')

    return userMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }))
  }

  private async processStream(
    response: Response,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ModelResponse> {
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No response body')
    }

    let fullContent = ''
    let thinking = ''
    let inputTokens = 0
    let outputTokens = 0

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim() !== '')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)

              // 处理思考内容
              if (parsed.type === 'content_block_start' &&
                  parsed.content_block?.type === 'thinking') {
                // 思考块开始
                continue
              }

              if (parsed.type === 'content_block_delta' &&
                  parsed.delta?.type === 'thinking_delta') {
                const thinkingChunk = parsed.delta.thinking || ''
                thinking += thinkingChunk
                onChunk({
                  type: 'thinking',
                  content: thinkingChunk
                })
                continue
              }

              // 处理正常内容
              if (parsed.type === 'content_block_delta' &&
                  parsed.delta?.type === 'text_delta') {
                const textChunk = parsed.delta.text || ''
                fullContent += textChunk
                onChunk({
                  type: 'content',
                  content: textChunk
                })
              }

              // 处理 token 使用情况
              if (parsed.type === 'message_delta' && parsed.usage) {
                outputTokens = parsed.usage.output_tokens || 0
              }

              if (parsed.type === 'message_start' && parsed.message?.usage) {
                inputTokens = parsed.message.usage.input_tokens || 0
              }
            } catch (e) {
              console.error('Error parsing Claude SSE:', e)
            }
          }
        }
      }
    } finally {
      reader.cancel()
    }

    return {
      content: fullContent,
      thinking: thinking || undefined,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens
      }
    }
  }

  private parseResponse(data: any): ModelResponse {
    const content = data.content?.[0]?.text || ''
    const thinking = data.content?.find((c: any) => c.type === 'thinking')?.thinking || undefined

    return {
      content,
      thinking,
      usage: {
        inputTokens: data.usage?.input_tokens || 0,
        outputTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      }
    }
  }
}
