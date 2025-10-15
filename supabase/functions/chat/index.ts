import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { ModelFactory } from './factory.ts'
import { WebSearchTool } from './web_search.ts'
import type { Message } from './base.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request data
    const {
      conversation_id,
      message,
      attachments = [], // attachments is an array of file objects
      config: requestConfig
    } = await req.json()

    if (!conversation_id || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // --- Start: File Processing Logic ---
    let fullUserMessage = message
    if (attachments && attachments.length > 0) {
      console.log(`[File Processing] Found ${attachments.length} attachments. `)
      const fileContents = []

      for (const attachment of attachments) {
        if (!attachment.storage_path) continue

        try {
          const { data: fileData, error: fileError } = await supabase.storage
            .from('chat-files')
            .download(attachment.storage_path)

          if (fileError) {
            console.error(`[File Processing] Error downloading file ${attachment.file_name}:`, fileError.message)
            // Optionally skip this file or throw an error
            continue
          }

          const textContent = await fileData.text()
          const formattedContent = `--- Start of file: ${attachment.file_name} ---
${textContent}
--- End of file: ${attachment.file_name} ---
`
          fileContents.push(formattedContent)
          console.log(`[File Processing] Successfully processed file: ${attachment.file_name}`)

        } catch (e) {
          console.error(`[File Processing] Exception while processing file ${attachment.file_name}:`, e.message)
        }
      }

      if (fileContents.length > 0) {
        const allFilesString = fileContents.join('\n\n')
        // Prepend file context to the user's message
        fullUserMessage = `Use the content of the following file(s) as context to answer the user's question.\n\n${allFilesString}\n\nUser's question: "${message}"`
      }
    }
    // --- End: File Processing Logic ---

    // Get conversation configuration from database (with user_id)
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('user_id, metadata')
      .eq('id', conversation_id)
      .single()

    if (convError) {
      throw new Error(`Failed to fetch conversation: ${convError.message}`)
    }

    // Parse configuration: prioritize request params over database metadata
    const dbConfig = conversation?.metadata || {}
    const config = requestConfig || dbConfig

    const modelName = config.model || 'glm-4-flash'
    const thinkMode = config.think_mode || false
    const webSearch = config.web_search || false
    const temperature = config.temperature || 0.7
    const maxTokens = config.max_tokens || 4096

    // Fetch user's persona configuration from database and use as system prompt
    let systemPrompt = 'You are a helpful AI assistant. Please provide helpful, accurate, and friendly responses.'

    if (conversation?.user_id) {
      const { data: personaData, error: personaError } = await supabase
        .from('user_persona')
        .select('is_active, system_prompt')
        .eq('user_id', conversation.user_id)
        .single()

      if (!personaError && personaData?.is_active && personaData?.system_prompt) {
        systemPrompt = personaData.system_prompt
        console.log('[Persona] Using user persona system prompt for user:', conversation.user_id)
      } else {
        console.log('[Persona] No active persona found, using default system prompt')
      }
    }

    // Get conversation messages for context
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('role, content, thinking')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw new Error(`Failed to fetch messages: ${messagesError.message}`)
    }

    // Prepare messages array
    let conversationMessages: Message[] = [
      { role: 'system', content: systemPrompt }
    ]

    if (messages && messages.length > 0) {
      conversationMessages = conversationMessages.concat(
        messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          thinking: msg.thinking
        }))
      )
    }

    // Add current user message (with file content if any)
    conversationMessages.push({
      role: 'user',
      content: fullUserMessage
    })

    // Web search if enabled
    let searchResults = null
    if (webSearch) {
      const tavilyApiKey = Deno.env.get('TAVILY_API_KEY')
      if (tavilyApiKey) {
        try {
          const webSearchTool = new WebSearchTool(tavilyApiKey)

          if (webSearchTool.shouldSearch(message)) {
            console.log('Performing web search for:', message)
            searchResults = await webSearchTool.search(message, {
              maxResults: 5,
              searchDepth: 'basic',
              includeAnswer: true
            })

            const searchContext = webSearchTool.formatResults(searchResults)
            conversationMessages.push({
              role: 'system',
              content: `网络搜索结果:\n\n${searchContext}\n\n请基于以上搜索结果回答用户的问题。`
            })
          }
        } catch (error) {
          console.error('Web search error:', error)
        }
      }
    }

    // Get API key for the selected model
    const apiKeyEnvName = ModelFactory.getApiKeyEnvName(modelName)
    const apiKey = Deno.env.get(apiKeyEnvName)

    if (!apiKey) {
      throw new Error(`API key not configured for model: ${modelName} (${apiKeyEnvName})`)
    }

    const defaultConfig = ModelFactory.getDefaultConfig(modelName)
    const modelConfig = {
      model: modelName,
      temperature,
      maxTokens,
      stream: true,
      thinkMode,
      systemPrompt,
      ...defaultConfig
    }

    const adapter = ModelFactory.createAdapter(modelName, apiKey, modelConfig)

    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = ''
        let thinkingContent = ''
        let toolCalls: any[] = []
        let isAborted = false

        const sendEvent = (data: any) => {
          if (!isAborted) {
            try {
              const event = `data: ${JSON.stringify(data)}

`
              controller.enqueue(new TextEncoder().encode(event))
            } catch (e) {
              isAborted = true
            }
          }
        }

        try {
          const response = await adapter.streamGenerate(
            conversationMessages,
            (chunk) => {
              if (isAborted) return

              if (chunk.type === 'thinking' && chunk.content) {
                thinkingContent += chunk.content
                sendEvent({ type: 'thinking', content: chunk.content })
              } else if (chunk.type === 'content' && chunk.content) {
                fullContent += chunk.content
                sendEvent({ type: 'chunk', content: chunk.content })
              } else if (chunk.type === 'tool_call' && chunk.toolCall) {
                toolCalls.push(chunk.toolCall)
                sendEvent({ type: 'tool_call', toolCall: chunk.toolCall })
              }
            }
          )

          if (!isAborted) {
            const messageData: any = {
              conversation_id: conversation_id,
              role: 'assistant',
              content: response.content || fullContent
            }

            if (response.thinking || thinkingContent) {
              messageData.thinking = response.thinking || thinkingContent
            }

            if (toolCalls.length > 0 || searchResults) {
              messageData.tool_calls = []

              if (searchResults) {
                messageData.tool_calls.push({
                  tool: 'web_search',
                  query: searchResults.query,
                  results: searchResults.results.map((r: any) => ({ title: r.title, url: r.url }))
                })
              }

              if (toolCalls.length > 0) {
                messageData.tool_calls.push(...toolCalls)
              }
            }

            const { data: savedMessage, error: saveError } = await supabase
              .from('messages')
              .insert(messageData)
              .select()
              .single()

            if (saveError) {
              console.error('Failed to save message:', saveError)
              sendEvent({ type: 'error', error: 'Failed to save message' })
            } else {
              if (response.usage) {
                await supabase
                  .from('usage_stats')
                  .insert({
                    user_id: (await supabase.auth.getUser()).data.user?.id,
                    conversation_id: conversation_id,
                    message_id: savedMessage.id,
                    model: modelName,
                    input_tokens: response.usage.inputTokens,
                    output_tokens: response.usage.outputTokens,
                    total_tokens: response.usage.totalTokens
                  })
              }

              sendEvent({ type: 'done', message: savedMessage })
            }
          }

          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          if (!isAborted) {
            sendEvent({ type: 'error', error: error.message })
          }
          controller.close()
        }
      },
      cancel() {
        console.log('Stream cancelled by client')
      }
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
