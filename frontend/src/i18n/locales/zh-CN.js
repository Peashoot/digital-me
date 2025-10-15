export default {
  app: {
    name: 'Digital Me',
    title: 'AI 对话系统'
  },

  // 通用
  common: {
    confirm: '确认',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    save: '保存',
    close: '关闭',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    warning: '警告',
    search: '搜索',
    send: '发送',
    retry: '重试',
    copy: '复制',
    copied: '已复制',
    export: '导出',
    import: '导入',
    settings: '设置',
    logout: '退出登录',
    login: '登录'
  },

  // 导航
  nav: {
    home: '首页',
    chat: '对话',
    settings: '设置',
    about: '关于'
  },

  // 登录页面
  login: {
    title: '欢迎使用 Digital Me',
    subtitle: '基于 AI 的智能对话系统',
    githubLogin: '使用 GitHub 登录',
    description: '支持多个主流 AI 模型，提供流畅的对话体验',
    features: {
      multiModel: '多模型支持',
      realtime: '实时同步',
      privacy: '数据隐私'
    }
  },

  // 聊天页面
  chat: {
    // 欢迎页面
    welcome: {
      title: '数字分身，另一个我',
      subtitle: 'AI改变世界',
      quickActions: {
        deepThink: {
          title: '深度思考',
          description: '研究和分析问题'
        },
        code: {
          title: '代码',
          description: '编写和调试代码'
        },
        translation: {
          title: '翻译',
          description: '多语言翻译和优化'
        },
        document: {
          title: '文档',
          description: '创建和编辑文档'
        }
      }
    },

    // 会话列表
    conversationList: {
      title: '对话列表',
      newChat: '新对话',
      noConversations: '暂无对话',
      deleteTitle: '删除对话',
      deleteConfirm: '确定要删除这个对话吗？此操作无法撤销。',
      renameTitle: '重命名对话',
      placeholder: '输入新的对话标题'
    },

    // 输入框
    input: {
      placeholder: '输入消息... (Enter 发送, Shift+Enter 换行)',
      send: '发送',
      stop: '停止',
      uploading: '上传中...',
      attachFile: '附件',
      thinkMode: '深度思考',
      webSearch: '联网查询',
      expandConfig: '展开配置',
      collapseConfig: '收起',
      sendHint: 'Enter 发送',
      newlineHint: 'Shift+Enter 换行',
      thinkModeHint: '深度思考仅支持 Claude 模型',
      fileSizeLimit: '文件 "{name}" 超过 50MB 限制',
      generationStopped: '生成已中断'
    },

    // 模型选择器
    modelSelector: {
      placeholder: '选择 AI 模型',
      totalModels: '共 {count} 个模型可用',
      search: '搜索模型...',
      thinking: '思考',
      vision: '视觉',
      tools: '工具'
    },

    // 提供商名称
    providers: {
      anthropic: 'Anthropic (Claude)',
      zhipu: '智谱 AI (GLM)',
      moonshot: 'Moonshot (Kimi)',
      deepseek: 'DeepSeek',
      xai: 'xAI (Grok)',
      google: 'Google (Gemini)',
      alibaba: '阿里云 (通义千问)',
      bytedance: '字节跳动 (豆包)',
      tencent: '腾讯 (混元)',
      openai: 'OpenAI'
    },

    // 模型名称
    models: {
      'glm-4-flash': 'GLM-4-Flash',
      'glm-4-plus': 'GLM-4-Plus',
      'glm-4-air': 'GLM-4-Air',
      'glm-4-airx': 'GLM-4-AirX',
      'glm-4-long': 'GLM-4-Long',
      'glm-4v-plus': 'GLM-4V-Plus',
      'glm-4v': 'GLM-4V',
      'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
      'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
      'claude-3-opus-20240229': 'Claude 3 Opus',
      'moonshot-v1-8k': 'Kimi (8K)',
      'moonshot-v1-32k': 'Kimi (32K)',
      'moonshot-v1-128k': 'Kimi (128K)',
      'deepseek-chat': 'DeepSeek Chat',
      'deepseek-reasoner': 'DeepSeek 推理',
      'grok-beta': 'Grok Beta',
      'grok-2-1212': 'Grok 2',
      'gemini-2.0-flash-exp': 'Gemini 2.0 Flash',
      'gemini-exp-1206': 'Gemini 实验版',
      'qwen-max': '通义千问 Max',
      'qwen-plus': '通义千问 Plus',
      'qwen-turbo': '通义千问 Turbo',
      'qwen-long': '通义千问 Long',
      'doubao-pro-32k': '豆包 Pro (32K)',
      'doubao-pro-128k': '豆包 Pro (128K)',
      'doubao-lite-32k': '豆包 Lite (32K)',
      'doubao-lite-128k': '豆包 Lite (128K)',
      'hunyuan-lite': '混元 Lite',
      'hunyuan-standard': '混元 Standard',
      'hunyuan-pro': '混元 Pro',
      'hunyuan-turbo': '混元 Turbo'
    },

    // 消息
    message: {
      user: '用户',
      assistant: '助手',
      thinking: '思考中...',
      generating: '生成中...',
      copyCode: '复制代码',
      regenerate: '重新生成',
      delete: '删除消息'
    },

    // 文件
    file: {
      uploaded: '已上传',
      uploading: '上传中',
      uploadFailed: '上传失败',
      remove: '移除文件',
      preview: '预览'
    }
  },

  // 设置页面
  settings: {
    title: '设置',
    profile: {
      title: '个人资料',
      username: '用户名',
      email: '邮箱',
      avatar: '头像'
    },
    appearance: {
      title: '外观',
      theme: '主题',
      light: '浅色',
      dark: '深色',
      auto: '跟随系统',
      language: '语言'
    },
    data: {
      title: '数据管理',
      export: '导出数据',
      import: '导入数据',
      clear: '清除数据',
      clearConfirm: '确定要清除所有数据吗？此操作不可恢复！'
    },
    about: {
      title: '关于',
      version: '版本',
      website: '官方网站',
      github: 'GitHub',
      feedback: '反馈问题'
    }
  },

  // 错误消息
  error: {
    network: '网络错误，请检查网络连接',
    unauthorized: '未授权，请重新登录',
    notFound: '未找到请求的资源',
    serverError: '服务器错误，请稍后重试',
    unknown: '未知错误',
    loginFailed: '登录失败',
    sendFailed: '发送失败',
    uploadFailed: '上传失败',
    deleteFailed: '删除失败'
  },

  // 成功消息
  success: {
    saved: '保存成功',
    deleted: '删除成功',
    copied: '复制成功',
    exported: '导出成功',
    uploaded: '上传成功'
  }
}
