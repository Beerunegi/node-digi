const urls = [
  'https://digiwebtech.co.in/wp-blog/',
  'https://digiwebtech.co.in/wp-blog/wp-login.php',
  'https://digiwebtech.co.in/wp-blog/wp-json/wp/v2/posts'
];

async function test() {
  for (const url of urls) {
    try {
      console.log('\n----------------------------');
      console.log('Fetching:', url);
      const res = await fetch(url);
      console.log('Status:', res.status);
      const headers = Object.fromEntries(res.headers.entries());
      console.log('Server/Platform:', headers['server'], '/', headers['platform']);
      console.log('Content-Type:', headers['content-type']);
      const text = await res.text();
      console.log('Snippet:', text.slice(0, 300));
    } catch (e) {
      console.error('Error fetching', url, ':', e.message);
    }
  }
}

test();
