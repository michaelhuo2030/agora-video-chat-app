# Render Deployment Guide for Agora Video Chat App

## Quick Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/your-username/agora-video-chat-app)

## Manual Deployment Steps

### 1. Prepare Your Repository
Make sure your code is pushed to GitHub with the following structure:
```
agora-video-chat-app/
├── server.js
├── package.json
├── render.yaml
├── public/
│   ├── index.html
│   ├── js/
│   └── styles.css
└── .env (local only)
```

### 2. Deploy to Render

1. **Sign up/Login to Render**: Go to [render.com](https://render.com) and create an account or login

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `agora-video-chat-app` repository

3. **Configure the Service**:
   - **Name**: `agora-video-chat-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (or choose paid for better performance)

4. **Set Environment Variables**:
   - Click on "Environment" tab
   - Add the following variables:
     - `AGORA_APP_ID`: Your Agora App ID
     - `AGORA_APP_CERTIFICATE`: Your Agora App Certificate
     - `NODE_ENV`: `production`

5. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

### 3. Update Frontend Configuration

After deployment, update the frontend to use your Render URL:

```javascript
// In public/js/app.js, update the fetch URL:
const response = await fetch('https://your-app-name.onrender.com/generate-token', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        channelName: channelName,
        uid: CONFIG.uid
    })
});
```

### 4. Test Your Deployment

1. Visit your Render URL: `https://your-app-name.onrender.com`
2. Open browser console to check for any errors
3. Try joining a channel to test video functionality

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Ensure `server.js` is in the root directory

2. **Environment Variables**:
   - Verify Agora credentials are set correctly in Render dashboard
   - Check that variable names match exactly

3. **CORS Issues**:
   - The server already includes CORS middleware
   - If issues persist, check browser console for specific errors

4. **Video Not Working**:
   - Ensure Agora credentials are valid
   - Check browser console for SDK errors
   - Verify HTTPS is working (required for WebRTC)

### Render-Specific Features

- **Auto-deploy**: Render automatically redeploys when you push to GitHub
- **Custom domains**: You can add custom domains in the Render dashboard
- **Logs**: View deployment and runtime logs in the Render dashboard
- **Scaling**: Upgrade to paid plans for better performance

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `AGORA_APP_ID` | Your Agora App ID from console | Yes |
| `AGORA_APP_CERTIFICATE` | Your Agora App Certificate | Yes |
| `NODE_ENV` | Environment (production/development) | No |
| `PORT` | Port number (Render sets this automatically) | No |

## Support

If you encounter issues:
1. Check Render deployment logs
2. Verify Agora credentials are correct
3. Test locally first with `npm start`
4. Check browser console for frontend errors
