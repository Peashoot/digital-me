import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { useUserStore } from './user'
import {
  generateSystemPrompt,
  validatePersona,
  getDefaultPersona,
  calculatePersonaCompleteness
} from '@/lib/personaPrompt'

export const usePersonaStore = defineStore('persona', {
  state: () => ({
    persona: null,
    loading: false,
    saving: false,
    error: null
  }),

  getters: {
    /**
     * 是否已配置个人设定
     */
    hasPersona: (state) => !!state.persona,

    /**
     * 获取系统提示词
     */
    systemPrompt: (state) => state.persona?.system_prompt || '',

    /**
     * 获取完整度百分比
     */
    completeness: (state) => {
      if (!state.persona) return 0
      return calculatePersonaCompleteness(state.persona)
    },

    /**
     * 是否激活
     */
    isActive: (state) => state.persona?.is_active ?? false,

    /**
     * 获取显示名称
     */
    displayName: (state) => {
      if (!state.persona) return ''
      return state.persona.preferred_name || state.persona.full_name || ''
    }
  },

  actions: {
    /**
     * 获取用户的个人设定
     */
    async fetchPersona() {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, error: '用户未登录' }
      }

      this.loading = true
      this.error = null

      try {
        const { data, error } = await supabase
          .from('user_persona')
          .select('*')
          .eq('user_id', userStore.userId)
          .maybeSingle()

        if (error) throw error

        this.persona = data
        return { success: true, persona: data }
      } catch (error) {
        console.error('获取个人设定失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    /**
     * 保存或更新个人设定
     */
    async savePersona(personaData) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return { success: false, error: '用户未登录' }
      }

      // 验证数据
      const validation = validatePersona(personaData)
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') }
      }

      this.saving = true
      this.error = null

      try {
        // 生成系统提示词
        const systemPrompt = generateSystemPrompt(personaData)

        // 准备数据
        const payload = {
          ...personaData,
          user_id: userStore.userId,
          system_prompt: systemPrompt,
          last_updated: new Date().toISOString()
        }

        // 如果 persona 已存在，确保包含 id
        if (this.persona?.id) {
          payload.id = this.persona.id
        }

        // Upsert 操作
        const { data, error } = await supabase
          .from('user_persona')
          .upsert(payload, {
            onConflict: 'user_id',
            returning: 'representation'
          })
          .select()
          .single()

        if (error) throw error

        this.persona = data
        console.log('个人设定保存成功:', data)

        return { success: true, persona: data }
      } catch (error) {
        console.error('保存个人设定失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.saving = false
      }
    },

    /**
     * 更新激活状态
     */
    async toggleActive() {
      if (!this.persona) {
        return { success: false, error: '未找到个人设定' }
      }

      try {
        const newActiveState = !this.persona.is_active

        const { data, error } = await supabase
          .from('user_persona')
          .update({ is_active: newActiveState })
          .eq('id', this.persona.id)
          .select()
          .single()

        if (error) throw error

        this.persona = data
        return { success: true, is_active: newActiveState }
      } catch (error) {
        console.error('更新激活状态失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    /**
     * 删除个人设定
     */
    async deletePersona() {
      if (!this.persona) {
        return { success: false, error: '未找到个人设定' }
      }

      try {
        const { error } = await supabase
          .from('user_persona')
          .delete()
          .eq('id', this.persona.id)

        if (error) throw error

        this.persona = null
        return { success: true }
      } catch (error) {
        console.error('删除个人设定失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    /**
     * 重新生成系统提示词
     */
    async regenerateSystemPrompt() {
      if (!this.persona) {
        return { success: false, error: '未找到个人设定' }
      }

      try {
        const systemPrompt = generateSystemPrompt(this.persona)

        const { data, error } = await supabase
          .from('user_persona')
          .update({ system_prompt: systemPrompt })
          .eq('id', this.persona.id)
          .select()
          .single()

        if (error) throw error

        this.persona = data
        return { success: true, system_prompt: systemPrompt }
      } catch (error) {
        console.error('重新生成系统提示词失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    /**
     * 获取默认设定
     */
    getDefault() {
      return getDefaultPersona()
    },

    /**
     * 清理状态
     */
    cleanup() {
      this.persona = null
      this.loading = false
      this.saving = false
      this.error = null
    }
  }
})
