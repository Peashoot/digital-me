/**
 * Model Factory
 * 根据模型名称创建相应的适配器
 */

import { BaseModelAdapter, ModelConfig } from './base.ts'
import { ClaudeAdapter } from './claude.ts'
import { MoonshotAdapter } from './moonshot.ts'
import { GLMAdapter } from './glm.ts'

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
    if (modelName.startsWith('moonshot-')) {
      return new MoonshotAdapter(apiKey, config)
    }

    // GLM models
    if (modelName.startsWith('glm-')) {
      return new GLMAdapter(apiKey, config)
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
    if (modelName.startsWith('moonshot-')) {
      return 'MOONSHOT_API_KEY'
    }
    if (modelName.startsWith('glm-')) {
      return 'GLM_API_KEY'
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

    return {
      temperature: 0.7,
      maxTokens: 4096,
      stream: true
    }
  }
}
