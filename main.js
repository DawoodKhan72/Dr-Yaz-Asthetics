/* ============================================================
   DR. YAZ AESTHETICS — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ====== Animated Gold Bokeh Canvas ====== */
  (function initBokeh() {
    const canvas = document.getElementById('bokehCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const GOLD_COLORS = [
      'rgba(201,168,76,',
      'rgba(245,217,139,',
      'rgba(154,123,46,',
      'rgba(253,243,216,',
      'rgba(218,185,100,',
    ];

    let W, H, particles;

    /* Resize handler */
    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    /* Particle constructor */
    function createParticle() {
      const r = 4 + Math.random() * 40;
      return {
        x:    Math.random() * W,
        y:    Math.random() * H,
        r:    r,
        baseR: r,
        vx:   (Math.random() - 0.5) * 0.28,
        vy:   -(0.12 + Math.random() * 0.3),
        alpha: 0.04 + Math.random() * 0.2,
        color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.006 + Math.random() * 0.012,
      };
    }

    function initParticles() {
      /* Max 80 particles; ~1 particle per 14 000 px² for performance */
      const count = Math.min(80, Math.floor((W * H) / 14000));
      particles = Array.from({ length: count }, createParticle);
    }

    function drawParticle(p) {
      p.pulse += p.pulseSpeed;
      p.r = p.baseR + Math.sin(p.pulse) * (p.baseR * 0.18);

      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      gradient.addColorStop(0,   p.color + (p.alpha * 0.8).toFixed(3) + ')');
      gradient.addColorStop(0.4, p.color + (p.alpha * 0.4).toFixed(3) + ')');
      gradient.addColorStop(1,   p.color + '0)');

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    function updateParticle(p) {
      p.x += p.vx;
      p.y += p.vy;
      /* Wrap around edges */
      if (p.y + p.r < 0)  { p.y = H + p.r; p.x = Math.random() * W; }
      if (p.x - p.r > W)  { p.x = -p.r; }
      if (p.x + p.r < 0)  { p.x = W + p.r; }
    }

    let rafId;
    function animate() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { drawParticle(p); updateParticle(p); });
      rafId = requestAnimationFrame(animate);
    }

    /* Init */
    resize();
    initParticles();
    animate();

    /* Resize with debounce */
    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        initParticles();
      }, 200);
    });

    /* Pause when off-screen to save resources */
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (!rafId) { animate(); }
        } else {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    }, { threshold: 0 });

    observer.observe(canvas.closest('.hero'));
  })();

  /* ====== Sticky Nav ====== */
  (function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ====== Mobile Nav Toggle ====== */
  (function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const links  = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    /* Close on link click */
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  })();

  /* ====== Scroll Reveal ====== */
  (function initReveal() {
    const targets = document.querySelectorAll(
      '.about__card, .treatment-card, .price-category, .contact-card, .contact__info'
    );

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    targets.forEach(function (el) { el.classList.add('reveal'); });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            /* Stagger children within the same parent */
            const siblings = entry.target.parentElement
              ? Array.from(entry.target.parentElement.children)
              : [];
            const idx = siblings.indexOf(entry.target);
            setTimeout(function () {
              entry.target.classList.add('visible');
            }, idx * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(function (el) { observer.observe(el); });
  })();

  /* ====== Active nav link on scroll ====== */
  (function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (a) {
              a.classList.toggle(
                'active',
                a.getAttribute('href') === '#' + entry.target.id
              );
            });
          }
        });
      },
      { threshold: 0.35 }
    );

    sections.forEach(function (s) { observer.observe(s); });
  })();

})();
