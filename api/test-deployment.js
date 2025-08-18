module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Vercel Deployment Test</title>
    </head>
    <body>
        <h1>✅ Vercel Deployment is Working!</h1>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>URL: ${req.url}</p>
        <p>Method: ${req.method}</p>
        <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
        <p>Agora App ID: ${process.env.AGORA_APP_ID ? 'Set' : 'Not Set'}</p>
        <p>Agora Certificate: ${process.env.AGORA_APP_CERTIFICATE ? 'Set' : 'Not Set'}</p>
        
        <h2>Test API Endpoints:</h2>
        <ul>
            <li><a href="/api/hello">/api/hello</a></li>
            <li><a href="/api/generate-token">/api/generate-token (POST only)</a></li>
        </ul>
        
        <h2>Test Token Generation:</h2>
        <button onclick="testToken()">Test Token Generation</button>
        <div id="result"></div>
        
        <script>
        async function testToken() {
            try {
                const response = await fetch('/api/generate-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        channelName: 'test-channel',
                        uid: 12345
                    })
                });
                
                const data = await response.json();
                document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                document.getElementById('result').innerHTML = '<p style="color: red;">Error: ' + error.message + '</p>';
            }
        }
        </script>
    </body>
    </html>
  `);
};
