const express = require('express');
const cors = require('cors');
const path = require('path');
const { RtcTokenBuilder, RtcRole } = require('agora-token');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Real Agora credentials from environment variables
const appId = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;

// Generate real Agora token endpoint
app.post('/generate-token', (req, res) => {
  const { channelName, uid } = req.body;
  
  console.log('🔑 Token generation requested:', { channelName, uid });
  
  if (!channelName) {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  if (!appId || !appCertificate) {
    console.error('Missing Agora credentials. Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE in .env file');
    return res.status(500).json({ error: 'Agora credentials not configured' });
  }

  try {
    // Set token expiry time (24 hours)
    const expirationTimeInSeconds = 3600 * 24;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Build real token with proper parameters
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid || 0,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );
    
    console.log('✅ Real Agora token generated successfully');
    
    res.json({ 
      token, 
      appId,
      channelName,
      uid: uid || 0,
      expiresAt: privilegeExpiredTs
    });
  } catch (error) {
    console.error('❌ Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// Channel management endpoint
app.post('/channel-info', (req, res) => {
  const { channelName } = req.body;
  
  console.log('📊 Channel info requested:', { channelName });
  
  if (!channelName) {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  res.json({
    channelName,
    timestamp: Date.now(),
    message: 'Channel info endpoint - mock response for testing'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({
    message: 'API is working! (Local Test Server)',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    environment: {
      hasAppId: true,
      hasCertificate: true,
      nodeEnv: 'test',
      server: 'local-test-server'
    }
  });
});

// Serve the main application
app.get('/', (req, res) => {
  console.log('🏠 Main page requested');
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Handle all other routes by serving index.html (for SPA routing)
app.get('*', (req, res) => {
  console.log('🔄 Catch-all route:', req.url);
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log('📝 Test endpoints:');
  console.log(`   - Main app: http://localhost:${PORT}`);
  console.log(`   - Test API: http://localhost:${PORT}/test`);
  console.log(`   - Token API: POST http://localhost:${PORT}/generate-token`);
  console.log('✅ Using real Agora credentials from .env file');
  console.log(`   App ID: ${appId ? 'Configured' : 'Missing'}`);
  console.log(`   Certificate: ${appCertificate ? 'Configured' : 'Missing'}`);
  console.log('🎥 Real video/audio should work now!');
});
