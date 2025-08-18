const path = require('path');

module.exports = async (req, res) => {
  // Serve the main HTML file
  res.sendFile(path.join(__dirname, '../public/index.html'));
};
