#!/bin/bash

# Supabase deployment script for Agora Video Chat App

echo "🚀 Starting Supabase deployment..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase status &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

# Initialize Supabase if not already initialized
if [ ! -f "supabase/config.toml" ]; then
    echo "📁 Initializing Supabase project..."
    supabase init
fi

# Link to remote project (if not already linked)
if [ ! -f ".supabase/project.toml" ]; then
    echo "🔗 Linking to remote Supabase project..."
    echo "Please enter your Supabase project reference ID:"
    read -r project_ref
    supabase link --project-ref "$project_ref"
fi

# Start local development
echo "🏃 Starting local Supabase development..."
supabase start

# Apply database migrations
echo "🗄️ Applying database migrations..."
supabase db reset

# Deploy Edge Functions
echo "⚡ Deploying Edge Functions..."
supabase functions deploy generate-token
supabase functions deploy chat-sessions

# Set environment variables for Edge Functions
echo "🔧 Setting environment variables..."
supabase secrets set AGORA_APP_ID="$AGORA_APP_ID"
supabase secrets set AGORA_APP_CERTIFICATE="$AGORA_APP_CERTIFICATE"

echo "✅ Supabase deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update the Supabase URL and anon key in public/js/supabaseClient.js"
echo "2. Set your Agora credentials as environment variables:"
echo "   export AGORA_APP_ID='your_agora_app_id'"
echo "   export AGORA_APP_CERTIFICATE='your_agora_app_certificate'"
echo "3. Deploy your frontend to a hosting service"
echo ""
echo "🌐 Local Supabase Studio: http://localhost:54323"
echo "🔗 Local API: http://localhost:54321"
