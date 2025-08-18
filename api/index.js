const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
  try {
    console.log('🔍 Request URL:', req.url);
    console.log('🔍 Request method:', req.method);
    
    // Handle API routes
    if (req.url === '/test') {
      console.log('🧪 Handling test endpoint');
      return require('./test.js')(req, res);
    }
    if (req.url === '/generate-token') {
      console.log('🔑 Handling token generation');
      return require('./generate-token.js')(req, res);
    }
    if (req.url === '/channel-info') {
      console.log('📊 Handling channel info');
      return require('./channel-info.js')(req, res);
    }
    
    // Handle static files
    const publicPath = path.join(__dirname, '../public');
    let filePath = path.join(publicPath, req.url);
    
    // Default to index.html for root path
    if (req.url === '/') {
      filePath = path.join(publicPath, 'index.html');
    }
    
    console.log('📁 Looking for file:', filePath);
    
    // Check if file exists
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const contentType = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
      }[ext] || 'application/octet-stream';
      
      console.log('📄 Serving file:', filePath, 'with content type:', contentType);
      res.setHeader('Content-Type', contentType);
      res.sendFile(filePath);
    } else {
      console.log('🔄 Fallback to index.html for SPA routing');
      // Fallback to index.html for SPA routing
      res.sendFile(path.join(publicPath, 'index.html'));
    }
  } catch (error) {
    console.error('❌ Error in index.js:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
