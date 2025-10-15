/**
 * Gemini Model Adapter (Google AI)
 */

import { BaseModelAdapter, Message, ModelConfig, ModelResponse, StreamChunk } from './base.ts'

export class GeminiAdapter extends BaseModelAdapter {
  private baseEndpoint = 'https://generativelanguage.googleapis.com/v1beta'

  constructor(apiKey: string, config: ModelConfig) {
    super(apiKey, config)
  }

  supportsFeature(feature: 'thinking' | 'vision' | 'tools'): boolean {
    // Gemini 支持视觉和工具调用
    return feature === 'vision' || feature === 'tools'
  }

  async streamGenerate(
    messages: Message[],
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ModelResponse> {
    const geminiMessages = this.convertMessages(messages)
    const endpoint = `${this.baseEndpoint}/models/${this.config.model}:streamGenerateContent?key=${this.apiKey}`

    const requestBody = {
      contents: geminiMessages,
      generationConfig: {
        temperature: this.config.temperature || 0.7,
        maxOutputTokens: this.config.maxTokens || 8192,
        topP: this.config.topP || 0.95
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Gemini API error: ${JSON.stringify(error)}`)
    }

    return this.processStream(response, onChunk)
  }

  async generate(messages: Message[]): Promise<ModelResponse> {
    const geminiMessages = this.convertMessages(messages)
    const endpoint = `${this.baseEndpoint}/models/${this.config.model}:generateContent?key=${this.apiKey}`

    const requestBody = {
      contents: geminiMessages,
      generationConfig: {
        temperature: this.config.temperature || 0.7,
        maxOutputTokens: this.config.maxTokens || 8192,
        topP: this.config.topP || 0.95
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Gemini API error: ${JSON.stringify(error)}`)
    }

    const data = await response.json()
    return this.parseResponse(data)
  }

  private convertMessages(messages: Message[]) {
    // Gemini 使用不同的消息格式
    // system 消息需要合并到第一个 user 消息中
    const systemMessage = messages.find(m => m.role === 'system')
    const userMessages = messages.filter(m => m.role !== 'system')

    return userMessages.map((msg, index) => {
      let content = msg.content

      // 将 system prompt 添加到第一个 user 消息中
      if (index === 0 && msg.role === 'user' && systemMessage) {
        content = `${systemMessage.content}\n\n${content}`
      }

      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: content }]
      }
    })
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

        // Gemini 流式响应是 JSON 数组格式，每个元素用逗号分隔
        // 需要处理可能的多个 JSON 对象
        const jsonChunks = chunk.split('\n').filter(line => line.trim() !== '')

        for (const jsonChunk of jsonChunks) {
          try {
            const parsed = JSON.parse(jsonChunk)

            // 提取文本内容
            const candidate = parsed.candidates?.[0]
            const content = candidate?.content?.parts?.[0]?.text

            if (content) {
              fullContent += content
              onChunk({
                type: 'content',
                content: content
              })
            }

            // Token usage
            if (parsed.usageMetadata) {
              inputTokens = parsed.usageMetadata.promptTokenCount || 0
              outputTokens = parsed.usageMetadata.candidatesTokenCount || 0
            }
          } catch (e) {
            // 可能是不完整的 JSON，继续处理下一个
            console.error('Error parsing Gemini stream chunk:', e)
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
    const candidate = data.candidates?.[0]
    const content = candidate?.content?.parts?.[0]?.text || ''

    return {
      content,
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount || 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0
      }
    }
  }
}
