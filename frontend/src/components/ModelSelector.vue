<template>
  <div class="flex items-center gap-2">
    <select
      v-model="selectedModel"
      @change="handleModelChange"
      class="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <option v-for="model in modelOptions" :key="model.value" :value="model.value">
        {{ model.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const selectedModel = ref(chatStore.currentModel)

const modelOptions = computed(() => {
  return chatStore.availableModels.map(model => ({
    label: model.display_name,
    value: model.name
  }))
})

const handleModelChange = async () => {
  await chatStore.updateConversationConfig({ model: selectedModel.value })
}

// 监听 store 中的模型变化
watch(() => chatStore.currentModel, (newModel) => {
  selectedModel.value = newModel
})
</script>
