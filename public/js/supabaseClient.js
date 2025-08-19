// Supabase client configuration
const SUPABASE_URL = 'https://ncjihtlapumgkpoatnzx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamlodGxhcHVtZ2twb2F0bnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Njk2NzMsImV4cCI6MjA3MTE0NTY3M30.M91W6wjqlnj1i52LNc4fWqUv17SUhW2q0i_9W8dIPvw'

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Chat session management class
class SupabaseChatManager {
    constructor() {
        this.currentSession = null
        this.currentUser = null
    }

    // Create or join a chat session
    async createOrJoinSession(channelName, userName, maxParticipants = 10) {
        try {
                // First, try to get existing session
    const { data: existingSession, error: fetchError } = await supabaseClient
      .from('chat_sessions')
      .select('*')
      .eq('channel_name', channelName)
      .eq('is_active', true)
      .single()

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError
            }

            let session
            if (existingSession) {
                // Join existing session
                session = existingSession
                
                // Check if session is full
                if (session.current_participants >= session.max_participants) {
                    throw new Error('Session is full')
                }
            } else {
                    // Create new session
    const { data: newSession, error: createError } = await supabaseClient
      .from('chat_sessions')
      .insert({
        channel_name: channelName,
        max_participants: maxParticipants,
        current_participants: 0
      })
      .select()
      .single()

                if (createError) throw createError
                session = newSession
            }

                // Add user to participants
    const userId = Math.random().toString(36).substr(2, 9)
    const { error: participantError } = await supabaseClient
      .from('participants')
      .insert({
        session_id: session.id,
        user_id: userId,
        username: userName,
        is_online: true
      })

            if (participantError) throw participantError

                // Update participant count
    const { error: updateError } = await supabaseClient
      .from('chat_sessions')
      .update({ current_participants: session.current_participants + 1 })
      .eq('id', session.id)

            if (updateError) throw updateError

            this.currentSession = session
            this.currentUser = { id: userId, name: userName }

            return {
                session,
                user: { id: userId, name: userName }
            }

        } catch (error) {
            console.error('Error creating/joining session:', error)
            throw error
        }
    }

    // Leave a chat session
    async leaveSession() {
        if (!this.currentSession || !this.currentUser) {
            return
        }

        try {
                // Mark user as offline
    const { error: participantError } = await supabaseClient
      .from('participants')
      .update({ 
        is_online: false,
        left_at: new Date().toISOString()
      })
      .eq('session_id', this.currentSession.id)
      .eq('user_id', this.currentUser.id)

            if (participantError) throw participantError

                // Update participant count
    const { error: updateError } = await supabaseClient
      .from('chat_sessions')
      .update({ 
        current_participants: Math.max(0, this.currentSession.current_participants - 1) 
      })
      .eq('id', this.currentSession.id)

            if (updateError) throw updateError

            // Clear current session
            this.currentSession = null
            this.currentUser = null

        } catch (error) {
            console.error('Error leaving session:', error)
            throw error
        }
    }

    // Get all active sessions
    async getActiveSessions() {
        try {
                const { data: sessions, error } = await supabaseClient
      .from('chat_sessions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

            if (error) throw error
            return sessions

        } catch (error) {
            console.error('Error fetching active sessions:', error)
            throw error
        }
    }

    // Get session participants
    async getSessionParticipants(sessionId) {
        try {
                const { data: participants, error } = await supabaseClient
      .from('participants')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_online', true)
      .order('joined_at', { ascending: true })

            if (error) throw error
            return participants

        } catch (error) {
            console.error('Error fetching participants:', error)
            throw error
        }
    }

    // Subscribe to real-time updates
    subscribeToSessionUpdates(sessionId, callback) {
            return supabaseClient
      .channel(`session:${sessionId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'chat_sessions',
          filter: `id=eq.${sessionId}`
        }, 
        callback
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `session_id=eq.${sessionId}`
        },
        callback
      )
      .subscribe()
    }

    // Subscribe to participant updates
    subscribeToParticipantUpdates(sessionId, callback) {
            return supabaseClient
      .channel(`participants:${sessionId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `session_id=eq.${sessionId}`
        },
        callback
      )
      .subscribe()
    }
}

// Export for use in other files
window.SupabaseChatManager = SupabaseChatManager
window.supabase = supabaseClient
