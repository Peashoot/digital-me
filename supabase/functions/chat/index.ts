import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

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
    const { conversation_id, message } = await req.json()

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

    // Get conversation messages for context
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw new Error(`Failed to fetch messages: ${messagesError.message}`)
    }

    // Get GLM API key from environment
    const glmApiKey = Deno.env.get('GLM_API_KEY')
    if (!glmApiKey) {
      throw new Error('GLM_API_KEY not configured')
    }

    // Prepare messages for GLM
    const glmMessages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Please provide helpful, accurate, and friendly responses.'
      },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    // Call GLM-4.6 API with streaming
    const glmResponse = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${glmApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4.6',
        messages: glmMessages,
        temperature: 0.7,
        max_tokens: 65536, // GLM-4.6 支持最大 65536 tokens (64K) 输出
        top_p: 0.9,
        stream: true,
      }),
    })

    if (!glmResponse.ok) {
      const errorData = await glmResponse.json()
      throw new Error(`GLM API error: ${JSON.stringify(errorData)}`)
    }

    // Create a ReadableStream to handle SSE
    const stream = new ReadableStream({
      async start(controller) {
        const reader = glmResponse.body?.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''
        let isAborted = false

        if (!reader) {
          controller.close()
          return
        }

        // 检测客户端断开连接
        const checkAbort = () => {
          if (isAborted) {
            console.log('客户端已断开连接，停止处理')
            return true
          }
          return false
        }

        try {
          while (true) {
            // 检查客户端是否已断开
            if (checkAbort()) {
              console.log('检测到客户端断开，中止流式处理')
              break
            }

            const { done, value } = await reader.read()

            if (done) {
              // 只有在客户端未断开时才保存完整消息
              if (!isAborted) {
                // Save the complete message to database
                const { data: savedMessage, error: saveError } = await supabase
                  .from('messages')
                  .insert({
                    conversation_id: conversation_id,
                    role: 'assistant',
                    content: fullContent
                  })
                  .select()
                  .single()

                if (saveError) {
                  console.error('Failed to save message:', saveError)
                }

                // Send final event with saved message
                const finalEvent = `data: ${JSON.stringify({
                  type: 'done',
                  message: savedMessage
                })}\n\n`
                controller.enqueue(new TextEncoder().encode(finalEvent))
              }
              controller.close()
              break
            }

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n').filter(line => line.trim() !== '')

            for (const line of lines) {
              // 再次检查客户端连接
              if (checkAbort()) {
                break
              }

              if (line.startsWith('data:')) {
                const data = line.slice(5).trim()

                if (data === '[DONE]') {
                  continue
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content

                  if (content) {
                    fullContent += content
                    // Forward the chunk to client
                    const event = `data: ${JSON.stringify({
                      type: 'chunk',
                      content: content
                    })}\n\n`

                    try {
                      controller.enqueue(new TextEncoder().encode(event))
                    } catch (e) {
                      // 如果无法发送数据，说明客户端已断开
                      console.log('客户端连接已断开')
                      isAborted = true
                      break
                    }
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e)
                }
              }
            }
          }
        } catch (error) {
          // 捕获客户端断开的错误
          if (error.name === 'TypeError' || error.message.includes('aborted')) {
            console.log('客户端连接被中断')
            isAborted = true
          } else {
            console.error('Stream error:', error)
            if (!isAborted) {
              const errorEvent = `data: ${JSON.stringify({
                type: 'error',
                error: error.message
              })}\n\n`
              try {
                controller.enqueue(new TextEncoder().encode(errorEvent))
              } catch (e) {
                console.log('无法发送错误消息，客户端已断开')
              }
            }
          }
          controller.close()
        }
      },
      cancel() {
        // 当客户端主动取消时调用
        console.log('Stream cancelled by client')
      }
    })

    // Return SSE response
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
