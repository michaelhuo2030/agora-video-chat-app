# 🚀 Simple Render Deployment Guide

## Step-by-Step Instructions

### Step 1: Go to Render
1. Open your browser
2. Go to: https://render.com
3. Click "Get Started" or "Sign Up" (if you don't have an account)

### Step 2: Create New Web Service
1. After logging in, click the **"New +"** button
2. Select **"Web Service"** from the dropdown

### Step 3: Connect GitHub
1. Click **"Connect account"** next to GitHub
2. Authorize Render to access your GitHub
3. Select your repository: **`michaelhuo2030/agora-video-chat-app`**

### Step 4: Configure the Service
Fill in these exact settings:

- **Name**: `agora-video-chat-app`
- **Environment**: `Node`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Plan**: `Free`

### Step 5: Set Environment Variables
Click on **"Environment"** tab and add:

| Key | Value |
|-----|-------|
| `AGORA_APP_ID` | Your Agora App ID |
| `AGORA_APP_CERTIFICATE` | Your Agora App Certificate |
| `NODE_ENV` | `production` |

### Step 6: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment to complete (usually 2-3 minutes)

## 🔧 If You Get "Not Found" Error

### Check These Things:

1. **Repository URL**: Make sure it's exactly: `https://github.com/michaelhuo2030/agora-video-chat-app`

2. **Repository Visibility**: Make sure your GitHub repo is **public** (not private)

3. **Branch Name**: Make sure you're using the `main` branch

4. **File Structure**: Make sure these files exist in your repo:
   - `server.js` (in root)
   - `package.json` (in root)
   - `public/` folder (with index.html)

### Alternative: Manual Repository Connection

If the automatic connection doesn't work:

1. Go to your GitHub repository
2. Copy the repository URL: `https://github.com/michaelhuo2030/agora-video-chat-app`
3. In Render, paste this URL in the repository field
4. Make sure the branch is set to `main`

## 🆘 Still Getting "Not Found"?

Try these steps:

1. **Check GitHub Repository**: 
   - Go to: https://github.com/michaelhuo2030/agora-video-chat-app
   - Make sure you can see the files

2. **Check Repository Settings**:
   - Go to your GitHub repository settings
   - Make sure it's set to "Public"

3. **Try Different Approach**:
   - In Render, try searching for your repository name: `agora-video-chat-app`
   - Or try the full username/repo: `michaelhuo2030/agora-video-chat-app`

## 📞 Need Help?

If you're still getting "Not Found":
1. Take a screenshot of the error
2. Check what URL you're trying to access
3. Make sure you're logged into the correct GitHub account in Render

---

**The repository should be accessible at:**
`https://github.com/michaelhuo2030/agora-video-chat-app`
