#!/bin/bash

# Agora Video Chat App - Vercel Deployment Script

echo "🚀 Starting Vercel deployment for Agora Video Chat App..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set environment variables in your Vercel dashboard:"
echo "   - AGORA_APP_ID"
echo "   - AGORA_APP_CERTIFICATE"
echo ""
echo "2. Or set them via CLI:"
echo "   vercel env add AGORA_APP_ID"
echo "   vercel env add AGORA_APP_CERTIFICATE"
echo ""
echo "3. Visit your deployed URL to test the application"
