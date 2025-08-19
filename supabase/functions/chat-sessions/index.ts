import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { method } = req
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    switch (method) {
      case 'GET':
        if (path === 'list') {
          // Get all active chat sessions
          const { data: sessions, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })

          if (error) throw error

          return new Response(
            JSON.stringify({ sessions }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        } else if (path) {
          // Get specific session by channel name
          const { data: session, error } = await supabase
            .from('chat_sessions')
            .select(`
              *,
              participants (*)
            `)
            .eq('channel_name', path)
            .single()

          if (error) throw error

          return new Response(
            JSON.stringify({ session }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        break

      case 'POST':
        // Create new chat session
        const { channelName, maxParticipants = 10 } = await req.json()

        if (!channelName) {
          return new Response(
            JSON.stringify({ error: 'Channel name is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const { data: newSession, error: createError } = await supabase
          .from('chat_sessions')
          .insert({
            channel_name: channelName,
            max_participants: maxParticipants,
            current_participants: 0
          })
          .select()
          .single()

        if (createError) throw createError

        return new Response(
          JSON.stringify({ session: newSession }),
          { 
            status: 201, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'PUT':
        // Update session (join/leave participants)
        const { action, userId, username } = await req.json()
        const channelName = path

        if (!channelName || !action || !userId) {
          return new Response(
            JSON.stringify({ error: 'Channel name, action, and userId are required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Get session first
        const { data: session, error: sessionError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('channel_name', channelName)
          .single()

        if (sessionError) throw sessionError

        if (action === 'join') {
          // Add participant
          const { error: participantError } = await supabase
            .from('participants')
            .insert({
              session_id: session.id,
              user_id: userId,
              username: username || `User-${userId.slice(-4)}`
            })

          if (participantError) throw participantError

          // Update participant count
          const { error: updateError } = await supabase
            .from('chat_sessions')
            .update({ current_participants: session.current_participants + 1 })
            .eq('id', session.id)

          if (updateError) throw updateError

        } else if (action === 'leave') {
          // Mark participant as offline
          const { error: participantError } = await supabase
            .from('participants')
            .update({ 
              is_online: false,
              left_at: new Date().toISOString()
            })
            .eq('session_id', session.id)
            .eq('user_id', userId)

          if (participantError) throw participantError

          // Update participant count
          const { error: updateError } = await supabase
            .from('chat_sessions')
            .update({ current_participants: Math.max(0, session.current_participants - 1) })
            .eq('id', session.id)

          if (updateError) throw updateError
        }

        return new Response(
          JSON.stringify({ success: true }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'DELETE':
        // End session
        const { error: deleteError } = await supabase
          .from('chat_sessions')
          .update({ is_active: false })
          .eq('channel_name', path)

        if (deleteError) throw deleteError

        return new Response(
          JSON.stringify({ success: true }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Chat sessions error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
