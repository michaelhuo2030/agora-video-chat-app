# Supabase Deployment Guide for Agora Video Chat App

This guide will help you deploy the Agora Video Chat App using Supabase as the backend service.

## 🚀 Quick Start

### Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase CLI**: Install globally
   ```bash
   npm install -g supabase
   ```
3. **Agora Account**: Get your App ID and App Certificate from [agora.io](https://agora.io)

### Step 1: Set Up Supabase Project

1. **Create a new Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: `agora-video-chat`
   - Set a database password
   - Choose a region close to your users

2. **Get your project credentials**:
   - Go to Settings → API
   - Copy your Project URL and anon public key

### Step 2: Configure Environment Variables

Set your Agora credentials as environment variables:

```bash
export AGORA_APP_ID="your_agora_app_id"
export AGORA_APP_CERTIFICATE="your_agora_app_certificate"
```

### Step 3: Deploy to Supabase

1. **Login to Supabase CLI**:
   ```bash
   supabase login
   ```

2. **Link to your remote project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Run the deployment script**:
   ```bash
   ./supabase/deploy.sh
   ```

### Step 4: Update Frontend Configuration

Update `public/js/supabaseClient.js` with your Supabase credentials:

```javascript
const SUPABASE_URL = 'https://your-project-ref.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'
```

### Step 5: Deploy Frontend

Deploy your frontend to a hosting service like Vercel, Netlify, or GitHub Pages.

## 📁 Project Structure

```
supabase/
├── config.toml              # Supabase configuration
├── deploy.sh                # Deployment script
├── functions/
│   ├── generate-token/      # Agora token generation
│   └── chat-sessions/       # Chat session management
└── migrations/
    └── 20240101000000_create_chat_sessions.sql
```

## 🔧 Configuration Details

### Database Schema

The app uses two main tables:

1. **chat_sessions**: Stores active video chat sessions
2. **participants**: Tracks users in each session

### Edge Functions

1. **generate-token**: Generates Agora tokens for video chat
2. **chat-sessions**: Manages chat session lifecycle

### Environment Variables

Required environment variables in Supabase:

- `AGORA_APP_ID`: Your Agora App ID
- `AGORA_APP_CERTIFICATE`: Your Agora App Certificate

## 🚀 Deployment Options

### Option 1: Full Supabase Deployment

Deploy everything to Supabase:

```bash
# Deploy Edge Functions
supabase functions deploy generate-token
supabase functions deploy chat-sessions

# Set secrets
supabase secrets set AGORA_APP_ID="your_app_id"
supabase secrets set AGORA_APP_CERTIFICATE="your_certificate"
```

### Option 2: Hybrid Deployment

Keep the Express server for some endpoints and use Supabase for others:

1. Deploy Express server to Vercel/Render
2. Use Supabase for database and real-time features
3. Update API endpoints to use Supabase Edge Functions

### Option 3: Static Frontend + Supabase Backend

1. Deploy frontend as static files
2. Use Supabase for all backend functionality
3. Configure CORS in Supabase

## 🔒 Security Considerations

1. **Row Level Security (RLS)**: Enabled on all tables
2. **CORS**: Configured for your domain
3. **API Keys**: Use service role key only in Edge Functions
4. **Environment Variables**: Stored securely in Supabase

## 📊 Monitoring and Analytics

### Supabase Dashboard

- Monitor database performance
- View real-time logs
- Track API usage

### Agora Console

- Monitor video call quality
- Track concurrent users
- View usage statistics

## 🛠️ Development Workflow

### Local Development

1. **Start local Supabase**:
   ```bash
   supabase start
   ```

2. **Apply migrations**:
   ```bash
   supabase db reset
   ```

3. **Deploy functions locally**:
   ```bash
   supabase functions serve
   ```

### Testing

1. **Test Edge Functions**:
   ```bash
   curl -X POST http://localhost:54321/functions/v1/generate-token \
     -H "Content-Type: application/json" \
     -d '{"channelName": "test", "uid": 123}'
   ```

2. **Test Database**:
   ```bash
   supabase db diff
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Supabase
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install -g supabase
      - run: supabase login --access-token ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
      - run: supabase functions deploy generate-token
      - run: supabase functions deploy chat-sessions
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check CORS configuration in Supabase
   - Verify domain is allowed

2. **Function Deployment Fails**:
   - Check function syntax
   - Verify environment variables

3. **Database Connection Issues**:
   - Check project linking
   - Verify database is running

### Debug Commands

```bash
# Check Supabase status
supabase status

# View logs
supabase logs

# Reset database
supabase db reset

# Check function logs
supabase functions logs generate-token
```

## 📈 Scaling Considerations

1. **Database**: Supabase handles scaling automatically
2. **Edge Functions**: Deploy globally for low latency
3. **Video**: Agora handles video scaling
4. **Storage**: Use Supabase Storage for file uploads

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Agora Documentation](https://docs.agora.io)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Database Guide](https://supabase.com/docs/guides/database)

## 📞 Support

For issues with:
- **Supabase**: Check [Supabase Discord](https://discord.supabase.com)
- **Agora**: Contact [Agora Support](https://agora.io/support)
- **This App**: Open an issue in the GitHub repository
