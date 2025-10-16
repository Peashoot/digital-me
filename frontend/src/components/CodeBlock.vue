<template>
  <div class="code-block-wrapper relative group bg-[#23241f] rounded-lg my-2 max-w-full overflow-hidden">
    <div class="flex items-center justify-between px-4 py-2 bg-gray-700/50 rounded-t-lg">
      <span class="text-xs font-sans text-gray-400">{{ lang || 'plaintext' }}</span>
      <button @click="copyCode" class="flex items-center gap-1.5 text-xs font-sans text-gray-300 hover:text-white transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100">
        <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <svg v-else class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ copied ? t('success.copied') : t('common.copy') }}</span>
      </button>
    </div>
    <pre class="overflow-x-auto"><code ref="codeContainer" :class="`language-${lang}`" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import xml from 'highlight.js/lib/languages/xml' // For HTML
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import typescript from 'highlight.js/lib/languages/typescript'

// Register only the languages we need to reduce bundle size
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('typescript', typescript)

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  lang: {
    type: String,
    default: ''
  }
})

const { t } = useI18n()
const copied = ref(false)

const highlightedCode = computed(() => {
  // Ensure lang is a registered language, otherwise fall back to auto-detection
  const language = props.lang && hljs.getLanguage(props.lang) ? props.lang : 'plaintext'
  try {
    const result = hljs.highlight(props.code, {
      language,
      ignoreIllegals: true
    })
    return result.value
  } catch (e) {
    console.error('Highlighting failed:', e)
    return props.code // Fallback to plain text
  }
})

const copyCode = () => {
  if (copied.value) return

  navigator.clipboard.writeText(props.code)
    .then(() => {
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    })
    .catch(err => {
      console.error('Failed to copy code:', err)
    })
}
</script>

<style scoped>
pre {
  margin: 0;
  max-width: 100%;
}

pre code.hljs {
  padding: 1rem;
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  display: block;
}

/* 增强标点符号和括号的可见度 */
:deep(code.hljs) {
  /* 括号、方括号、花括号 - 使用明亮的青色 */
  .hljs-punctuation {
    color: #66d9ef !important;
  }

  /* JSON/对象的冒号和逗号 */
  .hljs-meta {
    color: #f8f8f2 !important;
  }

  /* 确保所有未着色的文本使用亮色 */
  color: #f8f8f2;
}

/* 为未被 hljs 标记的标点符号添加样式 */
:deep(pre code) {
  /* 所有文本默认使用亮色 */
  color: #f8f8f2;
}
</style>
