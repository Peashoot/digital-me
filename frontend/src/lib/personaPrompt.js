/**
 * 系统提示词生成工具
 * 根据用户的个人设定自动生成系统提示词
 */

/**
 * 生成系统提示词
 * @param {Object} persona - 用户个人设定对象
 * @returns {string} 生成的系统提示词
 */
export function generateSystemPrompt(persona) {
  if (!persona) return ''

  const parts = []

  // ========== 1. 基本身份 ==========
  if (persona.full_name || persona.preferred_name) {
    const name = persona.preferred_name || persona.full_name
    parts.push(`你现在要扮演 ${name}。`)
  } else {
    parts.push('你现在要扮演用户本人。')
  }

  // 职业和公司
  if (persona.occupation) {
    let jobDesc = `你是一名${persona.occupation}`
    if (persona.company) {
      jobDesc += `，在${persona.company}工作`
    }
    parts.push(jobDesc + '。')
  }

  // 地点和教育背景
  const backgroundParts = []
  if (persona.location) {
    backgroundParts.push(`位于${persona.location}`)
  }
  if (persona.education) {
    backgroundParts.push(`教育背景：${persona.education}`)
  }
  if (backgroundParts.length > 0) {
    parts.push(backgroundParts.join('，') + '。')
  }

  // ========== 2. 专业背景 ==========
  if (persona.expertise_areas?.length > 0) {
    parts.push(`\n你的专业领域包括：${persona.expertise_areas.join('、')}。`)
  }

  if (persona.skills?.length > 0) {
    parts.push(`你掌握的技能有：${persona.skills.join('、')}。`)
  }

  if (persona.work_experience) {
    parts.push(`\n工作经验：${persona.work_experience}`)
  }

  if (persona.achievements) {
    parts.push(`主要成就：${persona.achievements}`)
  }

  // ========== 3. 性格和沟通风格 ==========
  parts.push('\n') // 空行分隔

  // 语气风格映射
  const toneMap = {
    friendly: '友好亲切',
    professional: '专业严谨',
    casual: '轻松随意',
    humorous: '幽默风趣'
  }

  if (persona.tone) {
    const toneDesc = toneMap[persona.tone] || persona.tone
    parts.push(`你的说话风格是${toneDesc}的。`)
  }

  // 正式程度映射
  const formalityMap = {
    formal: '非常正式',
    moderate: '适度正式',
    casual: '比较随意'
  }

  if (persona.formality) {
    const formalityDesc = formalityMap[persona.formality] || persona.formality
    parts.push(`你的表达方式${formalityDesc}。`)
  }

  // 幽默程度
  if (persona.humor_level !== undefined && persona.humor_level !== null) {
    if (persona.humor_level >= 8) {
      parts.push('你经常使用幽默和玩笑来活跃气氛。')
    } else if (persona.humor_level >= 5) {
      parts.push('你会适当使用幽默，但不会过度。')
    } else if (persona.humor_level >= 3) {
      parts.push('你偶尔会开玩笑，但总体比较严肃。')
    } else {
      parts.push('你通常保持严肃和专业。')
    }
  }

  // 沟通风格
  if (persona.communication_style) {
    parts.push(`\n${persona.communication_style}`)
  }

  // ========== 4. 回答方式 ==========
  const detailMap = {
    brief: '简洁明了，直接给出答案，不过度展开',
    moderate: '适度详细，给出必要的解释和背景信息',
    detailed: '详尽全面，提供深入的分析、多个角度的思考和丰富的背景信息'
  }

  if (persona.detail_level) {
    parts.push(`\n在回答问题时，你会${detailMap[persona.detail_level]}。`)
  }

  // ========== 5. 个人特色 ==========
  if (persona.catchphrases?.length > 0) {
    parts.push(`\n你经常会说这些口头禅："${persona.catchphrases.join('"、"')}"。`)
  }

  if (persona.hobbies?.length > 0) {
    parts.push(`你的兴趣爱好包括：${persona.hobbies.join('、')}。`)
  }

  if (persona.favorite_topics?.length > 0) {
    parts.push(`你喜欢讨论的话题有：${persona.favorite_topics.join('、')}。`)
  }

  if (persona.values) {
    parts.push(`\n你的价值观：${persona.values}`)
  }

  // ========== 6. 知识库 ==========
  // 个人观点
  if (persona.personal_views && Object.keys(persona.personal_views).length > 0) {
    parts.push('\n你对以下话题有明确的看法：')
    Object.entries(persona.personal_views).forEach(([topic, view]) => {
      parts.push(`- 关于${topic}：${view}`)
    })
  }

  // FAQ示例
  if (persona.faq_examples?.length > 0) {
    parts.push('\n以下是一些你典型的回答示例，请学习这种风格：')
    persona.faq_examples.forEach((example, index) => {
      parts.push(`\n示例${index + 1}：`)
      parts.push(`问：${example.q}`)
      parts.push(`答：${example.a}`)
    })
  }

  // 补充背景信息
  if (persona.background_info) {
    parts.push(`\n补充信息：${persona.background_info}`)
  }

  // ========== 7. 自定义指令 ==========
  if (persona.custom_instructions) {
    parts.push(`\n${persona.custom_instructions}`)
  }

  // ========== 8. 总结指令 ==========
  parts.push('\n\n重要：请始终保持这个身份和人设，用一致的风格、语气和个性来回答所有问题。不要说"作为AI"这样的话，而是以这个人的身份直接回答。')

  return parts.join('\n')
}

/**
 * 验证个人设定数据的完整性
 * @param {Object} persona - 个人设定对象
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validatePersona(persona) {
  const errors = []

  // 至少需要姓名或昵称之一
  if (!persona.full_name && !persona.preferred_name) {
    errors.push('请至少填写真实姓名或昵称')
  }

  // 检查幽默程度范围
  if (persona.humor_level !== undefined && persona.humor_level !== null) {
    if (persona.humor_level < 1 || persona.humor_level > 10) {
      errors.push('幽默程度必须在1-10之间')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 获取默认的个人设定
 * @returns {Object} 默认设定对象
 */
export function getDefaultPersona() {
  return {
    full_name: '',
    preferred_name: '',
    occupation: '',
    company: '',
    location: '',
    age_range: '',
    education: '',
    personality_type: '',
    communication_style: '',
    tone: 'friendly',
    formality: 'moderate',
    humor_level: 5,
    detail_level: 'moderate',
    skills: [],
    expertise_areas: [],
    work_experience: '',
    achievements: '',
    catchphrases: [],
    favorite_topics: [],
    values: '',
    hobbies: [],
    personal_views: {},
    faq_examples: [],
    background_info: '',
    custom_instructions: ''
  }
}

/**
 * 计算个人设定的完整度百分比
 * @param {Object} persona - 个人设定对象
 * @returns {number} 完整度百分比 (0-100)
 */
export function calculatePersonaCompleteness(persona) {
  if (!persona) return 0

  const fields = [
    'full_name',
    'preferred_name',
    'occupation',
    'company',
    'location',
    'education',
    'communication_style',
    'work_experience',
    'achievements',
    'values',
    'background_info'
  ]

  const arrayFields = [
    'skills',
    'expertise_areas',
    'catchphrases',
    'favorite_topics',
    'hobbies',
    'faq_examples'
  ]

  const objectFields = ['personal_views']

  let filledCount = 0
  const totalFields = fields.length + arrayFields.length + objectFields.length

  // 检查普通字段
  fields.forEach((field) => {
    if (persona[field] && persona[field].trim().length > 0) {
      filledCount++
    }
  })

  // 检查数组字段
  arrayFields.forEach((field) => {
    if (persona[field] && persona[field].length > 0) {
      filledCount++
    }
  })

  // 检查对象字段
  objectFields.forEach((field) => {
    if (persona[field] && Object.keys(persona[field]).length > 0) {
      filledCount++
    }
  })

  return Math.round((filledCount / totalFields) * 100)
}
