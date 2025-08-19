import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { method } = req
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    switch (method) {
      case 'GET':
        if (path === 'list') {
          // Simple response for now
          return new Response(
            JSON.stringify({ 
              sessions: [],
              message: 'Chat sessions endpoint - database integration pending'
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        } else if (path) {
          // Get specific session by channel name
          return new Response(
            JSON.stringify({ 
              session: {
                channel_name: path,
                current_participants: 0,
                max_participants: 10,
                is_active: true
              },
              message: 'Mock session data - database integration pending'
            }),
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

        return new Response(
          JSON.stringify({ 
            session: {
              channel_name: channelName,
              max_participants: maxParticipants,
              current_participants: 0,
              is_active: true
            },
            message: 'Mock session created - database integration pending'
          }),
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

        return new Response(
          JSON.stringify({ 
            success: true,
            message: `Mock ${action} action for user ${userId} - database integration pending`
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'DELETE':
        // End session
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Mock session ended - database integration pending'
          }),
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
