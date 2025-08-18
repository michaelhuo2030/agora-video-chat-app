# Troubleshooting Guide

## Issue: "Failed to get token" - 404 Error

If you're getting a 404 error when trying to access `/generate-token`, follow these steps:

### Step 1: Test the API Endpoint

Visit your deployed URL and add `/test` to the end:
```
https://your-project.vercel.app/test
```

You should see a JSON response like:
```json
{
  "message": "API is working!",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "method": "GET",
  "url": "/test",
  "environment": {
    "hasAppId": true,
    "hasCertificate": true,
    "nodeEnv": "production"
  }
}
```

### Step 2: Check Environment Variables

If the test endpoint shows `hasAppId: false` or `hasCertificate: false`, you need to set your environment variables:

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add these variables:
   - `AGORA_APP_ID`: Your Agora App ID
   - `AGORA_APP_CERTIFICATE`: Your Agora App Certificate

### Step 3: Redeploy After Setting Environment Variables

After setting environment variables, you need to redeploy:

1. In Vercel dashboard, go to "Deployments"
2. Click "Redeploy" on your latest deployment
3. Or push a new commit to trigger a new deployment

### Step 4: Check Vercel Function Logs

1. In Vercel dashboard, go to "Functions"
2. Click on the function that's failing
3. Check the logs for any errors

### Step 5: Verify API Routes

The correct API structure should be:
- `/` → serves the main HTML file
- `/test` → test endpoint
- `/generate-token` → generates Agora tokens
- `/channel-info` → channel information
- `/public/*` → serves static files

### Common Issues and Solutions

#### Issue: Environment variables not set
**Solution**: Set `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` in Vercel dashboard

#### Issue: Wrong API route structure
**Solution**: Make sure you're using the latest `vercel.json` configuration

#### Issue: CORS errors
**Solution**: The API endpoints include CORS headers, but check browser console for details

#### Issue: Agora credentials invalid
**Solution**: Verify your Agora App ID and Certificate are correct

### Testing Locally

To test locally before deploying:

1. Copy `env.example` to `.env`
2. Fill in your Agora credentials
3. Run `npm install`
4. Run `npm start`
5. Visit `http://localhost:3000/test` to test the API
6. Visit `http://localhost:3000` to test the full application

### Debugging Steps

1. **Check browser console** for detailed error messages
2. **Check Vercel function logs** for server-side errors
3. **Test individual endpoints** using the `/test` route
4. **Verify environment variables** are set correctly
5. **Check network tab** in browser dev tools for request/response details

### Getting Help

If you're still having issues:

1. Check the [Vercel documentation](https://vercel.com/docs)
2. Check the [Agora documentation](https://docs.agora.io)
3. Review the function logs in your Vercel dashboard
4. Test with the `/test` endpoint to isolate the issue
