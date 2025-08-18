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
};
