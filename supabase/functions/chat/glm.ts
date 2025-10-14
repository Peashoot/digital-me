/**
 * GLM (Zhipu AI) Model Adapter
 */

import { BaseModelAdapter, Message, ModelConfig, ModelResponse, StreamChunk } from './base.ts'

export class GLMAdapter extends BaseModelAdapter {
  private endpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

  constructor(apiKey: string, config: ModelConfig) {
    super(apiKey, config)
  }

  supportsFeature(feature: 'thinking' | 'vision' | 'tools'): boolean {
    // GLM-4-Plus 支持视觉和工具，但不支持原生的思考模式
    if (this.config.model === 'glm-4-plus') {
      return feature === 'vision' || feature === 'tools'
    }
    return false
  }

  async streamGenerate(
    messages: Message[],
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ModelResponse> {
    const glmMessages = this.convertMessages(messages)

    const requestBody = {
      model: this.config.model,
      messages: glmMessages,
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.maxTokens || 4096,
      top_p: this.config.topP || 0.9,
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
      throw new Error(`GLM API error: ${JSON.stringify(error)}`)
    }

    return this.processStream(response, onChunk)
  }

  async generate(messages: Message[]): Promise<ModelResponse> {
    const glmMessages = this.convertMessages(messages)

    const requestBody = {
      model: this.config.model,
      messages: glmMessages,
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.maxTokens || 4096,
      top_p: this.config.topP || 0.9,
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
      throw new Error(`GLM API error: ${JSON.stringify(error)}`)
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
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim()
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

              // Token usage
              if (parsed.usage) {
                inputTokens = parsed.usage.prompt_tokens || 0
                outputTokens = parsed.usage.completion_tokens || 0
              }
            } catch (e) {
              console.error('Error parsing GLM SSE:', e)
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
