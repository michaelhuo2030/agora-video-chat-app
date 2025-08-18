#!/bin/bash

echo "🚀 Deploying Agora Video Chat App to Render..."

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found. Make sure you're in the project root directory."
    exit 1
fi

# Check if we have the necessary files
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found."
    exit 1
fi

if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found."
    exit 1
fi

echo "✅ All required files found."

# Push to GitHub (if not already done)
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy to Render - $(date)"
git push origin main

echo "✅ Code pushed to GitHub."
echo ""
echo "🎯 Next Steps:"
echo "1. Go to https://render.com"
echo "2. Sign up/Login to Render"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Connect your GitHub repository: https://github.com/michaelhuo2030/agora-video-chat-app"
echo "5. Configure the service:"
echo "   - Name: agora-video-chat-app"
echo "   - Environment: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: node server.js"
echo "6. Set Environment Variables:"
echo "   - AGORA_APP_ID: Your Agora App ID"
echo "   - AGORA_APP_CERTIFICATE: Your Agora App Certificate"
echo "   - NODE_ENV: production"
echo "7. Click 'Create Web Service'"
echo ""
echo "📖 For detailed instructions, see RENDER-DEPLOYMENT.md"
echo "🔗 Quick deploy link: https://render.com/deploy?repo=https://github.com/michaelhuo2030/agora-video-chat-app"
