const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    
    // Handle API routes
    if (pathname.startsWith('/api/')) {
      const apiPath = pathname.replace('/api/', '');
      
      if (apiPath === 'generate-token') {
        return require('./generate-token.js')(req, res);
      }
      if (apiPath === 'test') {
        return require('./test.js')(req, res);
      }
      if (apiPath === 'channel-info') {
        return require('./channel-info.js')(req, res);
      }
      
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Handle static files
    const publicPath = path.join(__dirname, '../public');
    let filePath = path.join(publicPath, pathname);
    
    // Default to index.html for root path
    if (pathname === '/') {
      filePath = path.join(publicPath, 'index.html');
    }
    
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
      
      res.setHeader('Content-Type', contentType);
      const fileContent = fs.readFileSync(filePath);
      res.end(fileContent);
    } else {
      // Fallback to index.html for SPA routing
      const indexPath = path.join(publicPath, 'index.html');
      const fileContent = fs.readFileSync(indexPath);
      res.setHeader('Content-Type', 'text/html');
      res.end(fileContent);
    }
  } catch (error) {
    console.error('Error in index.js:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
