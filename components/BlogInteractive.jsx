'use client';

import React, { useEffect, useState } from 'react';

// Reading Progress Bar Component
export function ReadingProgressBar() {
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollWidth(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="reading-progress-bar-wrap">
      <div 
        className="reading-progress-bar" 
        style={{ width: `${scrollWidth}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

// Sticky Table of Contents Component
export function StickyTOC() {
  const [tocItems, setTocItems] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [isOpen, setIsOpen] = useState(false); // For mobile collapsible TOC

  useEffect(() => {
    // Wait a brief tick to ensure DOM is fully updated by React
    const timer = setTimeout(() => {
      const headingElements = document.querySelectorAll('.blog-article-content h2');
      const items = Array.from(headingElements).map((el, index) => {
        let id = el.id;
        if (!id) {
          id = el.textContent
            ? el.textContent
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            : `section-${index}`;
          el.id = id;
        }
        return {
          text: el.textContent || `Section ${index + 1}`,
          id: id,
        };
      });

      setTocItems(items);

      if (items.length > 0) {
        const observerOptions = {
          rootMargin: '-80px 0px -70% 0px',
          threshold: 0,
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        }, observerOptions);

        headingElements.forEach((el) => observer.observe(el));

        return () => {
          headingElements.forEach((el) => observer.unobserve(el));
        };
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  if (tocItems.length === 0) return null;

  return (
    <nav className={`sticky-toc-box ${isOpen ? 'is-open' : ''}`}>
      <button 
        className="toc-mobile-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>Table of Contents</span>
        <svg 
          viewBox="0 0 24 24" 
          width="18" 
          height="18" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className="toc-content-wrap">
        <h4 className="toc-title">Table of Contents</h4>
        <ul className="toc-list">
          {tocItems.map((item) => (
            <li key={item.id} className={activeId === item.id ? 'active' : ''}>
              <a 
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(item.id);
                  if (target) {
                    const offset = 90; // Header height offset
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = target.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                    setActiveId(item.id);
                    setIsOpen(false);
                  }
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

// FAQ Accordion Component
export function FaqAccordion({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="faq-section-wrap">
      <h2 className="faq-section-title">Frequently Asked Questions</h2>
      <div className="faq-accordion-list">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className={`faq-accordion-item ${isOpen ? 'active' : ''}`}
            >
              <button
                className="faq-accordion-header"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <span className="faq-accordion-icon">
                  <svg 
                    viewBox="0 0 24 24" 
                    width="20" 
                    height="20" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" className="icon-vert" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </button>
              <div 
                className="faq-accordion-content"
                style={{ 
                  maxHeight: isOpen ? '500px' : '0px',
                  opacity: isOpen ? 1 : 0,
                  paddingBottom: isOpen ? '20px' : '0px'
                }}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Newsletter Widget Component
export function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  return (
    <div className="newsletter-widget">
      <h4>Join Our Newsletter</h4>
      <p>Get the latest actionable SEO tips, AIO optimization trends, and web strategy insights directly to your inbox.</p>
      {status === 'success' ? (
        <div style={{ color: 'var(--brand)', fontWeight: '600', fontSize: '0.9rem', marginTop: '10px' }}>
          ✓ Thank you for subscribing!
        </div>
      ) : (
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Enter your work email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            aria-label="Work Email" 
            disabled={status === 'loading'}
          />
          <button type="submit" className="btn" disabled={status === 'loading'}>
            {status === 'loading' ? 'Subscribing...' : 'Subscribe →'}
          </button>
        </form>
      )}
    </div>
  );
}
