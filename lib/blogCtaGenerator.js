/**
 * Enhanced Conversion-Focused CTA Generator for Blog Posts.
 * Detects blog topic accurately (SEO, Web Design & Development, AI/GEO, PPC, Content Marketing)
 * and generates topic-specific, highly persuasive CTA cards with custom themes and conversion triggers.
 */

function detectTopic(fullText, primaryCategory = '') {
  const text = fullText.toLowerCase();

  const scores = {
    web_design_dev: 0,
    seo: 0,
    ai_geo: 0,
    ppc: 0,
    content_marketing: 0,
  };

  // Web Design & Development keywords
  const devKeywords = [
    'design', 'ui/ux', 'website', 'web dev', 'development', 'wordpress', 
    'shopify', 'woocommerce', 'redesign', 'frontend', 'responsive', 
    'core web vitals', 'page speed', 'ui', 'ux', 'css', 'html', 
    'landing page', 'theme', 'prototype', 'wireframe', 'web design'
  ];
  devKeywords.forEach((kw) => {
    if (text.includes(kw)) scores.web_design_dev += (kw.length > 5 ? 2 : 1);
  });

  // SEO keywords
  const seoKeywords = [
    'seo', 'search engine', 'ranking', 'google search', 'backlink', 
    'keyword', 'organic', 'on-page', 'off-page', 'technical seo', 
    'local seo', 'serp', 'crawler', 'indexing', 'search intent'
  ];
  seoKeywords.forEach((kw) => {
    if (text.includes(kw)) scores.seo += (kw.length > 5 ? 2 : 1);
  });

  // AI & GEO keywords
  const aiKeywords = [
    'aio', 'geo', 'generative engine', 'chatgpt', 'gemini', 'perplexity', 
    'ai search', 'ai marketing', 'artificial intelligence', 'llm', 'ai overview'
  ];
  aiKeywords.forEach((kw) => {
    if (text.includes(kw)) scores.ai_geo += (kw.length > 4 ? 2 : 1);
  });

  // PPC keywords
  const ppcKeywords = [
    'google ads', 'meta ads', 'facebook ads', 'instagram ads', 'ppc', 
    'paid search', 'paid ads', 'roas', 'ad spend', 'cpc', 'ctr', 'ad campaign'
  ];
  ppcKeywords.forEach((kw) => {
    if (text.includes(kw)) scores.ppc += (kw.length > 4 ? 2 : 1);
  });

  // Content Marketing keywords
  const contentKeywords = [
    'content marketing', 'copywriting', 'blogging', 'content strategy', 
    'content creation', 'copywriter', 'lead magnet', 'content plan'
  ];
  contentKeywords.forEach((kw) => {
    if (text.includes(kw)) scores.content_marketing += (kw.length > 6 ? 2 : 1);
  });

  let maxScore = 0;
  let topTopic = 'general';

  for (const [topic, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      topTopic = topic;
    }
  }

  return topTopic;
}

function getCtaConfigs(topic, primaryCategory = 'Digital Growth', title = '') {
  const categoryLabel = primaryCategory || 'Digital Growth';

  switch (topic) {
    case 'web_design_dev':
      return {
        themeClass: 'cta-theme-web',
        cta1: {
          badge: '🎨 High-Converting Web Design & Development',
          headline: 'Is Your Website Design Turning Visitors into Customers?',
          description: `Outdated layouts, slow page speeds, and poor mobile UX cost you qualified leads every single day. Digi Web Tech crafts custom Next.js, WordPress, and Shopify websites engineered for speed, beauty, and high conversion rates.`,
          highlights: [
            'Sub-Second Load Speeds & Core Web Vitals Optimization',
            'Bespoke UI/UX Design & Conversion-Centric Layouts',
            '100% Mobile Responsive, Accessible & SEO Ready',
          ],
          buttonText: 'Request Free Website Audit &rarr;',
          buttonHref: '/services/website-development-services',
          subtext: '⚡ Instant UX & Speed Teardown • 100% Free',
        },
        cta2: {
          badge: '🛠️ Custom Web Development & Redesign',
          headline: 'Ready to Build a Fast, Modern & High-Converting Website?',
          subheadline: `From custom website redesigns to enterprise e-commerce platforms, our web engineering team builds digital experiences that command attention and drive revenue.`,
          primaryText: 'Start Your Web Project',
          primaryHref: '/contact',
          secondaryText: 'Explore Web Design Services',
          secondaryHref: '/services/website-design-services',
          assuranceTag: '✓ Custom Architecture • SEO Optimized • Mobile First • 2-Hour Response',
        },
      };

    case 'seo':
      return {
        themeClass: 'cta-theme-seo',
        cta1: {
          badge: '🚀 Organic Search & Keyword Domination',
          headline: 'Want Higher Google Rankings & Consistent Organic Leads?',
          description: `Struggling to beat competitors in search results? Digi Web Tech's data-backed technical SEO, intent-based keyword targeting, and authority link-building drive sustained organic revenue growth.`,
          highlights: [
            'Comprehensive On-Page & Technical Architecture Audit',
            'High-Intent Buyer Keyword Strategy & Mapping',
            'Local & Global Search Dominance for Your Niche',
          ],
          buttonText: 'Claim Your Free SEO Audit &rarr;',
          buttonHref: '/services/seo-services',
          subtext: '📊 Free Technical Diagnostic • No Commitment Required',
        },
        cta2: {
          badge: '📊 Custom Organic Growth Roadmap',
          headline: 'Ready to Rank #1 on Google & Outperform Competitors?',
          subheadline: `Get a comprehensive technical SEO audit and custom growth strategy tailored specifically to your business and target audience.`,
          primaryText: 'Claim Free SEO Audit',
          primaryHref: '/contact',
          secondaryText: 'Talk to an Expert (+91 88512 50846)',
          secondaryHref: 'tel:+918851250846',
          assuranceTag: '✓ 100% Free Audit • Actionable Technical Insights • Zero Obligation',
        },
      };

    case 'ai_geo':
      return {
        themeClass: 'cta-theme-ai',
        cta1: {
          badge: '🤖 AI Engine Optimization (GEO & AIO)',
          headline: 'Position Your Brand as the #1 Recommended AI Answer',
          description: `Search is shifting from traditional blue links to AI summaries. Ensure your business is cited, trusted, and recommended first inside ChatGPT Search, Perplexity, and Google Gemini.`,
          highlights: [
            'AI Citation, Entity Graph & Schema Structuring',
            'Direct Answer Optimization for Generative Engines',
            'Comprehensive AI Search Visibility Diagnostics',
          ],
          buttonText: 'Explore GEO & AIO Services &rarr;',
          buttonHref: '/services/aio-optimization-services',
          subtext: '🔮 Future-Proof Your Brand\'s Digital Footprint',
        },
        cta2: {
          badge: '🔮 AI Search Dominance',
          headline: 'Is Your Business Prepared for the AI Search Era?',
          subheadline: `Partner with Digi Web Tech to capture early market share in generative AI answer engines and establish your brand's authoritative digital footprint.`,
          primaryText: 'Book AI Strategy Session',
          primaryHref: '/contact',
          secondaryText: 'Explore GEO Services',
          secondaryHref: '/services/geo-optimization-services',
          assuranceTag: '✓ First-Mover Advantage • Data-Backed AI Search Optimization',
        },
      };

    case 'ppc':
      return {
        themeClass: 'cta-theme-ppc',
        cta1: {
          badge: '⚡ High-ROAS Performance Advertising',
          headline: 'Stop Wasting Ad Spend on Clicks That Don\'t Convert',
          description: `Tired of high customer acquisition costs? Our Google Ads & Meta Ads specialists build hyper-targeted paid advertising campaigns engineered for maximum return on ad spend (ROAS).`,
          highlights: [
            'High-Intent Audience & Negative Keyword Filtering',
            'High-Converting Ad Creative & Copy Testing',
            'Conversion Rate & Dedicated Landing Page Optimization',
          ],
          buttonText: 'Get Free Ad Account Audit &rarr;',
          buttonHref: '/services/google-ads-services',
          subtext: '🎯 Uncover Immediate Wasted Spend Quick-Wins',
        },
        cta2: {
          badge: '📈 Paid Media Campaign Scaling',
          headline: 'Ready to Scale Your Paid Campaign ROI & Lower CAC?',
          subheadline: `Let our performance marketers perform a complete audit of your Google Ads or Meta Ads account to reveal wasted spend and unlock instant revenue growth.`,
          primaryText: 'Claim Free Ad Audit',
          primaryHref: '/contact',
          secondaryText: 'Call Ad Specialist (+91 88512 50846)',
          secondaryHref: 'tel:+918851250846',
          assuranceTag: '✓ In-Depth Account Audit • Fast 2-Hour Feedback • Zero Obligation',
        },
      };

    case 'content_marketing':
      return {
        themeClass: 'cta-theme-content',
        cta1: {
          badge: '✍️ High-Impact Content Engine',
          headline: 'Turn Your Content Into a Continuous Lead Generation Engine',
          description: `High-impact content does more than inform—it builds industry authority, ranks for high-intent search queries, and turns passive readers into paying clients.`,
          highlights: [
            'Search Intent & High-Value Keyword Mapping',
            'High-Authority Article Copywriting & Thought Leadership',
            'Conversion Funnel & Strategic Lead Magnet Integration',
          ],
          buttonText: 'Explore Content Services &rarr;',
          buttonHref: '/services/content-marketing-services',
          subtext: '📚 Build Brand Authority & Drive Inbound Leads',
        },
        cta2: {
          badge: '📚 Content Growth Strategy',
          headline: 'Need Content That Consistently Ranks & Converts Readers?',
          subheadline: `Get a personalized content strategy roadmap that targets your ideal customer profile and converts high-intent search traffic into revenue.`,
          primaryText: 'Request Free Content Plan',
          primaryHref: '/contact',
          secondaryText: 'Talk to a Strategist',
          secondaryHref: 'tel:+918851250846',
          assuranceTag: '✓ Custom Keyword Roadmap • Conversion Copywriting • 100% Free',
        },
      };

    default:
      return {
        themeClass: 'cta-theme-seo',
        cta1: {
          badge: '🚀 Digital Growth Engine',
          headline: `Accelerate Your Business Growth in ${categoryLabel}`,
          description: `Struggling to scale your organic search traffic and lead conversions? Digi Web Tech delivers specialized digital marketing and web solutions engineered for scale.`,
          highlights: [
            'Multi-Channel Performance Growth Strategy',
            'Search Engine & Generative AI Visibility',
            'Continuous Conversion Rate Optimization',
          ],
          buttonText: 'Get Free Growth Consultation &rarr;',
          buttonHref: '/contact',
          subtext: '⚡ Instant Consultation • Tailored Strategy',
        },
        cta2: {
          badge: '📊 Business Scaling Consultation',
          headline: 'Ready to Transform Your Digital Growth Strategy?',
          subheadline: `Schedule a free 30-minute strategy call with our specialists to review your digital footprint and outline actionable growth steps.`,
          primaryText: 'Claim Free Strategy Call',
          primaryHref: '/contact',
          secondaryText: 'Call Us (+91 88512 50846)',
          secondaryHref: 'tel:+918851250846',
          assuranceTag: '✓ 30-Min Discovery Session • Tailored Growth Roadmap • Zero Obligation',
        },
      };
  }
}

export function generateDynamicCtaHtml(post = {}) {
  const title = post.title || '';
  const excerpt = post.excerpt || '';
  const categories = post.categories || [];
  const tags = post.tags || [];
  
  const primaryCategory = categories[0]?.name || '';
  const catNames = categories.map((c) => c.name).join(' ');
  const catSlugs = categories.map((c) => c.slug).join(' ');
  const tagNames = tags.map((t) => t.name).join(' ');

  const fullText = `${title} ${excerpt} ${catNames} ${catSlugs} ${tagNames}`;
  const topic = detectTopic(fullText, primaryCategory);
  const { cta1, cta2, themeClass } = getCtaConfigs(topic, primaryCategory, title);

  const cta1Html = `
    <div class="dynamic-cta-card dynamic-cta-mid ${themeClass}" role="region" aria-label="Inline Growth Offer">
      <div class="cta-badge">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        <span>${cta1.badge}</span>
      </div>
      <h3 class="cta-title">${cta1.headline}</h3>
      <p class="cta-desc">${cta1.description}</p>
      <ul class="cta-highlights">
        ${cta1.highlights.map(item => `<li><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="cta-check" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg><span>${item}</span></li>`).join('')}
      </ul>
      <div class="cta-action-wrap">
        <a href="${cta1.buttonHref}" class="btn-cta-primary">
          <span>${cta1.buttonText}</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="btn-arrow" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </a>
        <span class="cta-subtext">${cta1.subtext}</span>
      </div>
    </div>
  `;

  const cta2Html = `
    <div class="dynamic-cta-card dynamic-cta-end ${themeClass}" role="region" aria-label="End of Article Strategy Offer">
      <div class="cta-end-inner">
        <div class="cta-badge cta-badge-end">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span>${cta2.badge}</span>
        </div>
        <h3 class="cta-end-title">${cta2.headline}</h3>
        <p class="cta-end-desc">${cta2.subheadline}</p>
        <div class="cta-end-actions">
          <a href="${cta2.primaryHref}" class="btn-cta-primary btn-cta-lg">
            <span>${cta2.primaryText}</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="btn-arrow" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
          <a href="${cta2.secondaryHref}" class="btn-cta-secondary btn-cta-lg">
            <span>${cta2.secondaryText}</span>
          </a>
        </div>
        <div class="cta-assurance">
          <span>${cta2.assuranceTag}</span>
        </div>
      </div>
    </div>
  `;

  return { cta1Html, cta2Html };
}

export function injectDynamicCtas(contentHtml, post) {
  if (!contentHtml) return '';
  const { cta1Html, cta2Html } = generateDynamicCtaHtml(post);

  const paragraphs = contentHtml.split('</p>');

  if (paragraphs.length >= 4) {
    const midIndex = Math.floor(paragraphs.length * 0.45);
    paragraphs.splice(midIndex, 0, `\n${cta1Html}\n`);
    let result = paragraphs.join('</p>');
    result += `\n${cta2Html}`;
    return result;
  } else if (paragraphs.length >= 2) {
    paragraphs.splice(1, 0, `\n${cta1Html}\n`);
    let result = paragraphs.join('</p>');
    result += `\n${cta2Html}`;
    return result;
  } else {
    return contentHtml + `\n${cta1Html}\n${cta2Html}`;
  }
}
