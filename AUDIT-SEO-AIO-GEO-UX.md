# Digi Web Tech — SEO / AIO / GEO / UI-UX Audit

**Site:** https://digiwebtech.co.in
**Stack:** Next.js 15 (App Router) rendering legacy EJS page bodies + headless WordPress blog
**Audit date:** 16 August 2026
**Method:** All 48 routes crawled and parsed from rendered HTML (titles, meta, canonicals, heading trees, image attributes, link graph, JSON-LD, form semantics), plus live DOM inspection, CSS/JS review, and source review of `views/`, `app/`, `lib/`, `components/`, `public/`.

**Pages crawled:** 42 marketing/system routes + 6 blog routes. All returned `200` except `/nonexistent-page-test` (correct `404`).

---

## Scorecard

| Area | Score | Headline |
|---|---|---|
| Technical SEO | 5 / 10 | Clean canonical + sitemap plumbing, undermined by staging pages in the index and one corrupted page |
| On-page SEO | 4 / 10 | 14 pages share one meta description; duplicate service page; keyword-free H1s |
| Structured data | 4 / 10 | Good `LocalBusiness` + FAQ base; no `Service`, no `Offer`, no `sameAs`, duplicate breadcrumbs |
| AIO (AI Optimization) | 5 / 10 | Strong `llms.txt`, but weak entity graph and no answer-first blocks outside the blog |
| GEO (Generative Engine Opt.) | 3 / 10 | The GEO service page contradicts the brand's own definition of GEO |
| Core Web Vitals | 3 / 10 | Above-the-fold content is `opacity: 0` until JS runs; 250 KB render-blocking CSS |
| Accessibility | 4 / 10 | No skip link, placeholder-only labels, dead links, heading skips |
| UX / Conversion | 4 / 10 | Fake phone number on 11 pages; lead form invisible until JS loads |

---

## P0 — Critical

### C1. All hero content renders invisible until JavaScript executes

`public/css/style.css:725` sets `.reveal { opacity: 0 }`, and visibility depends entirely on `main.js` adding `.show` via `IntersectionObserver`. Live DOM check on `/`:

```
revealTotal: 40   revealShownClass: 0   revealOpacity0: 40
```

`.reveal` is applied to the H1 (`views/home.ejs:20`), the hero paragraph, the hero CTA group, and — most damagingly — the entire lead-capture card on `/free-website-audit` (`views/free-website-audit.ejs:73`).

Consequences:
- **LCP is deferred.** Text at `opacity: 0` is not a paint candidate, so the LCP element cannot resolve until `main.js` (loaded `afterInteractive`, i.e. after hydration) runs. On a slow 4G connection this pushes LCP well past the 2.5 s threshold.
- **A JS failure blanks the page.** Script blocked, CDN error, parse error, or a browser extension breaking `IntersectionObserver` leaves the user on a page with a header, a footer, and nothing in between.
- **Background tabs render empty.** `IntersectionObserver` does not fire while `document.visibilityState === "hidden"`. Verified in-browser: with the tab hidden, zero of 40 elements ever received `.show`, even after a programmatic scroll. Middle-click "open in new tab" produces a blank body until focus.
- `@media (prefers-reduced-motion: reduce)` (`style.css:1882`) only zeroes `transition-duration` — it does not make `.reveal` visible, so reduced-motion users are equally dependent on JS.

### C2. `/services/geo-optimization-services` renders corrupted HTML

`views/geo-optimization-services.ejs` contains 40 literal backslash-escaped quote sequences (`class=\"`, `href=\"`, `alt=\"`), starting at line 415 and running to the end of the file. The rendered page contains **920** occurrences of `=\"`.

Everything from the case-study strip through pricing and the FAQ block renders with broken attributes: CSS classes never match, two `<img>` tags lose their `alt`, and internal `href`s are malformed. This is the only view in the codebase with this corruption.

### C3. Wrong phone number in the CTA on 11 service pages

```
tel:+919876543210    ← placeholder
+91 98712 64699      ← the real number (lib/site-config.js:8)
```

Present in the "Call Our Team" button on: `content-marketing-services`, `conversion-rate-optimization-services`, `email-marketing-automation-services`, `geo-optimization-services`, `google-ads-services`, `meta-ads-management-services`, `seo-services-sample` (and therefore `seo-services`), `shopify-development-services`, `website-design-services`, `website-development-services`, `wordpress-development-services`.

Direct lost calls, and an inconsistent NAP signal that damages local pack ranking.

### C4. The GEO service page contradicts the brand's own definition of GEO

Every other surface defines GEO as **Generative Engine Optimization**:

- `lib/site-routes.js:62` — *"Generative Engine Optimization (GEO) Services … Get cited, recommended, and linked inside conversational search results on ChatGPT Search, Gemini, and Perplexity."*
- `public/llms.txt` — *"Generative Engine Optimization positioning content for citations … inside ChatGPT Search, Perplexity, and Gemini."*
- `/free-website-audit` — *"Generative Engine Optimization (GEO): Check brand citations, source database placement, and entity association across AI systems."*

The page itself is about **geographic / local SEO**:

- H1: *"Rank where it matters. Target your growth."*
- H2s: *"Enterprise-grade local intelligence."*, *"Dominating markets, location by location."*
- FAQ: *"While standard SEO focuses on broad keyword rankings, GEO optimization targets specific geographic areas. It involves Google Business Profile management, local citation building, and location-specific landing pages…"*

Searchers and AI engines arriving on the promise of generative-engine visibility get local SEO. This is a relevance mismatch that suppresses rankings for both intents and gives LLMs contradictory facts about what the company sells.

---

## P1 — High

### H1. Fourteen pages share one identical meta description

`lib/site-routes.js` falls back to `siteConfig.defaultDescription` for:

`/about-wireframe`, `/home-sample`, `/services/seo-services`, `/services/google-ads-services`, `/services/meta-ads-management-services`, `/services/website-development-services`, `/services/website-design-services`, `/services/shopify-development-services`, `/services/wordpress-development-services`, `/services/content-marketing-services`, `/services/email-marketing-automation-services`, `/services/conversion-rate-optimization-services`, `/services/analytics-reporting-services`, `/services/brand-strategy-services`

All 192 characters — over the ~160-character SERP limit, so they truncate *and* they are identical, so Google rewrites them.

### H2. `/services/seo-services` and `/services/seo-services-sample` are the same page

`views/seo-services.ejs` is a one-line include of `seo-services-sample`. Both routes are indexable, both are in `sitemap.xml`, both carry the same H1 (*"Rank higher. Reach further. Grow faster."*) and near-identical body copy (1257 vs 1260 words). Classic self-cannibalisation on the site's most commercially valuable term.

### H3. Staging pages are indexable and in the sitemap

| Page | In sitemap | Indexable | Inbound links |
|---|---|---|---|
| `/about-wireframe` | yes | yes | 0 (orphan) |
| `/services/seo-services-sample` | yes | yes | 0 (orphan) |
| `/home-sample` | no | **yes** | 0 (orphan) |
| `/thank-you` | yes | yes | 0 (orphan) |

`app/robots.js` disallows `/home-sample`, but a `Disallow` rule does not deindex — it only stops crawling. A page linked from anywhere else can still be indexed with a "no information available" snippet. `noindex` is the correct control, and it requires the page to be crawlable.

`/thank-you` is a post-conversion page: indexing it lets users land there directly and pollutes goal-completion analytics.

### H4. The Open Graph image is an SVG

`app/layout.jsx:29` and every page's metadata declare:

```js
images: [{ url: '/images/logo.svg', width: 1200, height: 630, ... }]
```

Facebook, LinkedIn, X, WhatsApp, Slack and iMessage all reject SVG for `og:image`. Every share of every page renders a blank or fallback card. The declared `1200×630` is also false — it's a logo mark, not a social card. (`public/images/services/aio-og.png` exists but is never referenced.)

### H5. Two different business addresses in structured data

`views/about.ejs` declared its own `LocalBusiness` node reusing the **same `@id`** as the homepage's (`https://digiwebtech.co.in/#localbusiness`) but with a different address:

| Source | Address |
|---|---|
| `lib/site-config.js` + homepage schema | 3rd Floor, A-303, Sector 5, Rajendra Nagar, **Ghaziabad**, 201005 |
| `/about` inline schema | Sec-62, **Noida**, 201301 |

One entity, one identifier, two locations, and two unrelated review sets. NAP consistency is the foundation of local pack ranking, and a self-contradicting entity is exactly what stops an AI system from resolving a business with confidence.

### H6. Structured data gaps

| Missing | Where | Impact |
|---|---|---|
| `Service` schema | all 15 service pages | No service entity for Google or LLMs to attach offerings to |
| `Offer` / `AggregateOffer` | `/pricing`, all service pricing tables | Published ₹ prices invisible to structured search |
| `FAQPage` | `seo-services`, `seo-services-sample`, `geo-optimization-services`, `website-development-services`, `website-design-services`, `pricing` | Visible FAQ accordions with no markup |
| Any schema | all 6 `/industries/*` pages | Zero machine-readable context |
| `WebSite` + `SearchAction` | site-wide | No sitelinks search box eligibility |
| `sameAs` | `Organization` node | **No entity disambiguation — the single most important AIO/GEO signal** |
| `Person` (author) | blog posts | Weak E-E-A-T; author is a bare `<h4>` |
| `Organization` on inner pages | site-wide | Only emitted on `/` (`components/SiteShell.jsx:163`) |

Duplicate: every blog post emits **two** `BreadcrumbList` graphs — one from `app/blog/[slug]/page.jsx:309`, one from `SiteShell`'s `customBreadcrumbs`.

Correct today: the `LocalBusiness` `review`/`aggregateRating` block does correspond to testimonials visible at `views/home.ejs:509-570`, so it is policy-compliant.

### H7. ~180 hotlinked third-party images

Roughly 11–12 `images.unsplash.com` URLs per service page, plus `/about`, `/industries/*`, `/case-studies`, `/pricing`, `/contact`. `/home-sample` also hotlinks `cdn.simpleicons.org`.

Every one is an uncontrolled third-party dependency: extra DNS + TLS handshake, no cache policy of your own, no WebP/AVIF negotiation, and the images vanish if Unsplash changes or rate-limits the URL. `/` and `/services` were already localised to `public/images/` — the rest were not.

### H8. Images have no intrinsic dimensions

| Page | Images | Missing `width`/`height` |
|---|---|---|
| `/` | 27 | 27 |
| `/case-studies` | 13 | 13 |
| `/blog` | 20 | 20 |
| blog posts | 5 | 5 |
| `/about` | 6 | 6 |
| `/industries` | 9 | 8 |

Guaranteed layout shift on every one. CLS is the cheapest Core Web Vital to fix and this is the whole fix.

### H9. 250 KB of render-blocking CSS + a webfont that never renders

`app/layout.jsx:53-60` puts four blocking resources in `<head>`:

- `style.css` — **202 KB**, unminified, with duplicate conflicting rules (`.btn` is fully redefined at line 4769, overriding line 387)
- `next-blog.css` — 47 KB, loaded on marketing pages that never use it (every selector in it is `blog-*`, `admin-*`, or `author-*`)
- Google Fonts stylesheet — three families across 15 weights

**Manrope is downloaded on every page and renders on zero elements.** It is declared once, on `body` (`style.css:62`), and then overridden by a second `body { font-family: "Poppins" }` at line 3420. Confirmed by walking the live DOM and reading computed styles:

```
Poppins: 286 elements    Sora: 32 elements    Manrope: 0 elements
```

Four font files fetched on every page load for nothing.

---

## P2 — Medium

### Crawl & indexation

- **`/blog?page=2` canonicalises to `/blog`.** Paginated pages should self-canonicalise, otherwise posts on page 2+ lose their discovery path.
- **60+ thin tag pages.** `/blog/tag/*` pages average ~210 words with a single post (`/blog/tag/aio`, `/blog/tag/blog-seo`, …), all indexable and all in the sitemap. Index bloat that dilutes crawl budget. There's also a typo'd tag: `social-media-metricssocial-media-metrics`.
- **`sitemap.xml` stamps `lastModified: new Date()` on every static page** (`app/sitemap.js:11`) — a timestamp that changes on every build tells Google nothing.
- **`<meta name="keywords">`** (`app/layout.jsx:49`) — ignored by every search engine since 2009 and a weak quality signal.
- **`robots.txt` doesn't reference `/llms.txt`** and doesn't explicitly address AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`) — an explicit allow is the standard GEO signal.
- **404 page canonicalises to the homepage** — it inherits `alternates.canonical: '/'` from the root layout. It correctly returns `410`-adjacent `noindex`, but the canonical should be dropped.

### Links

- **Breadcrumb "Industries" is `href="#"`** on all 6 industry pages (e.g. `views/industry-health.ejs:18`) — a visibly broken breadcrumb.
- **Four dead footer social links** (`components/SiteShell.jsx:388-391`) on every page. They also mean the `sameAs` entity graph can never be populated.
- **`target="_blank"` without `rel="noopener"`** on the client site link in all four case studies (e.g. `views/case-study-dental-port.ejs:27`).

### Accessibility

- **No skip link** on any page (0/48).
- **Placeholder-only form fields.** `/contact` (5 inputs) and the home audit form (4 inputs) have no `<label>`, no `aria-label`. WCAG 2.2 3.3.2 failure — the label disappears the moment the user types. `/free-website-audit` does it correctly and should be the pattern.
- **Heading skips on every page:** footer `<h4>` follows the last `<h2>`. Additional `h1 → h3` skips on `/contact`, `/free-website-audit`, `/blog`, and `h1 → h4` on blog posts ("Key Takeaways") and `/thank-you`.
- **33 of 79 interactive elements** on `/` are under the 24×24 px minimum target size (WCAG 2.2 2.5.8).
- **Decorative-vs-meaningful image confusion:** `views/industry-health.ejs:3` wraps a hero `<img>` carrying descriptive alt text inside `aria-hidden="true"`, so the alt is discarded.

### Typography & UX

- **Body copy is too small.** `p { font-size: clamp(0.85rem, 1.7vw, 0.935rem) }` — maxes at ~15 px on desktop and bottoms out at **13.6 px** on mobile, below the 16 px readability baseline.
- **`.eyebrow` is ~10.6 px** uppercase with `0.08em` letter-spacing (`style.css:425`) — used as a section label on nearly every section.
- **`.marquee-track` exceeds viewport width** on `/` — the only element wider than the viewport; a horizontal-overflow risk on small screens (currently contained by `overflow-x: hidden` on `html`/`body`, which is a mask, not a fix).
- **Title tags over 60 characters on 18 pages**, longest 81 (`/services/geo-optimization-services`). They truncate in SERPs.
- **Keyword-free H1s** on the two highest-value pages: `/` is *"Grow Beyond Google."* and `/services/seo-services` is *"Rank higher. Reach further. Grow faster."* — neither contains a target term.

### Delivery & hygiene

- Static assets serve with `Cache-Control: public, max-age=0`, forcing revalidation of the 202 KB CSS and 3.9 MB of images on every visit. The CSS is already cache-busted with `?v=1.0.2`, so it can safely be `immutable`.
- No security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, HSTS). `Referrer-Policy` in particular affects analytics attribution quality.
- `public/19851-306108542_medium.mp4` — 1.7 MB, unreferenced.
- `views/home.ejs.bak`, `views/services.ejs.bak`, `views/layout.ejs` (dead — Next never renders it), and five `tmp_*.js` scripts in the repo root.
- `public/images/services/AI Optimization Services.webp` — a space in the filename, served as `%20`.
- Alt text is keyword-stuffed: *"…in Delhi NCR"* is appended to dozens of image descriptions regardless of whether the image depicts anything in Delhi NCR.

---

## AIO — AI Optimization

What AI Overviews and answer engines need is unambiguous entity identity, extractable facts, and machine-readable structure.

**Working:** `llms.txt` is genuinely good — well-organised, describes every page, and beats what most agencies publish. FAQ accordions use semantic `<details>/<summary>`. Blog posts carry `BlogPosting` + `FAQPage` and lead with a "Key Takeaways" block.

**Gaps:**

1. **The entity is undefined.** The `Organization` node has no `sameAs`, no `foundingDate`, no `numberOfEmployees`, no `knowsAbout`, no `areaServed`, no `founder`. Without `sameAs` pointing at LinkedIn / Google Business Profile / Clutch, no AI system can confidently resolve "Digi Web Tech" to a real company, and confidence is what determines whether you get cited.
2. **`Organization` is homepage-only.** Every page should reference the org node by `@id` so the entity is reinforced site-wide.
3. **No answer-first blocks on marketing pages.** Service pages open with brand voice (*"Rank higher. Reach further. Grow faster."*). LLMs extract declarative definitions — *"AIO optimization is …"*, *"SEO pricing in Delhi NCR starts at ₹X/month and includes …"*. The blog does this; the money pages don't.
4. **No `speakable` markup** for voice and assistant surfaces.
5. **No author entity.** "Arjun Rawat" appears as an `<h4>` with no `Person` schema, no bio, no credentials, no `sameAs` — E-E-A-T invisible to machines.
6. **Facts are not consistently repeated.** Pricing, service names and claims differ between the pages, `llms.txt`, and the schema. Consistency across surfaces is what raises model confidence.

## GEO — Generative Engine Optimization

1. **C4 is the whole story.** The page that is supposed to establish the brand as a GEO provider teaches ChatGPT and Perplexity that Digi Web Tech's "GEO" means Google Business Profile management. It contradicts `llms.txt`, the homepage, and the audit page.
2. **No explicit AI-crawler policy.** `robots.txt` has one generic `User-Agent: *` group. Naming `GPTBot`, `ClaudeBot`, `PerplexityBot`, `CCBot`, `Google-Extended` and `Applebot-Extended` with explicit `Allow` is now table stakes.
3. **No citation-shaped content.** Generative engines lift stat blocks, comparison tables, and definition sentences. The site has almost no tables (0 across the marketing pages) and the statistics that exist (`4.2x ROAS`, `95% retention`) are rendered by a JS counter that starts at `0` in the HTML — an AI crawler that doesn't execute JS reads *"0"*, not *"4.2"*.
4. **`llms.txt` isn't discoverable** — not referenced from `robots.txt` or any `<link>`.

That third point is worth restating: `views/home.ejs:138` ships `<span data-counter="95">0</span>%`. Every headline metric on the site is literally the number **zero** in the raw HTML.

---

---

# Remediation

Everything above was fixed in this pass except where noted under "Not done". Verified against a production build (`next build` + `next start`, 189 pages generated) by re-crawling all 44 routes.

## Measured before / after

| Metric | Before | After |
|---|---:|---:|
| Pages sharing a duplicate meta description | 14 | **0** |
| Title tags over 60 characters | 18 | **0** |
| Pages with no structured data | 12 | **0** |
| Invalid JSON-LD blocks | 0 | **0** |
| Images with no intrinsic dimensions | 188 | **0** |
| Dead `href="#"` links | 166 | **0** |
| `target="_blank"` without `rel="noopener"` | 4 | **0** |
| Pages with no skip link | 40 | **0** |
| Heading-level skips | 27 | **0** |
| Pages with an unusable SVG `og:image` | 39 | **0** |
| Hero elements painted without waiting for JS | 0 / 40 | **6 / 6 above-the-fold** |

## What changed

**P0**
- **C1** — `.reveal` no longer hides anything unless a synchronous `<head>` script adds `js-reveal` to `<html>`, so a blocked or broken `main.js` can never blank the page. That script also paints every above-the-fold `.reveal` at `DOMContentLoaded` with the transition disabled (`reveal-instant`), so the H1 is an LCP candidate immediately. `main.js` sets `window.__revealReady`; if it never loads, a 2.5 s failsafe drops `js-reveal` entirely. A `visibilitychange` handler re-runs the pass when a background tab is focused. `prefers-reduced-motion` now forces visibility rather than only zeroing the transition. **Verified in a hidden tab** — the exact condition that previously left all 40 elements invisible — the H1 now reports `opacity: 1`, `transition-duration: 0s`.
- **C2** — `views/geo-optimization-services.ejs` rewritten from scratch; the 920 escaped-quote artifacts are gone (0 outside `<script>` in rendered HTML).
- **C3** — `tel:+919876543210` → `tel:+919871264699` across all 11 service pages.
- **C4** — the GEO page is now genuinely about Generative Engine Optimization: new H1, an answer-first *"What is Generative Engine Optimization?"* definition block with an SEO/AIO/GEO comparison table, six rewritten service cards (citation audit, answer-first content, entity/knowledge graph, structured data for LLMs, source corroboration, AI visibility reporting), a rewritten 4-step framework, six new FAQs, and repositioned pricing tiers. `llms.txt` gained a **Terminology** section stating explicitly that GEO on this site never means geographic SEO.

**P1**
- Unique, length-checked title and description for all 39 indexable pages; `buildPageMetadata()` in `lib/page-metadata.js` is now the single source, replacing 36 hand-rolled metadata blocks.
- `/services/seo-services-sample` deleted; its content moved to `/services/seo-services` and the old URL 301s.
- `/home-sample`, `/about-wireframe`, `/thank-you` and all `/blog/tag/*` pages are `noindex, follow` and excluded from the sitemap; `?q=` blog searches are `noindex` too.
- Generated a real 1200×630 `og-default.png` and pointed every page at it.
- **Entity graph rebuilt.** `Organization` + `ProfessionalService` + `WebSite`/`SearchAction` now render on *every* page with a stable `@id`, wired to `siteConfig` so address, phone and email cannot drift. Added `knowsAbout`, `areaServed`, `geo`, `foundingDate`, `openingHoursSpecification`, and `sameAs` (auto-populated from `siteConfig.social`). `Service` schema on all 15 service pages, `WebPage` on industries, `OfferCatalog` with the three retainer prices on `/pricing`, `Person` author with `worksFor` on blog posts.
- **H5 fixed** — the conflicting Noida `LocalBusiness` block was removed from `/about`. There is now one business entity with one address. Reviews moved to `lib/reviews.js` and are attached only on pages where the matching testimonials are visible.
- FAQ schema is now *derived from the rendered HTML* (`faqSchemaFromHtml`), so the markup can never contradict the on-page accordion. This replaced 11 hand-maintained blocks and added coverage to the 6 pages that had FAQs but no markup.
- Duplicate `BreadcrumbList` on blog posts removed.
- Intrinsic `width`/`height` added to 81 images in the views plus every WordPress cover image — `lib/blog.js` now reads real dimensions from `media_details` rather than guessing.
- Manrope dropped; `next-blog.css` moved to the `/blog` and `/admin` layouts only.

**P2**
- `robots.txt` is now a route handler: advertises `/llms.txt`, and names 12 AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, …) with explicit `Allow`.
- Sitemap emits indexable URLs only, with real per-section priorities and no fake `lastModified`.
- **Every headline statistic now ships its real value in the HTML.** 80 counters across 20 views said `<span data-counter="95">0</span>` — an AI crawler that does not execute JS read *"0"* for every metric on the site. They now render the true number and JS animates from zero.
- Skip link, `visually-hidden` labels on all placeholder-only fields, footer/section headings promoted so no page skips a level, `rel="noopener"` on external links, industry breadcrumbs pointing at `/industries` instead of `#`.
- Footer social icons are config-driven and render nothing when a URL is absent.
- Body copy floor raised from 13.6px to 16px; `.eyebrow` from 10.6px to 13px.
- Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, HSTS) and immutable caching for `/css`, `/js`, `/images`.
- Removed the obsolete `<meta name="keywords">`; dropped the homepage canonical from the 404 page.

## Not done — needs your input or a separate pass

1. **Social profile URLs.** `siteConfig.social` is wired but empty. Filling in LinkedIn / Instagram / Facebook / X / Google Business Profile / Clutch turns the footer icons back on *and* populates `sameAs`, which is the single highest-value remaining AIO/GEO signal.
2. **~170 hotlinked Unsplash images** (H7) still load from `images.unsplash.com`. A `preconnect` was added, but localising them into `public/images/` — as was already done for `/` and `/services` — is a bulk media task worth its own pass.
3. **The mobile hero source is 600×400** (`views/home.ejs:6`), served full-bleed on phones at DPR 2–3. It needs a higher-resolution asset; upscaling will not help.
4. **`style.css` is still 202 KB and unminified**, with confirmed duplicate rule blocks (`.btn` defined twice, `.reveal` and footer rules extended). Minifying and dead-rule pruning is a meaningful further LCP win.
5. **Repo clutter** left untouched deliberately: `app.js`, `index.js`, `all_images.txt`, `tmp_*.js`, `test_sitemap.js`, and `public/19851-306108542_medium.mp4` (1.7 MB, unreferenced). These are legacy-Express leftovers — harmless to serving, but tell me if you want them removed.
6. **Keyword-stuffed alt text** (*"… in Delhi NCR"* appended to dozens of images regardless of content) is unchanged; rewriting it is a copy pass, not a code change.
7. **H1 keyword targeting.** `/` is still *"Grow Beyond Google."* and `/services/seo-services` *"Rank higher. Reach further. Grow faster."* Both are brand-voice choices — worth revisiting, but I did not overwrite deliberate copy decisions.
