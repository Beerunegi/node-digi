const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = path.join(__dirname, 'public', 'images', 'home');
const homeFile = path.join(__dirname, 'views', 'home.ejs');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

let content = fs.readFileSync(homeFile, 'utf8');
const regex = /https:\/\/(images\.unsplash\.com|cdn\.simpleicons\.org)[^"'\s)]*/g;
const matches = content.match(regex) || [];
const uniqueUrls = [...new Set(matches)];

console.log(`Found ${uniqueUrls.length} unique external images in home.ejs.`);

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          // Handle redirect
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
      
      // Determine file name
      let filename = '';
      if (isUnsplash) {
        // extract photo ID
        const match = url.match(/photo-([a-zA-Z0-9-]+)/);
        filename = match ? match[0] + ext : `unsplash-${counter++}${ext}`;
      } else {
        // SimpleIcon name
        const parts = url.split('/');
        let iconName = parts[parts.length - 1];
        // some might have colors like /google/4285F4
        if (iconName.match(/^[0-9A-Fa-f]{6}$/) || iconName === '') {
            iconName = parts[parts.length - 2];
        }
        filename = `icon-${iconName}${ext}`;
      }
      
      // Deduplicate filenames if needed
      filename = filename.toLowerCase();
      let localPath = path.join(targetDir, filename);
      let localUrl = `/images/home/${filename}`;

      console.log(`Downloading: ${url} -> ${localPath}`);
      await download(url, localPath);
      
      // Replace all occurrences in content (need escape for regex if url has ?)
      // Simple split and join is safer string replacement for URLs
      updatedContent = updatedContent.split(url).join(localUrl);
      
      console.log(`Successfully replaced to ${localUrl}`);
    } catch (err) {
      console.error(`Error processing ${url}:`, err.message);
    }
  }

  // Backup original just in case
  fs.writeFileSync(homeFile + '.bak', content);
  
  // Write the updated ejs
  fs.writeFileSync(homeFile, updatedContent);
  console.log('Finished downloading images and updating home.ejs');
})();
