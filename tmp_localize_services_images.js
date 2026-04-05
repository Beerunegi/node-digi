const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'images', 'services');
const servicesFile = path.join(__dirname, 'views', 'services.ejs');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

let content = fs.readFileSync(servicesFile, 'utf8');
const regex = /https:\/\/(images\.unsplash\.com|cdn\.simpleicons\.org)[^"'\s)]*/g;
const matches = content.match(regex) || [];
const uniqueUrls = [...new Set(matches)];

console.log(`Found ${uniqueUrls.length} unique external images in services.ejs.`);

function download(url, dest) {
  return new Promise((resolve, reject) => {
    // If the file already exists (from home page download), we could skip or just overwrite
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, (response) => {
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

(async () => {
  let updatedContent = content;
  let counter = 1;

  for (const url of uniqueUrls) {
    try {
      let isUnsplash = url.includes('unsplash');
      let ext = isUnsplash ? '.jpg' : '.svg';
      
      let filename = '';
      if (isUnsplash) {
        const match = url.match(/photo-([a-zA-Z0-9-]+)/);
        filename = match ? match[0] + ext : `unsplash-services-${counter++}${ext}`;
      } else {
        const parts = url.split('/');
        let iconName = parts[parts.length - 1];
        if (iconName.match(/^[0-9A-Fa-f]{6}$/) || iconName === '') {
            iconName = parts[parts.length - 2];
        }
        filename = `icon-${iconName}${ext}`;
      }
      
      filename = filename.toLowerCase();
      // Instead of downloading everything to 'services', maybe reuse 'home' if it exists. 
      // But to be completely safe and modular, we'll download to 'services'
      let localPath = path.join(targetDir, filename);
      let localUrl = `/images/services/${filename}`;

      console.log(`Downloading: ${url} -> ${localPath}`);
      await download(url, localPath);
      
      updatedContent = updatedContent.split(url).join(localUrl);
      
      console.log(`Successfully replaced to ${localUrl}`);
    } catch (err) {
      console.error(`Error processing ${url}:`, err.message);
    }
  }

  fs.writeFileSync(servicesFile + '.bak', content);
  fs.writeFileSync(servicesFile, updatedContent);
  console.log('Finished downloading images and updating services.ejs');
})();
