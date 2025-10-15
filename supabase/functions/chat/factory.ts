/**
 * Model Factory
 * 根据模型名称创建相应的适配器
 */

import { BaseModelAdapter, ModelConfig } from './base.ts'
import { ClaudeAdapter } from './claude.ts'
import { MoonshotAdapter } from './moonshot.ts'
import { GLMAdapter } from './glm.ts'
import { DeepSeekAdapter } from './deepseek.ts'
import { GrokAdapter } from './grok.ts'
import { GeminiAdapter } from './gemini.ts'
import { QwenAdapter } from './qwen.ts'
import { DoubaoAdapter } from './doubao.ts'
import { HunyuanAdapter } from './hunyuan.ts'

export class ModelFactory {
  /**
   * 根据模型名称创建适配器
   */
  static createAdapter(
    modelName: string,
    apiKey: string,
    config: ModelConfig
  ): BaseModelAdapter {
    // Claude models
    if (modelName.startsWith('claude-')) {
      return new ClaudeAdapter(apiKey, config)
    }

    // Moonshot (Kimi) models
    if (modelName.startsWith('moonshot-') || modelName.startsWith('kimi-')) {
      return new MoonshotAdapter(apiKey, config)
    }

    // GLM models
    if (modelName.startsWith('glm-')) {
      return new GLMAdapter(apiKey, config)
    }

    // DeepSeek models
    if (modelName.startsWith('deepseek-')) {
      return new DeepSeekAdapter(apiKey, config)
    }

    // Grok models
    if (modelName.startsWith('grok-')) {
      return new GrokAdapter(apiKey, config)
    }

    // Gemini models
    if (modelName.startsWith('gemini-') || modelName.startsWith('gemma-')) {
      return new GeminiAdapter(apiKey, config)
    }

    // Qwen models
    if (modelName.startsWith('qwen-')) {
      return new QwenAdapter(apiKey, config)
    }

    // Doubao models (use endpoint_id as model name)
    if (modelName.startsWith('doubao-') || modelName.startsWith('ep-')) {
      return new DoubaoAdapter(apiKey, config)
    }

    // Hunyuan models
    if (modelName.startsWith('hunyuan-')) {
      return new HunyuanAdapter(apiKey, config)
    }

    throw new Error(`Unsupported model: ${modelName}`)
  }

  /**
   * 获取模型的 API Key 环境变量名称
   */
  static getApiKeyEnvName(modelName: string): string {
    if (modelName.startsWith('claude-')) {
      return 'ANTHROPIC_API_KEY'
    }
    if (modelName.startsWith('moonshot-') || modelName.startsWith('kimi-')) {
      return 'MOONSHOT_API_KEY'
    }
    if (modelName.startsWith('glm-')) {
      return 'GLM_API_KEY'
    }
    if (modelName.startsWith('deepseek-')) {
      return 'DEEPSEEK_API_KEY'
    }
    if (modelName.startsWith('grok-')) {
      return 'GROK_API_KEY'
    }
    if (modelName.startsWith('gemini-') || modelName.startsWith('gemma-')) {
      return 'GEMINI_API_KEY'
    }
    if (modelName.startsWith('qwen-')) {
      return 'QWEN_API_KEY'
    }
    if (modelName.startsWith('doubao-') || modelName.startsWith('ep-')) {
      return 'DOUBAO_API_KEY'
    }
    if (modelName.startsWith('hunyuan-')) {
      return 'HUNYUAN_API_KEY'
    }
    throw new Error(`Unknown model provider for: ${modelName}`)
  }

  /**
   * 获取默认模型配置
   */
  static getDefaultConfig(modelName: string): Partial<ModelConfig> {
    if (modelName.startsWith('claude-')) {
      return {
        temperature: 0.7,
        maxTokens: 8192,
        stream: true
      }
    }

    if (modelName.startsWith('moonshot-')) {
      const maxTokens = modelName.includes('8k') ? 8192 :
                        modelName.includes('32k') ? 32768 :
                        modelName.includes('128k') ? 131072 : 8192

      return {
        temperature: 0.7,
        maxTokens,
        stream: true
      }
    }

    if (modelName.startsWith('glm-')) {
      const maxTokens = modelName === 'glm-4-plus' ? 131072 :
                        modelName === 'glm-4-air' ? 8192 : 4096

      return {
        temperature: 0.7,
        maxTokens,
        topP: 0.9,
        stream: true
      }
    }

    if (modelName.startsWith('deepseek-')) {
      return {
        temperature: 0.7,
        maxTokens: 8192,
        stream: true
      }
    }

    if (modelName.startsWith('grok-')) {
      return {
        temperature: 0.7,
        maxTokens: 8192,
        stream: true
      }
    }

    if (modelName.startsWith('gemini-')) {
      const maxTokens = modelName.includes('pro') ? 32768 : 8192
      return {
        temperature: 0.7,
        maxTokens,
        topP: 0.95,
        stream: true
      }
    }

    if (modelName.startsWith('qwen-')) {
      const maxTokens = modelName.includes('max') ? 32768 :
                        modelName.includes('plus') ? 131072 : 8192
      return {
        temperature: 0.7,
        maxTokens,
        topP: 0.8,
        stream: true
      }
    }

    if (modelName.startsWith('doubao-') || modelName.startsWith('ep-')) {
      return {
        temperature: 0.7,
        maxTokens: 8192,
        topP: 0.9,
        stream: true
      }
    }

    if (modelName.startsWith('hunyuan-')) {
      return {
        temperature: 0.7,
        maxTokens: 8192,
        topP: 0.8,
        stream: true
      }
    }

    return {
      temperature: 0.7,
      maxTokens: 4096,
      stream: true
    }
  }
}
