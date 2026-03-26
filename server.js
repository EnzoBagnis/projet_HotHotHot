const https = require('https');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'application/javascript'
};

// Charge les certificats mkcert
const options = {
    key:  fs.readFileSync(path.join(__dirname, 'localhost+1-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'localhost+1.pem'))
};

https.createServer(options, (req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
}).listen(8080, () => {
    console.log('✅ Serveur HTTPS : https://localhost:8080');
});