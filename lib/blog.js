import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import nodePath from 'node:path';
import slugify from 'slugify';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://wp.digiwebtech.co.in';
const WP_API_URL = `${WORDPRESS_URL}/wp-json/wp/v2`;

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '—');
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

  const title = decodeHtmlEntities(wpPost.title?.rendered || '');
  const contentHtml = wpPost.content?.rendered || '';
  const contentText = stripHtml(contentHtml);
  
  // Stripped excerpt
  let excerpt = decodeHtmlEntities(stripHtml(wpPost.excerpt?.rendered || ''));
  if (!excerpt) {
    excerpt = decodeHtmlEntities(contentText.slice(0, 180));
  }

  // Get embedded term details (wp:term is an array where [0] is categories, [1] is tags)
  const terms = wpPost._embedded?.['wp:term'] || [];
  const categories = (terms[0] || []).map((term) => ({
    name: decodeHtmlEntities(term.name),
    slug: term.slug,
  }));
  const tags = (terms[1] || []).map((term) => ({
    name: decodeHtmlEntities(term.name),
    slug: term.slug,
  }));

  // Get featured media details (wp:featuredmedia is an array)
  const featuredMedia = wpPost._embedded?.['wp:featuredmedia']?.[0];
  const coverImage = featuredMedia?.source_url || '';
  const coverImageAlt = decodeHtmlEntities(featuredMedia?.alt_text || title);
  // Intrinsic dimensions let the browser reserve space for the cover image.
  // Without them the featured image on a post -- usually the LCP element --
  // shifts everything below it once it loads.
  const coverImageWidth = featuredMedia?.media_details?.width || null;
  const coverImageHeight = featuredMedia?.media_details?.height || null;

  // Get author details (author is an array)
  const author = wpPost._embedded?.['author']?.[0];
  let authorName = decodeHtmlEntities(author?.name || 'Digi Web Tech Team');
  const lowerAuthorName = authorName.toLowerCase();
  if (lowerAuthorName === 'admin' || lowerAuthorName === 'seo-admin' || lowerAuthorName === 'seo admin') {
    authorName = 'Arjun Rawat';
  }

  // Retrieve SEO metadata, supporting standard Yoast SEO REST API outputs if available
  const metaTitle = decodeHtmlEntities(wpPost.yoast_head_json?.title || title);
  const metaDescription = decodeHtmlEntities(wpPost.yoast_head_json?.description || excerpt);

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
    coverImageWidth,
    coverImageHeight,
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

/**
 * Retry and circuit-breaker state, scoped to one process (one build, or one
 * running server). The upstream WordPress host drops its database
 * intermittently; without a breaker a single outage means every one of the
 * ~150 requests in a full build waits for its own timeout and prints its own
 * stack, which turns a short blip into a slow, unreadable build.
 */
const WP_MAX_ATTEMPTS = 4;
const WP_BACKOFF_MS = [800, 2000, 4000];
const WP_BREAKER_THRESHOLD = 6;
const WP_BREAKER_COOLDOWN_MS = 30000;

const wpBreaker = {
  consecutiveFailures: 0,
  openedAt: 0,
  suppressedLogs: 0,
};

function wpBreakerIsOpen() {
  if (wpBreaker.consecutiveFailures < WP_BREAKER_THRESHOLD) return false;
  if (Date.now() - wpBreaker.openedAt < WP_BREAKER_COOLDOWN_MS) return true;
  // Cooldown elapsed: allow one probe through to see if the host recovered.
  wpBreaker.consecutiveFailures = WP_BREAKER_THRESHOLD - 1;
  return false;
}

function wpNoteSuccess() {
  if (wpBreaker.suppressedLogs > 0) {
    console.warn(
      `[WordPress API] Recovered after ${wpBreaker.suppressedLogs} suppressed failure(s).`,
    );
  }
  wpBreaker.consecutiveFailures = 0;
  wpBreaker.suppressedLogs = 0;
}

function wpNoteFailure(url, message) {
  wpBreaker.consecutiveFailures += 1;

  if (wpBreaker.consecutiveFailures === WP_BREAKER_THRESHOLD) {
    wpBreaker.openedAt = Date.now();
    console.error(
      `[WordPress API Error] ${WP_BREAKER_THRESHOLD} consecutive failures - ` +
        `pausing requests for ${WP_BREAKER_COOLDOWN_MS / 1000}s. Last error: ${message}`,
    );
    return;
  }

  if (wpBreaker.consecutiveFailures > WP_BREAKER_THRESHOLD) {
    wpBreaker.suppressedLogs += 1;
    return;
  }

  console.error(`[WordPress API Error] Fetch failed for ${url}: ${message}`);
}

/**
 * Caller-level warning that goes quiet once the breaker has already reported
 * the outage. Without this a single dead upstream prints one line per call
 * site on top of the fetch-level errors.
 */
function logBlogWarning(context, error) {
  if (wpBreaker.consecutiveFailures >= WP_BREAKER_THRESHOLD) {
    wpBreaker.suppressedLogs += 1;
    return;
  }
  console.warn(`[Blog API Warning] ${context}: ${error.message}`);
}

const wpSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Concurrency limiter for WordPress requests.
 *
 * Measured against the live host: 16 simultaneous requests all succeed, 25
 * produce HTTP 500 "Error establishing a database connection" on roughly a
 * fifth of them. The upstream MySQL server runs out of connections somewhere
 * in between. Next.js renders static pages in parallel and will happily fire
 * far more than that during a build, which is what produced pages of errors
 * even while the site was perfectly healthy for a single visitor.
 *
 * Holding in-flight requests well under the observed ceiling turns a flaky
 * build into a slightly slower but reliable one. Override with
 * WP_MAX_CONCURRENCY if the host's limits change.
 */
/**
 * Last-known-good response cache.
 *
 * The upstream WordPress host intermittently returns "Error establishing a
 * database connection" under the sustained load of a build. Without a
 * fallback, a build unlucky enough to hit that window ships a homepage with
 * no blog strip and blog pages with no content, and stays that way until the
 * next deploy.
 *
 * Successful responses are written to disk; a request that has exhausted its
 * retries falls back to the stored copy. Content may be slightly stale, which
 * is strictly better than content that has vanished. The directory is
 * gitignored and safe to delete -- it repopulates on the next good build.
 */
const WP_CACHE_DIR = nodePath.join(process.cwd(), '.wp-cache');
let wpCacheServedFromDisk = 0;

function wpCachePath(key) {
  return nodePath.join(WP_CACHE_DIR, createHash('sha1').update(key).digest('hex') + '.json');
}

function wpCacheWrite(key, data) {
  try {
    if (!existsSync(WP_CACHE_DIR)) mkdirSync(WP_CACHE_DIR, { recursive: true });
    writeFileSync(wpCachePath(key), JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // A cache write failure must never break a request.
  }
}

function wpCacheRead(key) {
  try {
    const file = wpCachePath(key);
    if (!existsSync(file)) return null;
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

export function wpCacheStats() {
  return { servedFromDisk: wpCacheServedFromDisk };
}

/**
 * Next.js renders static pages across one worker process per CPU core, and
 * each worker loads its own copy of this module with its own counter. A flat
 * per-process limit therefore multiplies: on a 4-core machine a limit of 6
 * still allows 24 simultaneous requests, which is above the ceiling.
 *
 * Deriving the per-process value from the core count keeps the aggregate at
 * roughly WP_TARGET_TOTAL regardless of the machine doing the build.
 */
const WP_TARGET_TOTAL = 6;
const wpCpuCount = Math.max(1, cpus().length || 1);

const WP_MAX_CONCURRENCY =
  Number(process.env.WP_MAX_CONCURRENCY) ||
  Math.max(2, Math.floor(WP_TARGET_TOTAL / wpCpuCount));

let wpActive = 0;
const wpQueue = [];

function wpAcquire() {
  if (wpActive < WP_MAX_CONCURRENCY) {
    wpActive += 1;
    return Promise.resolve();
  }
  return new Promise((resolve) => wpQueue.push(resolve));
}

function wpRelease() {
  const next = wpQueue.shift();
  if (next) {
    next();
    return;
  }
  wpActive -= 1;
}

// Internal helper for fetching from WordPress API with cache control
async function wpFetch(path, options = {}) {
  const url = `${WP_API_URL}${path}`;

  if (wpBreakerIsOpen()) {
    wpBreaker.suppressedLogs += 1;
    throw new Error('WordPress API unavailable (circuit breaker open)');
  }

  await wpAcquire();

  try {
    const data = await wpAttempt(url, options);
    wpCacheWrite(path, data);
    return data;
  } catch (error) {
    const cached = wpCacheRead(path);
    if (cached) {
      wpCacheServedFromDisk += 1;
      const ageMins = Math.round((Date.now() - cached.savedAt) / 60000);
      if (wpCacheServedFromDisk === 1) {
        console.warn(
          `[WordPress API] Upstream unavailable - serving cached responses ` +
            `from .wp-cache (this one is ${ageMins} min old). Content may be stale.`,
        );
      }
      return cached.data;
    }
    throw error;
  } finally {
    wpRelease();
  }
}

async function wpAttempt(url, options) {
  let lastError;

  for (let attempt = 0; attempt < WP_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          ...(options.headers || {}),
        },
        next: { revalidate: 300, ...(options.next || {}) },
      });

      if (!res.ok) {
        const text = await res.text();
        const error = new Error(`WordPress API returned HTTP ${res.status}: ${text}`);
        // 4xx means the resource genuinely is not there; only server errors
        // and network faults are worth retrying.
        if (res.status < 500) throw Object.assign(error, { noRetry: true });
        throw error;
      }

      const json = await res.json();
      wpNoteSuccess();
      return json;
    } catch (error) {
      lastError = error;
      if (error.noRetry || attempt === WP_MAX_ATTEMPTS - 1) break;
      await wpSleep(WP_BACKOFF_MS[attempt] ?? 2000);
    } finally {
      clearTimeout(timeout);
    }
  }

  wpNoteFailure(url, lastError.message);
  throw lastError;
}

export function toSlug(value) {
  return slugifyValue(value);
}

export async function getPublishedPosts({ query = '', category, tag } = {}) {
  try {
    let endpoint = `/posts?status=publish&_embed=1&per_page=100`;

    if (query) {
      endpoint += `&search=${encodeURIComponent(query)}`;
    }

    if (category) {
      const categories = await wpFetch(`/categories?slug=${encodeURIComponent(category)}`);
      if (categories && categories.length > 0) {
        endpoint += `&categories=${categories[0].id}`;
      } else {
        return [];
      }
    }

    if (tag) {
      const tags = await wpFetch(`/tags?slug=${encodeURIComponent(tag)}`);
      if (tags && tags.length > 0) {
        endpoint += `&tags=${tags[0].id}`;
      } else {
        return [];
      }
    }

    const posts = await wpFetch(endpoint);
    return Array.isArray(posts) ? posts.map(serializePost) : [];
  } catch (err) {
    logBlogWarning('Remote WordPress API unavailable during build', err);
    return [];
  }
}

export async function getPublishedPostBySlug(slug) {
  try {
    const posts = await wpFetch(`/posts?slug=${encodeURIComponent(slug)}&_embed=1`);
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return null;
    }
    return serializePost(posts[0]);
  } catch (err) {
    logBlogWarning(`Remote WordPress API unavailable for slug "${slug}"`, err);
    return null;
  }
}

export async function getPostById(id) {
  try {
    const post = await wpFetch(`/posts/${id}?_embed=1`);
    return serializePost(post);
  } catch (err) {
    logBlogWarning(`Remote WordPress API unavailable for post ${id}`, err);
    return null;
  }
}

export async function getAdminPosts() {
  try {
    const posts = await wpFetch(`/posts?_embed=1&per_page=100`);
    return Array.isArray(posts) ? posts.map(serializePost) : [];
  } catch (err) {
    logBlogWarning('Remote WordPress API unavailable for admin posts', err);
    return [];
  }
}

export async function getPublishedSlugs() {
  try {
    const posts = await wpFetch(`/posts?status=publish&per_page=100&_fields=slug`);
    return Array.isArray(posts) ? posts.map((post) => post.slug) : [];
  } catch (err) {
    logBlogWarning('Remote WordPress API unavailable for slugs', err);
    return [];
  }
}

export async function getAllCategories() {
  try {
    const categories = await wpFetch(`/categories?per_page=100&hide_empty=true`);
    if (!Array.isArray(categories)) return [];
    return categories.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      count: cat.count,
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    logBlogWarning('Remote WordPress API unavailable for categories', err);
    return [];
  }
}

export async function getAllTags() {
  try {
    const tags = await wpFetch(`/tags?per_page=100&hide_empty=true`);
    if (!Array.isArray(tags)) return [];
    return tags.map((tag) => ({
      name: tag.name,
      slug: tag.slug,
      count: tag.count,
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    logBlogWarning('Remote WordPress API unavailable for tags', err);
    return [];
  }
}

// These are database-write methods originally used by the local CMS admin
// Since we are using WordPress as the unified admin backend, we disable them.
export async function savePost() {
  throw new Error('Post writing is disabled on Node.js. Use WordPress https://wp.digiwebtech.co.in/wp-admin to manage posts.');
}

export async function deletePost() {
  throw new Error('Post deletion is disabled on Node.js. Use WordPress https://wp.digiwebtech.co.in/wp-admin to manage posts.');
}
