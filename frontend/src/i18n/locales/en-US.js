export default {
  app: {
    name: 'Digital Me',
    title: 'AI Chat System'
  },

  // Common
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    search: 'Search',
    send: 'Send',
    retry: 'Retry',
    copy: 'Copy',
    copied: 'Copied',
    export: 'Export',
    import: 'Import',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login'
  },

  // Navigation
  nav: {
    home: 'Home',
    chat: 'Chat',
    settings: 'Settings',
    about: 'About'
  },

  // Login Page
  login: {
    title: 'Welcome to Digital Me',
    subtitle: 'AI-Powered Intelligent Chat System',
    githubLogin: 'Login with GitHub',
    description: 'Support multiple mainstream AI models with smooth chat experience',
    features: {
      multiModel: 'Multi-Model Support',
      realtime: 'Real-time Sync',
      privacy: 'Data Privacy'
    }
  },

  // Chat Page
  chat: {
    // Welcome Page
    welcome: {
      title: 'Digital Me, Another Self',
      subtitle: 'AI Changes the World',
      quickActions: {
        deepThink: {
          title: 'Deep Think',
          description: 'Research and analyze problems'
        },
        code: {
          title: 'Code',
          description: 'Write and debug code'
        },
        translation: {
          title: 'Translation',
          description: 'Multi-language translation and optimization'
        },
        document: {
          title: 'Documents',
          description: 'Create and edit documents'
        }
      }
    },

    // Conversation List
    conversationList: {
      title: 'Conversations',
      newChat: 'New Chat',
      noConversations: 'No conversations yet',
      deleteTitle: 'Delete Conversation',
      deleteConfirm: 'Are you sure you want to delete this conversation? This action cannot be undone.',
      renameTitle: 'Rename Conversation',
      placeholder: 'Enter new conversation title',
      startConversation: 'Start a new conversation...',
      messageCount: '{count} messages',
      startChat: 'Start Chat'
    },

    // Input Box
    input: {
      placeholder: 'Type a message... (Enter to send, Shift+Enter for new line)',
      send: 'Send',
      stop: 'Stop',
      uploading: 'Uploading...',
      attachFile: 'Attach',
      thinkMode: 'Deep Think',
      webSearch: 'Web Search',
      expandConfig: 'Expand',
      collapseConfig: 'Collapse',
      sendHint: 'Enter to send',
      newlineHint: 'Shift+Enter for new line',
      thinkModeHint: 'Deep Think only supports Claude models',
      fileSizeLimit: 'File "{name}" exceeds 50MB limit',
      fileTypeNotAllowed: 'Unsupported file type: {type}',
      generationStopped: 'Generation stopped'
    },

    // Model Selector
    modelSelector: {
      placeholder: 'Select AI Model',
      totalModels: '{count} models available',
      search: 'Search models...',
      thinking: 'Think',
      vision: 'Vision',
      tools: 'Tools'
    },

    // Provider Names
    providers: {
      anthropic: 'Anthropic (Claude)',
      zhipu: 'Zhipu AI (GLM)',
      moonshot: 'Moonshot (Kimi)',
      deepseek: 'DeepSeek',
      xai: 'xAI (Grok)',
      google: 'Google (Gemini)',
      alibaba: 'Alibaba Cloud (Qwen)',
      bytedance: 'ByteDance (Doubao)',
      tencent: 'Tencent (Hunyuan)',
      openai: 'OpenAI'
    },

    // Model Names
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
      'deepseek-reasoner': 'DeepSeek Reasoner',
      'grok-beta': 'Grok Beta',
      'grok-2-1212': 'Grok 2',
      'gemini-2.0-flash-exp': 'Gemini 2.0 Flash',
      'gemini-exp-1206': 'Gemini Experimental',
      'qwen-max': 'Qwen Max',
      'qwen-plus': 'Qwen Plus',
      'qwen-turbo': 'Qwen Turbo',
      'qwen-long': 'Qwen Long',
      'doubao-pro-32k': 'Doubao Pro (32K)',
      'doubao-pro-128k': 'Doubao Pro (128K)',
      'doubao-lite-32k': 'Doubao Lite (32K)',
      'doubao-lite-128k': 'Doubao Lite (128K)',
      'hunyuan-lite': 'Hunyuan Lite',
      'hunyuan-standard': 'Hunyuan Standard',
      'hunyuan-pro': 'Hunyuan Pro',
      'hunyuan-turbo': 'Hunyuan Turbo'
    },

    // Messages
    message: {
      user: 'User',
      assistant: 'Assistant',
      thinking: 'Thinking...',
      generating: 'Generating...',
      copyCode: 'Copy Code',
      regenerate: 'Regenerate',
      delete: 'Delete Message',
      thinkingProcess: 'Thinking Process',
      interrupted: 'Generation Interrupted',
      query: 'Query',
      referenceSources: 'Reference Sources'
    },

    // Tools
    tools: {
      webSearch: 'Web Search',
      codeInterpreter: 'Code Interpreter',
      fileReader: 'File Reader'
    },

    // Time
    time: {
      justNow: 'Just now',
      minutesAgo: '{minutes} minutes ago',
      hoursAgo: '{hours} hours ago'
    },

    // Files
    file: {
      uploaded: 'Uploaded',
      uploading: 'Uploading',
      uploadFailed: 'Upload Failed',
      remove: 'Remove File',
      preview: 'Preview'
    }
  },

  // Settings Page
  settings: {
    title: 'Settings',
    profile: {
      title: 'Profile',
      username: 'Username',
      email: 'Email',
      avatar: 'Avatar',
      nickname: 'Nickname',
      bio: 'Bio',
      usernameNotEditable: 'Username cannot be changed',
      nicknamePlaceholder: 'Enter nickname',
      emailPlaceholder: 'Enter email',
      bioPlaceholder: 'Tell us about yourself...',
      conversations: 'Conversations',
      messages: 'Messages',
      days: 'Days',
      editProfile: 'Edit Profile',
      reset: 'Reset',
      save: 'Save',
      saving: 'Saving...',
      saveSuccess: 'Saved successfully',
      saveError: 'Save failed',
      connectedAccounts: 'Connected Accounts',
      connected: 'Connected',
      bound: 'Bound',
      digitalTwin: 'Digital Twin',
      enabled: 'Enabled',
      disabled: 'Disabled',
      digitalTwinDescription: 'Configure AI to answer questions in your identity and style, creating your exclusive digital twin',
      createDigitalTwin: 'Create Digital Twin',
      editDigitalTwin: 'Edit Digital Twin',
      displayName: 'Display Name',
      lastUpdated: 'Last Updated',
      notSet: 'Not Set',
      completeness: 'Completeness',
      uploadAvatar: 'Avatar upload feature coming soon',
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: '{days} days ago',
      weeksAgo: '{weeks} weeks ago',
      monthsAgo: '{months} months ago',
      saveErrorOccurred: 'An error occurred while saving'
    },
    appearance: {
      title: 'Appearance',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      auto: 'System',
      language: 'Language',
      languagePreference: 'Language Preference',
      languageDescription: 'Choose interface display language'
    },
    data: {
      title: 'Data Management',
      export: 'Export Data',
      import: 'Import Data',
      clear: 'Clear Data',
      clearConfirm: 'Are you sure you want to clear all data? This action cannot be undone!'
    },
    about: {
      title: 'About',
      version: 'Version',
      website: 'Website',
      github: 'GitHub',
      feedback: 'Feedback'
    }
  },

  // Error Messages
  error: {
    network: 'Network error, please check your connection',
    unauthorized: 'Unauthorized, please login again',
    notFound: 'Resource not found',
    serverError: 'Server error, please try again later',
    unknown: 'Unknown error',
    loginFailed: 'Login failed',
    sendFailed: 'Send failed',
    uploadFailed: 'Upload failed',
    deleteFailed: 'Delete failed',
    sendMessageFailed: 'Failed to send message: {error}',
    copyFailed: 'Copy failed'
  },

  // Success Messages
  success: {
    saved: 'Saved successfully',
    deleted: 'Deleted successfully',
    copied: 'Copied successfully',
    exported: 'Exported successfully',
    uploaded: 'Uploaded successfully'
  }
}
