#!/bin/bash

echo "🚂 Deploying Agora Video Chat App to Railway..."

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

if [ ! -f "railway.json" ]; then
    echo "❌ Error: railway.json not found."
    exit 1
fi

if [ ! -f "nixpacks.toml" ]; then
    echo "❌ Error: nixpacks.toml not found."
    exit 1
fi

echo "✅ All required files found."

# Check if we're on the railway-test branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "railway-test" ]; then
    echo "⚠️  Warning: You're not on the railway-test branch. Current branch: $CURRENT_BRANCH"
    echo "   Railway deployment should use the railway-test branch."
fi

# Push to GitHub (if not already done)
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy to Railway - $(date)"
git push origin railway-test

echo "✅ Code pushed to GitHub (railway-test branch)."
echo ""
echo "🎯 Next Steps:"
echo "1. Go to https://railway.app"
echo "2. Sign up/Login to Railway"
echo "3. Click 'Start a New Project'"
echo "4. Select 'Deploy from GitHub repo'"
echo "5. Choose repository: https://github.com/michaelhuo2030/agora-video-chat-app"
echo "6. **IMPORTANT**: Select the 'railway-test' branch (not main)"
echo "7. Click 'Deploy Now'"
echo "8. Set Environment Variables:"
echo "   - AGORA_APP_ID: Your Agora App ID"
echo "   - AGORA_APP_CERTIFICATE: Your Agora App Certificate"
echo "   - NODE_ENV: production"
echo ""
echo "📖 For detailed instructions, see RAILWAY-DEPLOYMENT.md"
echo "🔗 Quick deploy link: https://railway.app/template/new?template=https://github.com/michaelhuo2030/agora-video-chat-app/tree/railway-test"
