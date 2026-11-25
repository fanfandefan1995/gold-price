// 简易本地HTTP服务器 - 让手机通过WiFi访问金价工具
// 使用: node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3456;
const DIR = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DIR, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// Get LAN IP addresses
function getLANIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║       金价监控工具已启动             ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log('  本机访问: http://localhost:' + PORT);
  const ips = getLANIPs();
  if (ips.length) {
    console.log('  手机访问: http://' + ips[0] + ':' + PORT);
    if (ips.length > 1) {
      for (let i = 1; i < ips.length; i++) {
        console.log('           或: http://' + ips[i] + ':' + PORT);
      }
    }
  }
  console.log('');
  console.log('  提示: 确保手机和电脑连同一WiFi');
  console.log('  按 Ctrl+C 停止服务');
  console.log('');
});
