const https = require('https');
const fs = require('fs');
const path = require('path');

const dest = path.join(__dirname, 'public', 'images', 'services', 'photo-meta-ads.jpg');

const url = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80';

// Follow redirects logic for https
function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          resolve(download(response.headers.location, dest));
          return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

download(url, dest)
  .then(() => console.log('Downloaded new Meta Ads image'))
  .catch(console.error);

// Also download a better SEO image: A nice graph/analytics dashboard
const seoDest = path.join(__dirname, 'public', 'images', 'services', 'photo-seo-dash.jpg');
const seoUrl = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';

download(seoUrl, seoDest)
  .then(() => console.log('Downloaded new SEO image'))
  .catch(console.error);
