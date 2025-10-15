<template>
  <div class="persona-setup-view min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          数字分身设定
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          配置AI以你的身份和风格回答问题
        </p>
      </div>

      <!-- 完整度指示器 -->
      <n-card v-if="personaStore.hasPersona" class="mb-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm text-gray-600 dark:text-gray-400">配置完整度</span>
            <span class="ml-2 text-lg font-semibold">{{ personaStore.completeness }}%</span>
          </div>
          <n-progress type="circle" :percentage="personaStore.completeness" :show-indicator="false" :stroke-width="8"
            style="width: 60px" />
        </div>
      </n-card>

      <!-- 主表单 -->
      <n-card>
        <n-form ref="formRef" :model="formData" label-placement="top" label-width="auto" require-mark-placement="left">
          <!-- 基本信息 -->
          <n-divider title-placement="left">
            <span class="text-lg font-semibold">基本信息</span>
          </n-divider>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <n-form-item label="真实姓名" path="full_name">
              <n-input v-model:value="formData.full_name" placeholder="张三" clearable />
            </n-form-item>

            <n-form-item label="称呼/昵称" path="preferred_name">
              <n-input v-model:value="formData.preferred_name" placeholder="小张、张老师等" clearable />
            </n-form-item>

            <n-form-item label="职业" path="occupation">
              <n-input v-model:value="formData.occupation" placeholder="软件工程师" clearable />
            </n-form-item>

            <n-form-item label="公司/组织" path="company">
              <n-input v-model:value="formData.company" placeholder="XX科技公司" clearable />
            </n-form-item>

            <n-form-item label="所在地" path="location">
              <n-input v-model:value="formData.location" placeholder="北京" clearable />
            </n-form-item>

            <n-form-item label="年龄段" path="age_range">
              <n-select v-model:value="formData.age_range" :options="ageRangeOptions" clearable />
            </n-form-item>
          </div>

          <n-form-item label="教育背景" path="education">
            <n-input v-model:value="formData.education" placeholder="如：北京大学 计算机科学本科" clearable />
          </n-form-item>

          <!-- 性格与风格 -->
          <n-divider title-placement="left">
            <span class="text-lg font-semibold">性格与风格</span>
          </n-divider>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <n-form-item label="语气风格" path="tone">
              <n-select v-model:value="formData.tone" :options="toneOptions" />
            </n-form-item>

            <n-form-item label="正式程度" path="formality">
              <n-select v-model:value="formData.formality" :options="formalityOptions" />
            </n-form-item>

            <n-form-item label="回答详细度" path="detail_level">
              <n-select v-model:value="formData.detail_level" :options="detailLevelOptions" />
            </n-form-item>

            <n-form-item label="性格类型" path="personality_type">
              <n-input v-model:value="formData.personality_type" placeholder="如：INTJ、外向型等" clearable />
            </n-form-item>
          </div>

          <n-form-item label="幽默程度" path="humor_level">
            <div class="w-full">
              <div class="flex items-center gap-4 mb-2">
                <div class="flex-1">
                  <n-slider v-model:value="formData.humor_level" :min="1" :max="10" :step="1"
                    :marks="{ 1: '严肃', 5: '适中', 10: '幽默' }" />
                </div>
                <div class="flex items-center justify-center w-12 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <span class="text-lg font-bold text-primary-600 dark:text-primary-400">{{ formData.humor_level
                    }}</span>
                </div>
              </div>
            </div>
          </n-form-item>

          <n-form-item label="沟通风格描述" path="communication_style">
            <n-input v-model:value="formData.communication_style" type="textarea" :rows="3"
              placeholder="例如：我喜欢用比喻来解释复杂概念，说话时会经常反问，喜欢用'其实'开头..." show-count />
          </n-form-item>

          <!-- 专业背景 -->
          <n-divider title-placement="left">
            <span class="text-lg font-semibold">专业背景</span>
          </n-divider>

          <n-form-item label="技能标签" path="skills">
            <n-dynamic-tags v-model:value="formData.skills" />
          </n-form-item>

          <n-form-item label="专业领域" path="expertise_areas">
            <n-dynamic-tags v-model:value="formData.expertise_areas" />
          </n-form-item>

          <n-form-item label="工作经验" path="work_experience">
            <n-input v-model:value="formData.work_experience" type="textarea" :rows="3" placeholder="简要描述你的工作经历和主要项目..."
              show-count />
          </n-form-item>

          <n-form-item label="主要成就" path="achievements">
            <n-input v-model:value="formData.achievements" type="textarea" :rows="2" placeholder="列举一些你引以为豪的成就..."
              show-count />
          </n-form-item>

          <!-- 个人特色 -->
          <n-divider title-placement="left">
            <span class="text-lg font-semibold">个人特色</span>
          </n-divider>

          <n-form-item label="口头禅" path="catchphrases">
            <n-dynamic-tags v-model:value="formData.catchphrases" />
          </n-form-item>

          <n-form-item label="兴趣爱好" path="hobbies">
            <n-dynamic-tags v-model:value="formData.hobbies" />
          </n-form-item>

          <n-form-item label="喜欢讨论的话题" path="favorite_topics">
            <n-dynamic-tags v-model:value="formData.favorite_topics" />
          </n-form-item>

          <n-form-item label="价值观" path="values">
            <n-input v-model:value="formData.values" type="textarea" :rows="2" placeholder="你重视什么？相信什么？" show-count />
          </n-form-item>

          <!-- 知识库 -->
          <n-divider title-placement="left">
            <span class="text-lg font-semibold">知识库</span>
          </n-divider>

          <n-form-item label="个人观点" path="personal_views">
            <div class="space-y-2 w-full">
              <div v-for="(view, topic) in formData.personal_views" :key="topic" class="flex gap-2">
                <n-input :value="topic" placeholder="话题" disabled class="w-32" />
                <n-input :value="view" placeholder="你的观点" disabled class="flex-1" />
                <n-button @click="removePersonalView(topic)" type="error" secondary>
                  删除
                </n-button>
              </div>
              <div class="grid grid-cols-[auto_1fr_auto] gap-2 items-start">
                <n-input v-model:value="newViewTopic" placeholder="话题" class="w-32" />
                <n-input v-model:value="newViewContent" type="textarea" :rows="3" placeholder="你的观点" />
                <n-button @click="addPersonalView" type="primary">
                  添加
                </n-button>
              </div>
            </div>
          </n-form-item>

          <n-form-item label="问答示例" path="faq_examples">
            <div class="space-y-2 w-full">
              <div v-for="(example, index) in formData.faq_examples" :key="index" class="border rounded p-3 space-y-2">
                <div class="flex justify-between items-start">
                  <span class="text-sm font-semibold">示例 {{ index + 1 }}</span>
                  <n-button @click="removeFAQExample(index)" type="error" size="small" secondary>
                    删除
                  </n-button>
                </div>
                <n-input :value="example.q" placeholder="问题" disabled />
                <n-input :value="example.a" type="textarea" :rows="2" placeholder="你的回答" disabled />
              </div>
              <div class="border rounded p-3 space-y-2">
                <span class="text-sm font-semibold">添加新示例</span>
                <n-input v-model:value="newFAQQuestion" placeholder="问题" />
                <n-input v-model:value="newFAQAnswer" type="textarea" :rows="2" placeholder="你的回答" />
                <n-button @click="addFAQExample" type="primary" size="small"
                  :disabled="!newFAQQuestion || !newFAQAnswer">
                  添加示例
                </n-button>
              </div>
            </div>
          </n-form-item>

          <n-form-item label="补充信息" path="background_info">
            <n-input v-model:value="formData.background_info" type="textarea" :rows="4" placeholder="任何你希望AI了解的额外信息..."
              show-count />
          </n-form-item>

          <!-- 高级设置 -->
          <n-divider title-placement="left">
            <span class="text-lg font-semibold">高级设置</span>
          </n-divider>

          <n-form-item label="自定义指令" path="custom_instructions">
            <n-input v-model:value="formData.custom_instructions" type="textarea" :rows="3"
              placeholder="给AI的额外指令，会附加到系统提示词中..." show-count />
          </n-form-item>

          <!-- 预览生成的提示词 -->
          <n-collapse>
            <n-collapse-item title="📋 预览系统提示词" name="preview">
              <n-code :code="previewPrompt" language="text" word-wrap />
            </n-collapse-item>
          </n-collapse>
        </n-form>

        <template #footer>
          <n-space justify="space-between">
            <n-button @click="handleReset" :disabled="personaStore.saving">
              重置
            </n-button>
            <n-space>
              <n-button v-if="personaStore.hasPersona" @click="handleToggleActive"
                :type="personaStore.isActive ? 'warning' : 'default'">
                {{ personaStore.isActive ? '停用' : '启用' }}
              </n-button>
              <n-button type="primary" @click="handleSave" :loading="personaStore.saving">
                保存设定
              </n-button>
            </n-space>
          </n-space>
        </template>
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  useMessage,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSlider,
  NButton,
  NSpace,
  NDivider,
  NDynamicTags,
  NCollapse,
  NCollapseItem,
  NCode,
  NProgress
} from 'naive-ui'
import { usePersonaStore } from '@/stores/persona'
import { generateSystemPrompt } from '@/lib/personaPrompt'

const router = useRouter()
const message = useMessage()
const personaStore = usePersonaStore()

// 表单数据
const formData = ref(personaStore.getDefault())

// 新增个人观点的临时变量
const newViewTopic = ref('')
const newViewContent = ref('')

// 新增FAQ示例的临时变量
const newFAQQuestion = ref('')
const newFAQAnswer = ref('')

// 选项配置
const ageRangeOptions = [
  { label: '18-25岁', value: '18-25' },
  { label: '26-30岁', value: '26-30' },
  { label: '31-40岁', value: '31-40' },
  { label: '41-50岁', value: '41-50' },
  { label: '50岁以上', value: '50+' }
]

const toneOptions = [
  { label: '友好亲切', value: 'friendly' },
  { label: '专业严谨', value: 'professional' },
  { label: '轻松随意', value: 'casual' },
  { label: '幽默风趣', value: 'humorous' }
]

const formalityOptions = [
  { label: '非常正式', value: 'formal' },
  { label: '适度正式', value: 'moderate' },
  { label: '比较随意', value: 'casual' }
]

const detailLevelOptions = [
  { label: '简洁明了', value: 'brief' },
  { label: '适度详细', value: 'moderate' },
  { label: '详尽全面', value: 'detailed' }
]

// 计算预览提示词
const previewPrompt = computed(() => {
  return generateSystemPrompt(formData.value)
})

// 添加个人观点
const addPersonalView = () => {
  if (newViewTopic.value && newViewContent.value) {
    formData.value.personal_views[newViewTopic.value] = newViewContent.value
    newViewTopic.value = ''
    newViewContent.value = ''
  }
}

// 删除个人观点
const removePersonalView = (topic) => {
  delete formData.value.personal_views[topic]
}

// 添加FAQ示例
const addFAQExample = () => {
  if (newFAQQuestion.value && newFAQAnswer.value) {
    formData.value.faq_examples.push({
      q: newFAQQuestion.value,
      a: newFAQAnswer.value
    })
    newFAQQuestion.value = ''
    newFAQAnswer.value = ''
  }
}

// 删除FAQ示例
const removeFAQExample = (index) => {
  formData.value.faq_examples.splice(index, 1)
}

// 保存设定
const handleSave = async () => {
  const result = await personaStore.savePersona(formData.value)
  if (result.success) {
    message.success('个人设定保存成功！')
  } else {
    message.error(`保存失败: ${result.error}`)
  }
}

// 重置表单
const handleReset = () => {
  if (personaStore.hasPersona) {
    // 如果已有设定，恢复到已保存的数据
    formData.value = { ...personaStore.persona }
  } else {
    // 否则重置为默认值
    formData.value = personaStore.getDefault()
  }
  message.info('已重置')
}

// 切换激活状态
const handleToggleActive = async () => {
  const result = await personaStore.toggleActive()
  if (result.success) {
    const status = result.is_active ? '已启用' : '已停用'
    message.success(`数字分身${status}`)
  } else {
    message.error(`操作失败: ${result.error}`)
  }
}

// 初始化加载
onMounted(async () => {
  await personaStore.fetchPersona()
  if (personaStore.hasPersona) {
    formData.value = { ...personaStore.persona }
  }
})
</script>

<style scoped>
/* 自定义样式 */
</style>
