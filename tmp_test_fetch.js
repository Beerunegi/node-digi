const urls = [
  'https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&w=1920&q=80'
];

async function check() {
  for (const url of urls) {
    const res = await fetch(url);
    console.log(res.status, url);
  }
}
check();
