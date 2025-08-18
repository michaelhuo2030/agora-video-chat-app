const { RtcTokenBuilder, RtcRole } = require('agora-token');

module.exports = async (req, res) => {
  console.log('generate-token API called:', req.method, req.url);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { channelName, uid } = req.body;
  
  console.log('Request body:', { channelName, uid });
  
  if (!channelName) {
    console.log('Channel name missing');
    return res.status(400).json({ error: 'Channel name is required' });
  }

  // Get Agora credentials from environment variables
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  console.log('Environment check:', { 
    hasAppId: !!appId, 
    hasCertificate: !!appCertificate,
    appIdLength: appId ? appId.length : 0,
    certLength: appCertificate ? appCertificate.length : 0
  });

  if (!appId || !appCertificate) {
    console.error('Missing Agora credentials. Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE environment variables');
    return res.status(500).json({ error: 'Agora credentials not configured' });
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
    res.status(500).json({ error: 'Failed to generate token' });
  }
};
