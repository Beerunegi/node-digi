const menuButton = document.querySelector('.menu-toggle');
const topNav = document.querySelector('#topNav');

if (menuButton && topNav) {
  const closeMenu = () => {
    topNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = topNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  topNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 760 && link.classList.contains('nav-dropdown-toggle')) {
        e.preventDefault();
        link.parentElement.classList.toggle('active');
        return;
      }
      closeMenu();
    });
  });

  document.addEventListener('click', (event) => {
    if (!topNav.classList.contains('open')) return;
    if (topNav.contains(event.target) || menuButton.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) {
      closeMenu();
    }
  });
}

const revealTargets = document.querySelectorAll('.reveal');

// Tells the head bootstrap script that reveals are handled, so it does not
// need to fall back to showing everything unconditionally.
window.__revealReady = true;

if (revealTargets.length) {
  const showNow = (el) => {
    el.classList.add('reveal-instant', 'show');
  };

  // Anything already on screen is shown immediately -- an element that is
  // visible on load should not animate in, and a hidden heading cannot count
  // towards LCP.
  const showInViewport = () => {
    const height = window.innerHeight || document.documentElement.clientHeight || 0;
    document.querySelectorAll('.reveal:not(.show)').forEach((el) => {
      if (el.getBoundingClientRect().top < height) showNow(el);
    });
  };

  showInViewport();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before it hits the viewport
    }
  );

  revealTargets.forEach((item, index) => {
    if (item.classList.contains('show')) return;
    // Dynamic stagger based on screen position or index
    const rect = item.getBoundingClientRect();
    const delay = Math.min((rect.top / 10) + (index % 3 * 100), 400);
    item.style.transitionDelay = `${delay}ms`;
    observer.observe(item);
  });

  // IntersectionObserver does not run while the tab is hidden, so a page
  // opened in a background tab would otherwise stay blank until the user
  // scrolls after focusing it.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') showInViewport();
  });
}

const counters = document.querySelectorAll('[data-counter]');

const animateCounter = (el) => {
  const rawTarget = el.getAttribute('data-counter');
  const numPart = parseFloat(rawTarget);
  if (isNaN(numPart)) return;
  const isDecimal = rawTarget.includes('.');
  const duration = 1100;
  const startTime = performance.now();

  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = progress * numPart;
    if (isDecimal) {
      el.textContent = value.toFixed(1);
    } else {
      el.textContent = Math.floor(value);
    }

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = rawTarget;
    }
  };

  requestAnimationFrame(step);
};

if (counters.length) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

const allowTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const tiltCards = document.querySelectorAll('[data-tilt]');

if (allowTilt && !reduceMotion) {
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const rotateX = ((y / rect.height) - 0.5) * -8;
      const rotateY = ((x / rect.width) - 0.5) * 8;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

const typewriterWord = document.querySelector('#typewriterWord');

if (typewriterWord) {
  const words = (typewriterWord.getAttribute('data-words') || '')
    .split('|')
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length) {
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      const currentWord = words[wordIndex];

      if (!deleting) {
        charIndex += 1;
        typewriterWord.textContent = currentWord.slice(0, charIndex);

        if (charIndex === currentWord.length) {
          deleting = true;
          setTimeout(tick, 900);
          return;
        }
      } else {
        charIndex -= 1;
        typewriterWord.textContent = currentWord.slice(0, charIndex);

        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }

      const speed = deleting ? 40 : 75;
      setTimeout(tick, speed);
    };

    typewriterWord.textContent = '';
    tick();
  }
}

const whatsappHref = 'https://wa.me/919871264699?text=Hello%20Digi%20Web%20Tech%2C%20I%20need%20digital%20marketing%20services.';
const ctaGroups = document.querySelectorAll('.hero-actions, .final-cta-inner');

ctaGroups.forEach((group) => {
  // Prevent aggressive script from injecting WhatsApp into specific grid layouts or sections like "Why Choose" or the homepage hero banner
  if (group.closest('.why-choose-section') || group.closest('.hero-single')) return;
  
  const hasWhatsapp = group.querySelector('.btn-whatsapp');
  if (!hasWhatsapp) {
    const link = document.createElement('a');
    link.href = whatsappHref;
    link.target = '_blank';
    link.rel = 'noopener';
    link.className = 'btn btn-whatsapp';
    link.textContent = 'WhatsApp Now';
    group.appendChild(link);
  }
});

const sliderRoots = document.querySelectorAll('[data-slider-root]');

sliderRoots.forEach((sliderRoot) => {
  const sliderTrack = sliderRoot.querySelector('[data-slider-track]');
  const sliderCards = sliderTrack ? Array.from(sliderTrack.querySelectorAll('[data-slider-card], .sample-testimonial-card, .about-testimonial-card')) : [];

  if (!sliderTrack || sliderCards.length < 2) {
    return;
  }

  const getScrollAmount = () => {
    const firstCard = sliderCards[0];
    return firstCard ? firstCard.getBoundingClientRect().width + 16 : 340;
  };

  const scrollToCard = (index) => {
    const boundedIndex = index >= sliderCards.length ? 0 : index < 0 ? sliderCards.length - 1 : index;
    const targetCard = sliderCards[boundedIndex];
    if (!targetCard) return boundedIndex;

    sliderTrack.scrollTo({
      left: targetCard.offsetLeft - sliderTrack.offsetLeft,
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
    return boundedIndex;
  };

  let activeIndex = 0;
  let autoSlideTimer = null;
  let resumeTimer = null;

  const isMobileSlider = () => window.innerWidth <= 760;

  const syncActiveIndex = () => {
    const scrollLeft = sliderTrack.scrollLeft;
    const scrollAmount = getScrollAmount();
    activeIndex = scrollAmount > 0 ? Math.round(scrollLeft / scrollAmount) : 0;
    activeIndex = Math.max(0, Math.min(activeIndex, sliderCards.length - 1));
  };

  const stopAutoSlide = () => {
    if (autoSlideTimer) {
      window.clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  };

  const startAutoSlide = () => {
    stopAutoSlide();

    if (!isMobileSlider() || reduceMotion) {
      return;
    }

    autoSlideTimer = window.setInterval(() => {
      activeIndex = scrollToCard(activeIndex + 1);
    }, 3200);
  };

  const pauseAndResumeAutoSlide = () => {
    stopAutoSlide();
    if (resumeTimer) {
      window.clearTimeout(resumeTimer);
    }

    resumeTimer = window.setTimeout(() => {
      syncActiveIndex();
      startAutoSlide();
    }, 4200);
  };

  sliderTrack.addEventListener('scroll', syncActiveIndex, { passive: true });
  sliderTrack.addEventListener('pointerdown', pauseAndResumeAutoSlide, { passive: true });
  sliderTrack.addEventListener('touchstart', pauseAndResumeAutoSlide, { passive: true });
  sliderTrack.addEventListener('mouseenter', stopAutoSlide);
  sliderTrack.addEventListener('mouseleave', startAutoSlide);
  window.addEventListener('resize', startAutoSlide);

  startAutoSlide();
});


/* ---------------------------------------------------------------------------
 * Homepage ambience
 *
 * Both effects below are progressive enhancement: they are guarded on the
 * elements they need, skipped entirely when the visitor prefers reduced
 * motion, and never affect whether content is visible.
 * ------------------------------------------------------------------------ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reading progress bar. The element is created here rather than in markup so
// no-JS visitors are not left with an empty sliver at the top of the page.
if (!prefersReducedMotion && document.querySelector('.hero-single')) {
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  let ticking = false;

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.setProperty('--scroll-progress', Math.min(1, Math.max(0, ratio)).toFixed(4));
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateProgress);
    },
    { passive: true }
  );

  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
}

// Cursor-tracking sheen on cards. Pointer coordinates are published as CSS
// custom properties and the gradient itself is drawn in CSS, so the handler
// stays cheap. Skipped on touch, where there is no hover state to track.
const spotlightCards = document.querySelectorAll(
  '.why-stat-card-new, .home-service-card, .intent-card, .testimonial-card'
);

if (
  spotlightCards.length &&
  !prefersReducedMotion &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches
) {
  spotlightCards.forEach((card) => {
    card.addEventListener(
      'pointermove',
      (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      },
      { passive: true }
    );

    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    });
  });
}

/* ---------------------------------------------------------------------------
 * Section navigator
 *
 * Long marketing pages are tiring to scan on a phone. This adds a "Sections"
 * button to the existing mobile action bar which opens a sheet listing every
 * titled section, with the current one highlighted. Built here rather than in
 * markup so visitors without JS never see a control that cannot work.
 * ------------------------------------------------------------------------ */

const stickyBar = document.querySelector('.mobile-sticky-bar');
const navSections = stickyBar
  ? [...document.querySelectorAll('main section[id]')].filter((section) => {
      const heading = section.querySelector('h1, h2');
      return heading && heading.textContent.trim().length > 0;
    })
  : [];

if (stickyBar && navSections.length >= 4) {
  const labelFor = (section) => {
    const explicit = section.getAttribute('data-nav-label');
    if (explicit) return explicit;
    const eyebrow = section.querySelector('.eyebrow');
    if (eyebrow && eyebrow.textContent.trim().length <= 26) {
      return eyebrow.textContent.trim();
    }
    const heading = section.querySelector('h1, h2').textContent.trim();
    return heading.length > 34 ? `${heading.slice(0, 32).trimEnd()}…` : heading;
  };

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'section-nav-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-haspopup', 'dialog');
  toggle.innerHTML =
    '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">' +
    '<path d="M4 7h16M4 12h16M4 17h10"/></svg><span>Sections</span>';

  const sheet = document.createElement('div');
  sheet.className = 'section-nav-sheet';
  sheet.dataset.open = 'false';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-label', 'Jump to a section');
  sheet.innerHTML =
    '<div class="section-nav-scrim" data-nav-close></div>' +
    '<div class="section-nav-panel">' +
    '<div class="section-nav-grabber" aria-hidden="true"></div>' +
    '<p class="section-nav-title">Jump to</p>' +
    '<ul class="section-nav-list"></ul>' +
    '</div>';

  const list = sheet.querySelector('.section-nav-list');
  navSections.forEach((section, index) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.innerHTML =
      `<span class="section-nav-num">${String(index + 1).padStart(2, '0')}</span>` +
      `<span>${labelFor(section)}</span>`;
    item.appendChild(link);
    list.appendChild(item);
  });

  stickyBar.prepend(toggle);
  document.body.appendChild(sheet);

  const links = [...list.querySelectorAll('a')];

  const setOpen = (open) => {
    sheet.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) links[0]?.focus();
  };

  toggle.addEventListener('click', () => setOpen(sheet.dataset.open !== 'true'));
  sheet.addEventListener('click', (event) => {
    if (event.target.closest('[data-nav-close]') || event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sheet.dataset.open === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  // Scroll spy. rootMargin biases towards whichever section owns the upper
  // third of the screen, which matches what the reader is actually looking at.
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const active = `#${entry.target.id}`;
        links.forEach((link) => {
          if (link.getAttribute('href') === active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    },
    { rootMargin: '-15% 0px -70% 0px' }
  );

  navSections.forEach((section) => spy.observe(section));
}

// On a phone the FAQ reads better as a closed, scannable index; an expanded
// answer adds ~150px before the reader has chosen a question.
if (window.matchMedia('(max-width: 760px)').matches) {
  document.querySelectorAll('#faq details[open]').forEach((item) => item.removeAttribute('open'));
}
