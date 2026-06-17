/**
 * effects.js — Game Day Interactive Effects
 * Particles · Scroll reveals · Stat counters · Nav polish · Broadcast elements
 */
(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOBILE  = window.innerWidth < 640;
  const PRIMARY = '#FB923C';
  const ACCENT  = '#818CF8';
  const GOLD    = '#F59E0B';

  /* ─── 1. PARTICLE CANVAS (hero only, desktop) ─────────────────────── */
  function initParticles() {
    const hero = document.querySelector('.hero-v3');
    if (!hero || MOBILE || REDUCED) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;z-index:5;pointer-events:none;width:100%;height:100%';
    hero.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const PALETTE = [PRIMARY, '#FED7AA', '#ffffff', GOLD, ACCENT, '#F472B6'];
    let W, H, pts = [], raf;

    function resize() {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }

    function spawn() {
      pts = [];
      const n = Math.min(90, Math.floor(W / 16));
      for (let i = 0; i < n; i++) {
        pts.push({
          x:     Math.random() * W,
          y:     Math.random() * H,
          r:     Math.random() * 1.8 + 0.3,
          a:     Math.random() * 0.38 + 0.06,
          vy:    Math.random() * 0.38 + 0.07,
          vx:    (Math.random() - 0.5) * 0.18,
          ph:    Math.random() * Math.PI * 2,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        });
      }
    }

    function frame(ts) {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        const alpha = p.a * (0.65 + 0.35 * Math.sin(ts / 2200 + p.ph));
        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        // Soft glow halo on bigger particles
        if (p.r > 1.1) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          g.addColorStop(0, p.color);
          g.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.globalAlpha = alpha * 0.18;
          ctx.fill();
        }
        p.x += p.vx;
        p.y -= p.vy;
        if (p.y < -6)    { p.y = H + 6; p.x = Math.random() * W; }
        if (p.x < -6)    p.x = W + 6;
        if (p.x > W + 6) p.x = -6;
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    resize(); spawn(); raf = requestAnimationFrame(frame);
    window.addEventListener('resize', () => { resize(); spawn(); }, { passive: true });
  }

  /* ─── 2. SCROLL REVEAL ────────────────────────────────────────────── */
  function initScrollReveal() {
    if (REDUCED) return;

    const sel = [
      '.card', '.team-card', '.game-card', '.game-card-wrap',
      '.stat-cell', '.how-card', '.factor', '.insider-card',
      '.injury-card', '.top-pick', '.value-alert-row', '.upcoming-row',
      '.trend-card', '.power-item', '.coaching-card', '.player-card',
      '.vegas-cell', '.pick-chip', '.page-stat', '.social-card',
      '.beat-writer-card', '.ml-cell', '.team-row',
    ].join(',');

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('gd-in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -28px 0px' });

    let idx = 0;
    document.querySelectorAll(sel).forEach(el => {
      if (el.closest('.hero-v3') || el.closest('.bottom-nav')) return;
      el.classList.add('gd-hidden');
      // Group delay: stagger within each 5-element window
      el.style.transitionDelay = `${(idx % 5) * 60}ms`;
      idx++;
      obs.observe(el);
    });
  }

  /* ─── 3. STAT COUNTER ────────────────────────────────────────────── */
  function countUp(el, target, dur, dec) {
    const t0 = performance.now();
    const orig = el.textContent;
    // Extract prefix/suffix around the number
    const m = orig.match(/([\d.]+)/);
    if (!m) return;
    const pre = orig.slice(0, orig.indexOf(m[0]));
    const suf = orig.slice(orig.indexOf(m[0]) + m[0].length);
    function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = pre + (dec ? v.toFixed(dec) : Math.round(v)) + suf;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initCounters() {
    if (REDUCED) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        const raw = e.target.textContent.trim();
        const m   = raw.match(/([\d.]+)/);
        if (!m) return;
        const num = parseFloat(m[0]);
        if (isNaN(num) || num < 2) return; // skip tiny numbers
        countUp(e.target, num, 1500, raw.includes('.') ? 1 : 0);
      });
    }, { threshold: 0.7 });

    document.querySelectorAll(
      '.stat-cell-val, .stat-cell-value, .social-score, [id^="stat-"]'
    ).forEach(el => {
      const t = el.textContent.trim();
      if (/[\d]/.test(t) && t.length < 14) obs.observe(el);
    });
  }

  /* ─── 4. NAV SCROLL STATE ────────────────────────────────────────── */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    function upd() { nav.classList.toggle('nav--scrolled', window.scrollY > 40); }
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  }

  /* ─── 5. GAME DAY BADGE ──────────────────────────────────────────── */
  function initGameDay() {
    const today = new Date().toISOString().slice(0, 10);
    document.querySelectorAll('[data-game-date]').forEach(el => {
      if (el.dataset.gameDate === today) el.classList.add('is-game-day');
    });
  }

  /* ─── 6. CARD TILT (desktop only, subtle) ───────────────────────── */
  function initTilt() {
    if (MOBILE || REDUCED) return;
    document.querySelectorAll('.card-link, .team-card, .top-pick').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const rx = ((e.clientY - cy) / r.height) * -5;
        const ry = ((e.clientX - cx) / r.width)  *  5;
        card.style.transform = `translateY(-4px) perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ─── 7. LIVE TICKER (home page) ────────────────────────────────── */
  function initTicker() {
    const ticker = document.getElementById('gd-ticker-inner');
    if (!ticker || REDUCED) return;
    // Duplicate content for seamless loop
    ticker.innerHTML += ticker.innerHTML;
  }

  /* ─── INIT ───────────────────────────────────────────────────────── */
  function boot() {
    initParticles();
    initScrollReveal();
    initCounters();
    initNav();
    initGameDay();
    initTilt();
    initTicker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
