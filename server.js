const express = require('express');
const cors = require('cors');
const { RtcTokenBuilder, RtcRole } = require('agora-token');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Agora configuration
const appId = process.env.AGORA_APP_ID;
const appCertificate = process.env.AGORA_APP_CERTIFICATE;

if (!appId || !appCertificate) {
  console.error('Missing Agora credentials. Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE environment variables');
  console.error('App will start but token generation will fail');
  // Don't exit - let the server start but show warning
}

// Generate token endpoint
app.post('/generate-token', (req, res) => {
  const { channelName, uid } = req.body;
  
  if (!channelName) {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  // Check if Agora credentials are available
  if (!appId || !appCertificate) {
    return res.status(500).json({ 
      error: 'Agora credentials not configured',
      message: 'Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE environment variables'
    });
  }

  try {
    // Set token expiry time (24 hours)
    const expirationTimeInSeconds = 3600 * 24;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Build token with proper parameters
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid || 0,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    res.json({ 
      token, 
      appId,
      channelName,
      uid: uid || 0,
      expiresAt: privilegeExpiredTs
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token', details: error.message });
  }
});

// Channel management endpoint
app.post('/channel-info', (req, res) => {
  const { channelName } = req.body;
  
  if (!channelName) {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  // This would typically query Agora's REST API for channel information
  // For now, return basic info
  res.json({
    channelName,
    timestamp: Date.now(),
    message: 'Channel info endpoint - implement with Agora REST API for detailed info'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    hasAppId: !!process.env.AGORA_APP_ID,
    hasCertificate: !!process.env.AGORA_APP_CERTIFICATE
  });
});

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure to set up your .env file with Agora credentials');
});
