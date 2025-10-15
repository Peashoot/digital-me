/**
 * Grok Model Adapter (xAI)
 * Grok 使用 OpenAI 兼容的 API
 */

import { BaseModelAdapter, Message, ModelConfig, ModelResponse, StreamChunk } from './base.ts'

export class GrokAdapter extends BaseModelAdapter {
  private endpoint = 'https://api.x.ai/v1/chat/completions'

  constructor(apiKey: string, config: ModelConfig) {
    super(apiKey, config)
  }

  supportsFeature(feature: 'thinking' | 'vision' | 'tools'): boolean {
    // Grok 支持工具调用
    return feature === 'tools'
  }

  async streamGenerate(
    messages: Message[],
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ModelResponse> {
    const openaiMessages = this.convertMessages(messages)

    const requestBody = {
      model: this.config.model,
      messages: openaiMessages,
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.maxTokens || 8192,
      stream: true
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Grok API error: ${JSON.stringify(error)}`)
    }

    return this.processStream(response, onChunk)
  }

  async generate(messages: Message[]): Promise<ModelResponse> {
    const openaiMessages = this.convertMessages(messages)

    const requestBody = {
      model: this.config.model,
      messages: openaiMessages,
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.maxTokens || 8192,
      stream: false
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Grok API error: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    return this.parseResponse(data)
  }

  private convertMessages(messages: Message[]) {
    return messages.map(msg => ({
      role: msg.role,
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
              const content = parsed.choices?.[0]?.delta?.content

              if (content) {
                fullContent += content
                onChunk({
                  type: 'content',
                  content: content
                })
              }

              // Token usage (if provided)
              if (parsed.usage) {
                inputTokens = parsed.usage.prompt_tokens || 0
                outputTokens = parsed.usage.completion_tokens || 0
              }
            } catch (e) {
              console.error('Error parsing Grok SSE:', e)
            }
          }
        }
      }
    } finally {
      reader.cancel()
    }

    return {
      content: fullContent,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens
      }
    }
  }

  private parseResponse(data: any): ModelResponse {
    const content = data.choices?.[0]?.message?.content || ''

    return {
      content,
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    }
  }
}
