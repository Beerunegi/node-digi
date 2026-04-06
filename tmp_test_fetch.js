const http = require('http');
http.get('http://localhost:3000/sitemap.xml', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('DATA:', data));
}).on('error', err => console.log('Error:', err.message));
