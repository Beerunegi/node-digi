/**
 * Review markup must correspond to reviews actually visible on the page that
 * carries it (Google structured-data policy), so these sets are keyed by the
 * page whose testimonial section they mirror.
 */
export const pageReviews = {
  '/': [
    {
      author: 'Rahul Verma',
      rating: 5,
      body: 'Within 90 days, our lead volume doubled and ad cost per lead dropped significantly. Their strategy and reporting are very transparent.',
    },
    {
      author: 'Priya Sethi',
      rating: 5,
      body: 'They redesigned our website and improved conversion flow. Bounce rate reduced, enquiries increased, and the site feels premium now.',
    },
    {
      author: 'Aman Khanna',
      rating: 5,
      body: 'Best part is their execution speed. SEO, ads, and creatives all moved in sync and we saw consistent month-on-month growth.',
    },
  ],
  '/about': [
    {
      author: 'Priya Sharma',
      rating: 5,
      body: 'Their web development team built us a flawless eCommerce platform, while their SEO team drove our organic revenue up by 200% in just 6 months. Highly recommended.',
    },
    {
      author: 'Ravi Gupta',
      rating: 5,
      body: 'Digi Web Tech utterly transformed our local sector visibility. Before them, our leads were sporadic; now we process a dependable pipeline of high-quality inbound inquiries.',
    },
    {
      author: 'Ananya Verma',
      rating: 5,
      body: 'Their operational communication is simply top-notch. They are highly transparent with reporting and incredibly strategic with ROAS. The best digital partners in Delhi.',
    },
  ],
};

export function reviewsForPath(pathname) {
  return pageReviews[pathname] || null;
}
