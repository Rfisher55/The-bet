/**
 * effects.js — Game Day Interactive Effects
 * Football field canvas · Scroll reveals · Stat counters · Nav polish · Broadcast elements
 */
(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOBILE  = window.innerWidth < 640;

  /* ─── 1. FOOTBALL FIELD CANVAS (hero) ────────────────────────────── */
  function initFootballField() {
    const hero = document.querySelector('.hero-v3');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText =
      'position:absolute;inset:0;z-index:5;pointer-events:none;width:100%;height:100%';
    hero.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let rafId = null;
    let resizeTimer = null;

    function resize() {
      canvas.width  = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    function frame(ts) {
      drawField(ts);
      if (!REDUCED) rafId = requestAnimationFrame(frame);
    }

    function drawField(ts) {
      const W = canvas.width;
      const H = canvas.height;
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);

      // Vanishing point — center-x, 40% down
      const vpX = W / 2;
      const vpY = H * 0.40;
      const botY = H;
      const spreadX = W * (MOBILE ? 0.98 : 1.22);

      // Field edge projection helpers
      function lx(y) {
        const t = Math.max(0, (y - vpY) / (botY - vpY));
        return vpX - (spreadX / 2) * t;
      }
      function rx(y) {
        const t = Math.max(0, (y - vpY) / (botY - vpY));
        return vpX + (spreadX / 2) * t;
      }

      // ── Turf stripes (12 alternating bands)
      for (let i = 0; i < 12; i++) {
        const t1 = i / 12, t2 = (i + 1) / 12;
        const y1 = vpY + (botY - vpY) * t1;
        const y2 = vpY + (botY - vpY) * t2;
        ctx.beginPath();
        ctx.moveTo(lx(y1), y1); ctx.lineTo(rx(y1), y1);
        ctx.lineTo(rx(y2), y2); ctx.lineTo(lx(y2), y2);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? '#050e05' : '#081408';
        ctx.fill();
      }

      // ── Sidelines
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(lx(vpY + 2), vpY + 2); ctx.lineTo(lx(botY), botY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rx(vpY + 2), vpY + 2); ctx.lineTo(rx(botY), botY);
      ctx.stroke();

      // ── Yard lines (0–100, every 10 yards = 11 lines)
      for (let i = 0; i <= 11; i++) {
        const t = i / 11;
        const y = vpY + (botY - vpY) * t;
        ctx.beginPath();
        ctx.moveTo(lx(y), y); ctx.lineTo(rx(y), y);
        ctx.strokeStyle = `rgba(255,255,255,${0.07 + t * 0.24})`;
        ctx.lineWidth = 0.5 + t * 2.2;
        ctx.stroke();
      }

      // ── Hash marks (between each yard line)
      for (let i = 1; i <= 21; i += 2) {
        const t = i / 22;
        const y = vpY + (botY - vpY) * t;
        const span = rx(y) - lx(y);
        const hw = span * 0.04;
        const lh = lx(y) + span * 0.37;
        const rh = lx(y) + span * 0.63;
        ctx.strokeStyle = `rgba(255,255,255,${0.04 + t * 0.13})`;
        ctx.lineWidth = 0.4 + t * 1.3;
        [lh, rh].forEach(hx => {
          ctx.beginPath();
          ctx.moveTo(hx - hw / 2, y);
          ctx.lineTo(hx + hw / 2, y);
          ctx.stroke();
        });
      }

      // ── Yard numbers in perspective
      const nums = ['10','20','30','40','50','40','30','20','10'];
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      for (let i = 0; i < 9; i++) {
        const t = (i + 1.5) / 11;
        const y = vpY + (botY - vpY) * t;
        const span = rx(y) - lx(y);
        const fs = Math.max(7, Math.min(38, span * 0.048));
        const alpha = Math.max(0, Math.min(0.4, (t - 0.05) * 0.62));
        ctx.font = `900 ${fs}px "Barlow Condensed", Arial, sans-serif`;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillText(nums[i], vpX, y + fs * 0.52);
      }

      // ── Subtle center-field glow pulse
      const pulse = REDUCED ? 0.5 : (0.5 + 0.5 * Math.sin((ts || 0) / 3800));
      const cg = ctx.createRadialGradient(
        vpX, vpY + (botY - vpY) * 0.52, 0,
        vpX, vpY + (botY - vpY) * 0.52, spreadX * 0.4
      );
      cg.addColorStop(0, `rgba(251,146,60,${0.025 + pulse * 0.022})`);
      cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cg;
      ctx.fillRect(0, vpY, W, botY - vpY);

      // ── Stadium light cones from top corners (pulsing warmly)
      const lp = REDUCED ? 0.5 : (0.5 + 0.5 * Math.sin((ts || 0) / 5200));
      const rp = REDUCED ? 0.5 : (0.5 + 0.5 * Math.sin((ts || 0) / 4600 + 1.1));
      [
        { x: W * 0.03, y: H * 0.04, r: W * 0.60, c: `rgba(255,190,90,${0.13 + lp * 0.05})`  },
        { x: W * 0.97, y: H * 0.04, r: W * 0.60, c: `rgba(210,228,255,${0.11 + rp * 0.04})` },
        { x: W * 0.14, y: H * 0.20, r: W * 0.40, c: `rgba(255,160,60,${0.07 + lp * 0.03})`  },
        { x: W * 0.86, y: H * 0.20, r: W * 0.40, c: `rgba(180,200,255,${0.06 + rp * 0.03})` },
      ].forEach(({ x, y, r, c }) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, c);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      // ── Sky overlay (dark above vanishing point)
      const sky = ctx.createLinearGradient(0, 0, 0, vpY + (botY - vpY) * 0.22);
      sky.addColorStop(0,   'rgba(0,0,0,1)');
      sky.addColorStop(0.60, 'rgba(0,0,0,0.88)');
      sky.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // ── Bottom page-blend fade
      const bot = ctx.createLinearGradient(0, H * 0.60, 0, H);
      bot.addColorStop(0, 'rgba(0,0,0,0)');
      bot.addColorStop(1, 'rgba(10,10,11,1)');
      ctx.fillStyle = bot;
      ctx.fillRect(0, 0, W, H);

      // ── Lateral edge fades (seamless into page edges)
      const ef1 = ctx.createLinearGradient(0, 0, W * 0.13, 0);
      ef1.addColorStop(0, 'rgba(0,0,0,0.78)');
      ef1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ef1;
      ctx.fillRect(0, 0, W, H);

      const ef2 = ctx.createLinearGradient(W, 0, W * 0.87, 0);
      ef2.addColorStop(0, 'rgba(0,0,0,0.78)');
      ef2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ef2;
      ctx.fillRect(0, 0, W, H);
    }

    resize();
    if (REDUCED) {
      // Static draw for reduced-motion
      drawField(0);
    } else {
      rafId = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    }, { passive: true });
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
      el.style.transitionDelay = `${(idx % 5) * 60}ms`;
      idx++;
      obs.observe(el);
    });
  }

  /* ─── 3. STAT COUNTER ────────────────────────────────────────────── */
  function countUp(el, target, dur, dec) {
    const t0 = performance.now();
    const orig = el.textContent;
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
        if (isNaN(num) || num < 2) return;
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
    ticker.innerHTML += ticker.innerHTML;
  }

  /* ─── 8. SCOREBOARD NUMBER FORMATTING ───────────────────────────── */
  function initScoreboard() {
    // Apply Rajdhani to stat values dynamically added to DOM
    document.querySelectorAll(
      '.stat-cell-val, .stat-cell-value, .vegas-val, .social-score, .pred-score, .upcoming-days'
    ).forEach(el => {
      el.style.fontFamily = "'Rajdhani', sans-serif";
      el.style.fontWeight = '700';
      el.style.fontVariantNumeric = 'tabular-nums';
      el.style.letterSpacing = '0.5px';
    });
  }

  /* ─── INIT ───────────────────────────────────────────────────────── */
  function boot() {
    initFootballField();
    initScrollReveal();
    initCounters();
    initNav();
    initGameDay();
    initTilt();
    initTicker();
    initScoreboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
