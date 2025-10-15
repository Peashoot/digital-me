<template>
  <div class="model-selector">
    <n-select
      v-model:value="selectedModel"
      :options="groupedModelOptions"
      filterable
      placeholder="选择 AI 模型"
      @update:value="handleModelChange"
      :consistent-menu-width="false"
      size="medium"
      :render-label="renderLabel"
      style="min-width: 220px"
    >
      <template #header>
        <div class="px-3 py-2 text-xs" style="color: var(--n-text-color-3)">
          共 {{ totalModelsCount }} 个模型可用
        </div>
      </template>
    </n-select>
  </div>
</template>

<script setup>
import { ref, computed, watch, h } from 'vue'
import { NSelect, NTag } from 'naive-ui'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const selectedModel = ref(chatStore.currentModel)

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
    }, { default: () => '思考' }))
  }

  return h('div', { style: { display: 'flex', alignItems: 'center' } }, [
    h('span', option.label),
    ...tags
  ])
}

// 提供商显示名称映射（从数据库读取）
const providerDisplayName = computed(() => {
  const map = {}
  chatStore.providers.forEach(provider => {
    map[provider.name] = provider.display_name
  })
  return map
})

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
      label: model.display_name,
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
    const providerLabel = providerDisplayName.value[provider] || provider
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

// 监听 store 中的模型变化
watch(() => chatStore.currentModel, (newModel) => {
  selectedModel.value = newModel
})
</script>

<style scoped>
.model-selector {
  display: flex;
  align-items: center;
}
</style>
