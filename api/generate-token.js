const { RtcTokenBuilder, RtcRole } = require('agora-token');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { channelName, uid } = req.body;
  
  if (!channelName) {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  // Get Agora credentials with fallback
  const appId = process.env.AGORA_APP_ID || 'f891cd47d6d24cf2b4c484abe0f38020';
  const appCertificate = process.env.AGORA_APP_CERTIFICATE || '8f70d2306b7449f7ad98187b665bb075';

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
};
