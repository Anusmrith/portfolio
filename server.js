const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT_PRIMARY = process.env.PORT ? parseInt(process.env.PORT, 10) : 5500;
const PORT_SECONDARY = 3000;
const PUBLIC_DIR = fs.existsSync('C:\\Users\\anusm\\OneDrive\\Documents\\portfolio')
  ? 'C:\\Users\\anusm\\OneDrive\\Documents\\portfolio'
  : __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

function requestHandler(req, res) {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, reqPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Prevent caching or service-worker collisions from other local projects
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

// Create primary server on port 5500
const serverPrimary = http.createServer(requestHandler);
serverPrimary.listen(PORT_PRIMARY, '0.0.0.0', () => {
  console.log(`Portfolio server running at: http://localhost:${PORT_PRIMARY} and http://127.0.0.1:${PORT_PRIMARY}`);
  console.log(`Serving files from: ${PUBLIC_DIR}`);
});

// Also create secondary server on port 3000 if available
const serverSecondary = http.createServer(requestHandler);
serverSecondary.on('error', (err) => {
  console.log(`Note: Port ${PORT_SECONDARY} was busy, primary port is ${PORT_PRIMARY}`);
});
serverSecondary.listen(PORT_SECONDARY, '0.0.0.0', () => {
  console.log(`Also listening on fallback port: http://localhost:${PORT_SECONDARY}`);
});
