(function () {
  'use strict';

  /* --- Mobile Navigation --- */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav__link');
  const header = document.getElementById('header');

  function closeMenu() {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    navMenu.classList.remove('nav__menu--open');
    header.classList.remove('header--menu-open');
    document.body.style.overflow = '';
  }

  function openMenu() {
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    navMenu.classList.add('nav__menu--open');
    header.classList.add('header--menu-open');
    document.body.style.overflow = 'hidden';
  }

  navToggle.addEventListener('click', function () {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      navToggle.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && navToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });

  /* --- Sticky Header Shadow --- */
  function onScroll() {
    if (window.scrollY > 20) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Scroll Reveal --- */
  const revealElements = document.querySelectorAll(
    '.service-card, .why-us__item, .testimonial-card, .why-us__card, .section__header, .pricing-card, .care-card, .addon-item, .bundle-card, .page-hero__content, .portfolio-card'
  );

  revealElements.forEach(function (el) {
    el.classList.add('reveal');
  });

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
    revealObserver.observe(el);
  });

  /* --- Active Nav Link Highlight --- */
  const navSectionLinks = Array.from(navLinks).filter(function (link) {
    return !link.classList.contains('nav__link--cta');
  });

  function setActiveNavLink(activeLink) {
    navSectionLinks.forEach(function (link) {
      link.classList.remove('nav__link--active');
    });

    if (activeLink) {
      activeLink.classList.add('nav__link--active');
    }
  }

  function getLinkSectionId(link) {
    const href = link.getAttribute('href') || '';
    const hashIndex = href.indexOf('#');
    return hashIndex === -1 ? null : href.slice(hashIndex + 1);
  }

  const sectionNavMap = {};
  let pricingNavLink = null;
  let portfolioNavLink = null;

  navSectionLinks.forEach(function (link) {
    const href = link.getAttribute('href') || '';

    if (href.includes('pricing.html')) {
      pricingNavLink = link;
      return;
    }

    if (href.includes('portfolio.html')) {
      portfolioNavLink = link;
      return;
    }

    const sectionId = getLinkSectionId(link);
    if (sectionId) {
      sectionNavMap[sectionId] = link;
    }
  });

  const isPricingPage = /pricing\.html$/i.test(window.location.pathname);
  const isPortfolioPage = /portfolio\.html$/i.test(window.location.pathname);

  if (isPricingPage && pricingNavLink) {
    setActiveNavLink(pricingNavLink);
  } else if (isPortfolioPage && portfolioNavLink) {
    setActiveNavLink(portfolioNavLink);
  } else {
    const visibleSections = new Map();
    const observedSectionIds = Object.keys(sectionNavMap);

    if (observedSectionIds.length) {
      const sectionObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            const id = entry.target.id;
            if (entry.isIntersecting) {
              visibleSections.set(id, entry.intersectionRatio);
            } else {
              visibleSections.delete(id);
            }
          });

          let activeId = null;
          let highestRatio = 0;

          visibleSections.forEach(function (ratio, id) {
            if (ratio > highestRatio) {
              highestRatio = ratio;
              activeId = id;
            }
          });

          if (activeId && sectionNavMap[activeId]) {
            setActiveNavLink(sectionNavMap[activeId]);
          }
        },
        {
          threshold: [0.15, 0.3, 0.5, 0.75],
          rootMargin: '-' + getComputedStyle(document.documentElement).getPropertyValue('--header-h').trim() + ' 0px -55% 0px'
        }
      );

      observedSectionIds.forEach(function (id) {
        const section = document.getElementById(id);
        if (section) {
          sectionObserver.observe(section);
        }
      });
    }
  }
})();
