import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

// 获取浏览器语言
function getBrowserLocale() {
  const navigatorLocale = navigator.language || navigator.userLanguage

  if (!navigatorLocale) {
    return 'zh-CN'
  }

  // 标准化语言代码
  const trimmedLocale = navigatorLocale.trim()

  if (trimmedLocale.startsWith('zh')) {
    return 'zh-CN'
  }

  if (trimmedLocale.startsWith('en')) {
    return 'en-US'
  }

  return 'zh-CN' // 默认中文
}

// 从 localStorage 获取用户选择的语言，否则使用浏览器语言
function getDefaultLocale() {
  const savedLocale = localStorage.getItem('locale')
  return savedLocale || getBrowserLocale()
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getDefaultLocale(), // 默认语言
  fallbackLocale: 'zh-CN', // 回退语言
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  },
  globalInjection: true, // 全局注入 $t 函数
  missingWarn: false, // 关闭缺失翻译警告（生产环境）
  fallbackWarn: false // 关闭回退警告
})

export default i18n

// 切换语言的辅助函数
export function setLocale(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.querySelector('html').setAttribute('lang', locale)
}

// 获取当前语言
export function getLocale() {
  return i18n.global.locale.value
}

// 支持的语言列表
export const supportedLocales = [
  { value: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { value: 'en-US', label: 'English', flag: '🇺🇸' }
]
