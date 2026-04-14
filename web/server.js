import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentTypes = { 
    '.html': 'text/html', 
    '.js': 'application/javascript', 
    '.css': 'text/css', 
    '.png': 'image/png', 
    '.jpg': 'image/jpeg',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml'
  };
  
  fs.readFile(filePath, (err, data) => {
    if (err) { 
      res.writeHead(404); 
      res.end('Not Found'); 
      return; 
    }
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(8080, () => {
  console.log('Server running on http://localhost:8080');
});