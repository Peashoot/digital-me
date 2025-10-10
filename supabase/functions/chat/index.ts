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

    // Call GLM-4.5 API
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
        max_tokens: 2000,
        top_p: 0.9,
        stream: false,
      }),
    })

    if (!glmResponse.ok) {
      const errorData = await glmResponse.json()
      throw new Error(`GLM API error: ${JSON.stringify(errorData)}`)
    }

    const glmData = await glmResponse.json()
    const aiMessage = glmData.choices[0]?.message?.content

    if (!aiMessage) {
      throw new Error('No response from GLM')
    }

    // Save AI response to database
    const { data: savedMessage, error: saveError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation_id,
        role: 'assistant',
        content: aiMessage
      })
      .select()
      .single()

    if (saveError) {
      throw new Error(`Failed to save message: ${saveError.message}`)
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: savedMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, 
      }
    )

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
