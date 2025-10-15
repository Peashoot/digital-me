<template>
  <div class="model-selector">
    <n-select v-model:value="selectedModel" :options="groupedModelOptions" filterable
      :placeholder="t('chat.modelSelector.placeholder')" @update:value="handleModelChange"
      :consistent-menu-width="false" size="medium" :render-label="renderLabel" style="min-width: 220px">
      <template #header>
        <div class="px-3 py-2 text-xs" style="color: var(--n-text-color-3)">
          {{ t('chat.modelSelector.totalModels', { count: totalModelsCount }) }}
        </div>
      </template>
    </n-select>
  </div>
</template>

<script setup>
import { ref, computed, watch, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { NSelect, NTag } from 'naive-ui'
import { useChatStore, getLocalizedName } from '@/stores/chat'

const { t, locale } = useI18n()
const chatStore = useChatStore()

// 使用 computed 来确保 selectedModel 始终同步 store 的值
const selectedModel = computed({
  get: () => chatStore.currentModel,
  set: (value) => {
    // 这个 setter 会在 n-select 更新时被调用
    // 但实际的更新逻辑在 handleModelChange 中
  }
})

// 自定义渲染标签，添加图标
const renderLabel = (option) => {
  if (option.type === 'group') {
    return option.label
  }

  // 为选项添加特性标签
  const model = chatStore.availableModels.find(m => m.name === option.value)
  const tags = []

  if (model?.supports_thinking) {
    tags.push(h(NTag, {
      size: 'tiny',
      type: 'warning',
      style: { marginLeft: '4px' }
    }, { default: () => t('chat.modelSelector.thinking') }))
  }

  return h('div', { style: { display: 'flex', alignItems: 'center' } }, [
    h('span', option.label),
    ...tags
  ])
}

// 获取提供商显示名称（从后端返回的 display_names 获取）
const getProviderDisplayName = (providerName) => {
  const provider = chatStore.providers.find(p => p.name === providerName)
  return getLocalizedName(provider, locale.value)
}

// 获取模型显示名称（从后端返回的 display_names 获取）
const getModelDisplayName = (modelName) => {
  const model = chatStore.availableModels.find(m => m.name === modelName)
  return getLocalizedName(model, locale.value)
}

// 分组后的模型选项
const groupedModelOptions = computed(() => {
  // 先按 sort_order 排序所有模型
  const sortedModels = [...chatStore.availableModels].sort((a, b) => {
    return (a.sort_order || 999) - (b.sort_order || 999)
  })

  // 按提供商分组（保持 sort_order 顺序）
  const grouped = sortedModels.reduce((acc, model) => {
    const provider = model.provider || 'other'
    if (!acc[provider]) {
      acc[provider] = {
        models: [],
        minSortOrder: model.sort_order || 999
      }
    }
    acc[provider].models.push({
      label: getModelDisplayName(model.name),
      value: model.name,
      sortOrder: model.sort_order || 999,
      // 添加额外信息用于搜索
      extra: `${model.name} ${model.provider || ''}`.toLowerCase()
    })
    return acc
  }, {})

  // 转换为 n-select 的分组格式
  const result = []

  // 按每个提供商的最小 sort_order 排序提供商
  const sortedProviders = Object.keys(grouped).sort((a, b) => {
    return grouped[a].minSortOrder - grouped[b].minSortOrder
  })

  sortedProviders.forEach(provider => {
    const providerLabel = getProviderDisplayName(provider)
    const models = grouped[provider].models

    result.push({
      type: 'group',
      label: providerLabel,
      key: provider,
      children: models
    })
  })

  return result
})

// 总模型数量
const totalModelsCount = computed(() => {
  return chatStore.availableModels.length
})

const handleModelChange = async (value) => {
  await chatStore.updateConversationConfig({ model: value })
}

// 监听语言变化，重新触发渲染
watch(() => locale.value, () => {
  // 语言变化时，组件会自动重新渲染
})
</script>

<style scoped>
.model-selector {
  display: flex;
  align-items: center;
}
</style>
