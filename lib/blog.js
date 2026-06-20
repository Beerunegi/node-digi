import slugify from 'slugify';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://wp.digiwebtech.co.in';
const WP_API_URL = `${WORDPRESS_URL}/wp-json/wp/v2`;

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function slugifyValue(value) {
  return slugify(String(value || '').trim(), { lower: true, strict: true });
}

function estimateReadingTime(contentText) {
  const words = contentText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Map a WordPress post object to the serialized structure expected by Next.js views
function serializePost(wpPost) {
  if (!wpPost) return null;

  const title = wpPost.title?.rendered || '';
  const contentHtml = wpPost.content?.rendered || '';
  const contentText = stripHtml(contentHtml);
  
  // Stripped excerpt
  let excerpt = stripHtml(wpPost.excerpt?.rendered || '');
  if (!excerpt) {
    excerpt = contentText.slice(0, 180);
  }

  // Get embedded term details (wp:term is an array where [0] is categories, [1] is tags)
  const terms = wpPost._embedded?.['wp:term'] || [];
  const categories = (terms[0] || []).map((term) => ({
    name: term.name,
    slug: term.slug,
  }));
  const tags = (terms[1] || []).map((term) => ({
    name: term.name,
    slug: term.slug,
  }));

  // Get featured media details (wp:featuredmedia is an array)
  const featuredMedia = wpPost._embedded?.['wp:featuredmedia']?.[0];
  const coverImage = featuredMedia?.source_url || '';
  const coverImageAlt = featuredMedia?.alt_text || title;

  // Get author details (author is an array)
  const author = wpPost._embedded?.['author']?.[0];
  const authorName = author?.name || 'Digi Web Tech Team';

  // Retrieve SEO metadata, supporting standard Yoast SEO REST API outputs if available
  const metaTitle = wpPost.yoast_head_json?.title || title;
  const metaDescription = wpPost.yoast_head_json?.description || excerpt;

  const publishedAt = wpPost.date_gmt ? new Date(wpPost.date_gmt + 'Z').toISOString() : new Date(wpPost.date).toISOString();
  const createdAt = publishedAt;
  const updatedAt = wpPost.modified_gmt ? new Date(wpPost.modified_gmt + 'Z').toISOString() : new Date(wpPost.modified).toISOString();

  return {
    id: String(wpPost.id),
    title,
    slug: wpPost.slug,
    excerpt,
    contentHtml,
    status: wpPost.status === 'publish' ? 'published' : wpPost.status,
    coverImage,
    coverImageAlt,
    categories,
    tags,
    metaTitle,
    metaDescription,
    authorName,
    publishedAt,
    createdAt,
    updatedAt,
    readingTimeMinutes: estimateReadingTime(contentText),
  };
}

// Internal helper for fetching from WordPress API with cache control
async function wpFetch(path, options = {}) {
  const url = `${WP_API_URL}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
      next: { revalidate: 300, ...(options.next || {}) },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`WordPress API returned HTTP ${res.status}: ${text}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`[WordPress API Error] Fetch failed for ${url}:`, error.message);
    throw error;
  }
}

export function toSlug(value) {
  return slugifyValue(value);
}

export async function getPublishedPosts({ query = '', category, tag } = {}) {
  let endpoint = `/posts?status=publish&_embed=1&per_page=100`;

  if (query) {
    endpoint += `&search=${encodeURIComponent(query)}`;
  }

  // Handle category slug filtering by looking up the category ID
  if (category) {
    const categories = await wpFetch(`/categories?slug=${encodeURIComponent(category)}`);
    if (categories && categories.length > 0) {
      endpoint += `&categories=${categories[0].id}`;
    } else {
      return []; // Category slug doesn't exist
    }
  }

  // Handle tag slug filtering by looking up the tag ID
  if (tag) {
    const tags = await wpFetch(`/tags?slug=${encodeURIComponent(tag)}`);
    if (tags && tags.length > 0) {
      endpoint += `&tags=${tags[0].id}`;
    } else {
      return []; // Tag slug doesn't exist
    }
  }

  const posts = await wpFetch(endpoint);
  return posts.map(serializePost);
}

export async function getPublishedPostBySlug(slug) {
  const posts = await wpFetch(`/posts?slug=${encodeURIComponent(slug)}&_embed=1`);
  if (!posts || posts.length === 0) {
    return null;
  }
  return serializePost(posts[0]);
}

export async function getPostById(id) {
  const post = await wpFetch(`/posts/${id}?_embed=1`);
  return serializePost(post);
}

export async function getAdminPosts() {
  // Return all posts from WordPress (can include drafts if we don't filter)
  const posts = await wpFetch(`/posts?_embed=1&per_page=100`);
  return posts.map(serializePost);
}

export async function getPublishedSlugs() {
  const posts = await wpFetch(`/posts?status=publish&per_page=100&_fields=slug`);
  return posts.map((post) => post.slug);
}

export async function getAllCategories() {
  const categories = await wpFetch(`/categories?per_page=100&hide_empty=true`);
  return categories.map((cat) => ({
    name: cat.name,
    slug: cat.slug,
    count: cat.count,
  })).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAllTags() {
  const tags = await wpFetch(`/tags?per_page=100&hide_empty=true`);
  return tags.map((tag) => ({
    name: tag.name,
    slug: tag.slug,
    count: tag.count,
  })).sort((a, b) => a.name.localeCompare(b.name));
}

// These are database-write methods originally used by the local CMS admin
// Since we are using WordPress as the unified admin backend, we disable them.
export async function savePost() {
  throw new Error('Post writing is disabled on Node.js. Use WordPress https://wp.digiwebtech.co.in/wp-admin to manage posts.');
}

export async function deletePost() {
  throw new Error('Post deletion is disabled on Node.js. Use WordPress https://wp.digiwebtech.co.in/wp-admin to manage posts.');
}
