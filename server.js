const http = require('http'); // Changé de https à http
const fs = require('fs');
const path = require('path');

const mimeTypes = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'application/javascript'
    // ... gardez le reste de vos mimeTypes
};

// Utilisez http.createServer au lieu de https.createServer
http.createServer((req, res) => {
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
}).listen(8080, () => { // Port 8080 pour éviter les conflits
    console.log('✅ Serveur HTTP : http://localhost:8080');
});