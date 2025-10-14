/**
 * Web Search Tool using Tavily API
 * Tavily 是专为 AI 应用设计的搜索 API
 */

export interface SearchResult {
  title: string
  url: string
  content: string
  score: number
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
  answer?: string // Tavily 提供的 AI 生成的答案摘要
  images?: string[]
}

export class WebSearchTool {
  private apiKey: string
  private endpoint = 'https://api.tavily.com/search'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * 执行网络搜索
   * @param query 搜索查询
   * @param options 搜索选项
   */
  async search(
    query: string,
    options: {
      maxResults?: number
      searchDepth?: 'basic' | 'advanced' // basic: 快速搜索, advanced: 深度搜索
      includeAnswer?: boolean // 是否包含 AI 生成的答案
      includeDomains?: string[] // 仅搜索指定域名
      excludeDomains?: string[] // 排除指定域名
    } = {}
  ): Promise<SearchResponse> {
    const {
      maxResults = 5,
      searchDepth = 'basic',
      includeAnswer = true,
      includeDomains = [],
      excludeDomains = []
    } = options

    const requestBody = {
      api_key: this.apiKey,
      query,
      max_results: maxResults,
      search_depth: searchDepth,
      include_answer: includeAnswer,
      include_domains: includeDomains,
      exclude_domains: excludeDomains,
      include_raw_content: false, // 不包含原始 HTML
      include_images: false // 不包含图片（可根据需要调整）
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Tavily API error: ${error}`)
      }

      const data = await response.json()

      return {
        query: data.query || query,
        results: (data.results || []).map((r: any) => ({
          title: r.title,
          url: r.url,
          content: r.content,
          score: r.score
        })),
        answer: data.answer,
        images: data.images
      }
    } catch (error) {
      console.error('Web search error:', error)
      throw error
    }
  }

  /**
   * 格式化搜索结果为文本
   */
  formatResults(searchResponse: SearchResponse): string {
    let formatted = `搜索查询: ${searchResponse.query}\n\n`

    if (searchResponse.answer) {
      formatted += `摘要答案:\n${searchResponse.answer}\n\n`
    }

    formatted += `搜索结果:\n\n`

    searchResponse.results.forEach((result, index) => {
      formatted += `${index + 1}. ${result.title}\n`
      formatted += `   来源: ${result.url}\n`
      formatted += `   内容: ${result.content}\n`
      formatted += `   相关度: ${(result.score * 100).toFixed(1)}%\n\n`
    })

    return formatted
  }

  /**
   * 简化版搜索结果格式化（用于嵌入到消息中）
   */
  formatResultsCompact(searchResponse: SearchResponse): string {
    let formatted = ''

    if (searchResponse.answer) {
      formatted += `${searchResponse.answer}\n\n`
    }

    formatted += `参考来源:\n`
    searchResponse.results.forEach((result, index) => {
      formatted += `${index + 1}. [${result.title}](${result.url})\n`
    })

    return formatted
  }

  /**
   * 决定是否需要搜索（基于查询内容分析）
   */
  shouldSearch(query: string): boolean {
    // 包含时间相关词汇
    const timeKeywords = ['最新', '今天', '昨天', '最近', '现在', '当前', '今年', '2024', '2025']
    if (timeKeywords.some(keyword => query.includes(keyword))) {
      return true
    }

    // 包含搜索相关词汇
    const searchKeywords = ['搜索', '查找', '查询', '了解', '调查', '寻找']
    if (searchKeywords.some(keyword => query.includes(keyword))) {
      return true
    }

    // 包含新闻相关词汇
    const newsKeywords = ['新闻', '消息', '事件', '发生', '报道']
    if (newsKeywords.some(keyword => query.includes(keyword))) {
      return true
    }

    // 以问号结尾且包含"什么"、"哪些"、"如何"等疑问词
    const questionWords = ['什么', '哪些', '如何', '怎么', '为什么', '谁', '哪个', '哪里']
    if (query.endsWith('?') || query.endsWith('？')) {
      if (questionWords.some(word => query.includes(word))) {
        return true
      }
    }

    return false
  }
}

/**
 * 备用：简单的 Google Custom Search 实现
 * 如果不使用 Tavily，可以使用 Google Custom Search API
 */
export class GoogleSearchTool {
  private apiKey: string
  private searchEngineId: string
  private endpoint = 'https://www.googleapis.com/customsearch/v1'

  constructor(apiKey: string, searchEngineId: string) {
    this.apiKey = apiKey
    this.searchEngineId = searchEngineId
  }

  async search(query: string, maxResults: number = 5): Promise<SearchResponse> {
    const url = `${this.endpoint}?key=${this.apiKey}&cx=${this.searchEngineId}&q=${encodeURIComponent(query)}&num=${maxResults}`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Google Search API error: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        query,
        results: (data.items || []).map((item: any) => ({
          title: item.title,
          url: item.link,
          content: item.snippet,
          score: 1.0
        }))
      }
    } catch (error) {
      console.error('Google search error:', error)
      throw error
    }
  }
}
