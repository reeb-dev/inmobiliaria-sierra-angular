import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../dist/sierra-app/browser',
);
const port = Number(process.env.PORT || 4200);
// 0.0.0.0: el forward de Cursor llega por la interfaz del contenedor.
// En tu máquina igual abrís http://localhost:43123
const host = process.env.HOST || '0.0.0.0';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
};

function send(res, status, body, type) {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';
    let filePath = path.normalize(path.join(root, pathname));
    if (!filePath.startsWith(root)) return send(res, 403, 'Forbidden', 'text/plain');

    const exists = fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    if (!exists) {
      // SPA fallback only for navigations, not for missing assets with extensions
      if (path.extname(pathname)) {
        return send(res, 404, 'Not found', 'text/plain');
      }
      filePath = path.join(root, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    send(res, 200, fs.readFileSync(filePath), type);
  } catch (err) {
    send(res, 500, String(err), 'text/plain');
  }
});

server.listen(port, host, () => {
  console.log(`STATIC_OK http://localhost:${port}`);
});
