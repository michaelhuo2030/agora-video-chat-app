#!/bin/bash

# Remote Supabase deployment script for Agora Video Chat App
# This script deploys to a remote Supabase project without requiring local Docker

echo "🚀 Starting remote Supabase deployment..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

# Get project reference from user
echo "📋 Please enter your Supabase project reference ID:"
echo "   (You can find this in your Supabase project settings)"
read -r project_ref

if [ -z "$project_ref" ]; then
    echo "❌ Project reference ID is required"
    exit 1
fi

# Link to remote project
echo "🔗 Linking to remote Supabase project: $project_ref"
supabase link --project-ref "$project_ref"

# Apply database migrations
echo "🗄️ Applying database migrations..."
supabase db push

# Deploy Edge Functions
echo "⚡ Deploying Edge Functions..."
supabase functions deploy generate-token --project-ref "$project_ref"
supabase functions deploy chat-sessions --project-ref "$project_ref"

# Set environment variables for Edge Functions
echo "🔧 Setting environment variables..."
if [ -n "$AGORA_APP_ID" ]; then
    supabase secrets set AGORA_APP_ID="$AGORA_APP_ID" --project-ref "$project_ref"
else
    echo "⚠️  AGORA_APP_ID not set. Please set it manually in Supabase dashboard."
fi

if [ -n "$AGORA_APP_CERTIFICATE" ]; then
    supabase secrets set AGORA_APP_CERTIFICATE="$AGORA_APP_CERTIFICATE" --project-ref "$project_ref"
else
    echo "⚠️  AGORA_APP_CERTIFICATE not set. Please set it manually in Supabase dashboard."
fi

echo "✅ Remote Supabase deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://supabase.com/dashboard/project/$project_ref"
echo "2. Go to Settings → API to get your project URL and anon key"
echo "3. Update public/js/supabaseClient.js with your credentials:"
echo "   - SUPABASE_URL: https://$project_ref.supabase.co"
echo "   - SUPABASE_ANON_KEY: (from dashboard)"
echo "4. Set Agora credentials in Settings → Edge Functions → Secrets:"
echo "   - AGORA_APP_ID: your_agora_app_id"
echo "   - AGORA_APP_CERTIFICATE: your_agora_app_certificate"
echo "5. Deploy your frontend to a hosting service"
echo ""
echo "🔗 Your Supabase project: https://supabase.com/dashboard/project/$project_ref"
