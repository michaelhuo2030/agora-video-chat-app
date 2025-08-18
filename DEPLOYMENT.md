# Vercel Deployment Guide

This guide will help you deploy the Agora Video Chat Game to Vercel.

## Prerequisites

1. **Agora Account**: You need an Agora account with a project set up
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Account**: Your code should be in a GitHub repository

## Step 1: Set up Agora Project

1. Go to [Agora Console](https://console.agora.io)
2. Create a new project or use an existing one
3. Note down your **App ID** and **App Certificate**
4. Enable the following services for your project:
   - Real-Time Communication (RTC)
   - Real-Time Messaging (RTM)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Import your repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Node.js project

2. **Configure environment variables**:
   - In the project settings, go to "Environment Variables"
   - Add the following variables:
     - `AGORA_APP_ID`: Your Agora App ID
     - `AGORA_APP_CERTIFICATE`: Your Agora App Certificate

3. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your application

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set environment variables**:
   ```bash
   vercel env add AGORA_APP_ID
   vercel env add AGORA_APP_CERTIFICATE
   ```

## Step 3: Configure Domain (Optional)

1. In your Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain if desired
3. Configure DNS settings as instructed

## Step 4: Test Your Deployment

1. Visit your deployed URL (e.g., `https://your-project.vercel.app`)
2. Enter a channel name and username
3. Click "Join Channel"
4. Test video/audio functionality
5. Test the multiplayer game

## Troubleshooting

### Common Issues

1. **"Failed to get token" - 404 Error**:
   - This is the most common issue. See the [Troubleshooting Guide](TROUBLESHOOTING.md) for detailed steps
   - First, test the API by visiting `https://your-project.vercel.app/test`
   - Ensure environment variables are set correctly in Vercel
   - Check that the variable names match exactly: `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE`

2. **"Missing Agora credentials" error**:
   - Ensure environment variables are set correctly in Vercel
   - Check that the variable names match exactly: `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE`
   - Redeploy after setting environment variables

3. **Video/audio not working**:
   - Ensure your browser supports WebRTC
   - Check that you've granted camera/microphone permissions
   - Verify your Agora project has RTC enabled

4. **Game synchronization issues**:
   - Ensure RTM is enabled in your Agora project
   - Check browser console for RTM connection errors

5. **CORS errors**:
   - The application is configured to handle CORS automatically
   - If you're still getting CORS errors, check your browser's developer tools

### Environment Variables

Make sure these are set in your Vercel project:

```bash
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_app_certificate_here
```

### Local Development

To test locally before deploying:

1. Copy `env.example` to `.env`
2. Fill in your Agora credentials
3. Run `npm install`
4. Run `npm start`
5. Visit `http://localhost:3000`

## Security Considerations

1. **Never commit your Agora credentials** to version control
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** in production (Vercel does this automatically)
4. **Consider implementing user authentication** for production use

## Performance Optimization

1. **Enable Vercel's Edge Network** for faster global access
2. **Use Vercel's Analytics** to monitor performance
3. **Consider implementing caching** for static assets

## Support

If you encounter issues:

1. Check the [Vercel documentation](https://vercel.com/docs)
2. Check the [Agora documentation](https://docs.agora.io)
3. Review the browser console for error messages
4. Check the Vercel function logs in your dashboard
