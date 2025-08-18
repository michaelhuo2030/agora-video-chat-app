# 🚂 Railway Deployment Guide for Agora Video Chat App

## Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/new?template=https://github.com/michaelhuo2030/agora-video-chat-app/tree/railway-test)

## Manual Deployment Steps

### 1. Prepare Your Repository
Make sure your code is pushed to the `railway-test` branch with the following structure:
```
agora-video-chat-app/
├── server.js
├── package.json
├── railway.json
├── nixpacks.toml
├── public/
│   ├── index.html
│   ├── js/
│   └── styles.css
└── .env (local only)
```

### 2. Deploy to Railway

1. **Sign up/Login to Railway**: Go to [railway.app](https://railway.app) and create an account or login

2. **Create New Project**:
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if not already connected

3. **Select Repository**:
   - Choose your repository: `michaelhuo2030/agora-video-chat-app`
   - **Important**: Select the `railway-test` branch (not main)
   - Click "Deploy Now"

4. **Configure Environment Variables**:
   - Go to your project dashboard
   - Click on "Variables" tab
   - Add the following variables:
     - `AGORA_APP_ID`: Your Agora App ID
     - `AGORA_APP_CERTIFICATE`: Your Agora App Certificate
     - `NODE_ENV`: `production`

5. **Deploy**:
   - Railway will automatically detect the Node.js project
   - It will use the `railway.json` and `nixpacks.toml` configurations
   - The deployment will start automatically

### 3. Access Your App

After deployment:
- Railway will provide a public URL (usually `https://your-app-name.railway.app`)
- The app will be accessible immediately
- Railway provides automatic HTTPS

## Railway-Specific Features

### Advantages of Railway:
- ✅ **Automatic HTTPS** - SSL certificates included
- ✅ **Custom Domains** - Easy to add your own domain
- ✅ **Environment Variables** - Secure variable management
- ✅ **Auto-deploy** - Deploys on every push to the branch
- ✅ **Health Checks** - Built-in health monitoring
- ✅ **Logs** - Real-time deployment and runtime logs
- ✅ **Scaling** - Easy to scale up/down

### Configuration Files:
- `railway.json` - Railway-specific deployment configuration
- `nixpacks.toml` - Build configuration for Railway's Nixpacks builder

## Testing Your Deployment

### 1. Health Check
Visit: `https://your-app-name.railway.app/health`
Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-08-18T...",
  "environment": "production",
  "hasAppId": true,
  "hasCertificate": true
}
```

### 2. Main App
Visit: `https://your-app-name.railway.app/`
Should show the video chat interface

### 3. API Endpoints
- `POST /generate-token` - Token generation
- `POST /channel-info` - Channel information
- `GET /health` - Health check

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Railway logs in the dashboard
   - Ensure all dependencies are in `package.json`
   - Verify `server.js` is in the root directory

2. **Environment Variables**:
   - Go to Variables tab in Railway dashboard
   - Ensure variable names match exactly
   - Check that values are correct

3. **Health Check Failures**:
   - Check if the `/health` endpoint is accessible
   - Verify the server is starting properly
   - Check Railway logs for startup errors

4. **Video Not Working**:
   - Ensure HTTPS is working (Railway provides this automatically)
   - Check browser console for WebRTC errors
   - Verify Agora credentials are set correctly

### Railway Dashboard Features:
- **Deployments** - View deployment history and logs
- **Variables** - Manage environment variables
- **Settings** - Configure custom domains, scaling, etc.
- **Logs** - Real-time application logs

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `AGORA_APP_ID` | Your Agora App ID from console | Yes |
| `AGORA_APP_CERTIFICATE` | Your Agora App Certificate | Yes |
| `NODE_ENV` | Environment (production/development) | No |
| `PORT` | Port number (Railway sets this automatically) | No |

## Comparison: Railway vs Render

| Feature | Railway | Render |
|---------|---------|--------|
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Free Tier** | ✅ | ✅ |
| **Auto-deploy** | ✅ | ✅ |
| **Custom Domains** | ✅ | ✅ |
| **HTTPS** | ✅ | ✅ |
| **Health Checks** | ✅ | ✅ |
| **Logs** | ✅ | ✅ |
| **Scaling** | ✅ | ✅ |

## Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify environment variables are set correctly
3. Test locally first: `npm start`
4. Check browser console for frontend errors
5. Use Railway's built-in health check monitoring

---

**Ready to deploy on Railway! 🚂**
