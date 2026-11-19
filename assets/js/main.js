/* =========================================================
   Scroll narrative engine
   - language toggle (zh/en)
   - scroll progress + chapter rail
   - reveal / counters / bars / timeline
   - generated grass (hero + loss viz)
   ========================================================= */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isStatic = new URLSearchParams(location.search).has('static');
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- language ---------- */
  const btn = document.getElementById('langBtn');
  const stored = store.get('zostera-lang');
  if (stored === 'en' || stored === 'zh') root.dataset.lang = stored;
  const syncLang = () => {
    const lang = root.dataset.lang;
    root.lang = lang === 'zh' ? 'zh-CN' : 'en';
    btn.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换到中文');
    btn.title = lang === 'zh' ? 'Switch to English' : '切换到中文';
  };
  syncLang();
  btn.addEventListener('click', () => {
    root.dataset.lang = root.dataset.lang === 'zh' ? 'en' : 'zh';
    store.set('zostera-lang', root.dataset.lang);
    syncLang();
  });

  /* ---------- ambient sound (Web Audio, no external file) ---------- */
  const soundBtn = document.getElementById('soundBtn');
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (soundBtn && AudioCtor) {
    let actx = null, master = null, enabled = false, built = false, bellTimer = null;

    const paint = () => {
      soundBtn.classList.toggle('playing', enabled);
      soundBtn.setAttribute('aria-pressed', String(enabled));
      soundBtn.setAttribute('aria-label', enabled ? '关闭环境音 / Mute ambient sound' : '开启环境音 / Play ambient sound');
    };

    const build = () => {
      actx = new AudioCtor();
      master = actx.createGain();
      master.gain.value = 0;
      master.connect(actx.destination);

      // 低频海浪：布朗噪声 + 缓慢起伏
      const secs = 6;
      const len = Math.floor(actx.sampleRate * secs);
      const buffer = actx.createBuffer(1, len, actx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.2;
      }
      const noise = actx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 40;
      const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.6;
      const ng = actx.createGain(); ng.gain.value = 0.5;
      noise.connect(hp); hp.connect(lp); lp.connect(ng); ng.connect(master);

      const swell = actx.createOscillator();
      swell.frequency.value = 0.055;
      const swellAmt = actx.createGain(); swellAmt.gain.value = 0.22;
      swell.connect(swellAmt); swellAmt.connect(ng.gain);
      swell.start(); noise.start();

      // 低频铺底：两个八度的 D 与五度
      const pad = actx.createGain(); pad.gain.value = 0.05;
      const padFilter = actx.createBiquadFilter(); padFilter.type = 'lowpass'; padFilter.frequency.value = 720;
      pad.connect(padFilter); padFilter.connect(master);
      [146.83, 220.0, 293.66, 369.99].forEach((f, i) => {
        const o = actx.createOscillator();
        o.type = 'sine'; o.frequency.value = f; o.detune.value = (i - 1.5) * 5;
        const g = actx.createGain(); g.gain.value = i === 0 ? 0.9 : 0.32;
        o.connect(g); g.connect(pad); o.start();
      });

      built = true;
    };

    const bell = () => {
      if (!enabled || !actx) return;
      const notes = [587.33, 739.99, 880.0, 1174.66];
      const f = notes[Math.floor(Math.random() * notes.length)];
      const t = actx.currentTime;
      const o = actx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = actx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.045, t + 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 4.2);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 4.4);
    };

    const scheduleBell = () => {
      clearTimeout(bellTimer);
      bellTimer = setTimeout(() => {
        if (!enabled) return;
        bell();
        scheduleBell();
      }, 9000 + Math.random() * 9000);
    };

    const on = () => {
      if (!built) build();
      if (actx.state === 'suspended') actx.resume();
      enabled = true;
      master.gain.cancelScheduledValues(actx.currentTime);
      master.gain.setTargetAtTime(0.18, actx.currentTime, 1.2);
      paint();
      bell();
      scheduleBell();
    };

    const off = () => {
      enabled = false;
      clearTimeout(bellTimer);
      if (actx) {
        master.gain.cancelScheduledValues(actx.currentTime);
        master.gain.setTargetAtTime(0.0001, actx.currentTime, 0.35);
        setTimeout(() => {
          if (!enabled && actx.state === 'running') actx.suspend();
        }, 1000);
      }
      paint();
    };

    soundBtn.addEventListener('click', () => { enabled ? off() : on(); });
    document.addEventListener('visibilitychange', () => {
      if (!actx || !enabled) return;
      if (document.hidden) actx.suspend();
      else actx.resume();
    });
    paint();
  } else if (soundBtn) {
    soundBtn.hidden = true;
  }

  /* ---------- hero grass ---------- */
  const hero = document.getElementById('heroGrass');
  if (hero) {
    const NS = 'http://www.w3.org/2000/svg';
    const W = 1440, H = 320;
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 44; i++) {
      const x = (i / 43) * W + (rand() - 0.5) * 26;
      const h = 90 + rand() * 210;
      const bend = (rand() - 0.5) * 90;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', `M ${x} ${H} Q ${x + bend * 0.35} ${H - h * 0.55} ${x + bend} ${H - h}`);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', 'currentColor');
      p.setAttribute('stroke-width', (2 + rand() * 3).toFixed(1));
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('opacity', (0.35 + rand() * 0.5).toFixed(2));
      p.style.animationDelay = (-rand() * 7).toFixed(2) + 's';
      p.style.animationDuration = (5.5 + rand() * 4).toFixed(2) + 's';
      frag.appendChild(p);
    }
    hero.appendChild(frag);
  }

  /* ---------- loss viz ---------- */
  const loss = document.getElementById('lossViz');
  if (loss) {
    const NS = 'http://www.w3.org/2000/svg';
    const W = 1000, H = 300, N = 100, GONE = 84; // >80% gone
    let seed = 42;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < N; i++) {
      const x = (i + 0.5) * (W / N);
      const h = 80 + rand() * 190;
      const bend = (rand() - 0.5) * 16;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', `M ${x} ${H} Q ${x + bend} ${H - h * 0.6} ${x + bend} ${H - h}`);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-width', (2.4 + rand() * 1.5).toFixed(2));
      if (i < GONE) {
        p.setAttribute('stroke', '#8a9790');
        p.setAttribute('opacity', '0.26');
        p.style.transition = `opacity 1.2s ${(i * 0.006).toFixed(3)}s ease`;
      } else {
        p.setAttribute('stroke', '#8fb694');
        p.setAttribute('opacity', '0.95');
      }
      frag.appendChild(p);
    }
    loss.appendChild(frag);
  }

  /* ---------- counters ---------- */
  const fmt = (n) => n >= 1000 ? n.toLocaleString('en-US') : String(n);
  const animateCount = (el) => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const factor = Math.pow(10, dec);
    const dur = reduce ? 0 : 1500;
    const t0 = performance.now();
    const tick = (t) => {
      const k = dur ? Math.min((t - t0) / dur, 1) : 1;
      const eased = 1 - Math.pow(1 - k, 3);
      const v = Math.round(target * eased * factor) / factor;
      el.textContent = (dec ? v.toFixed(dec) : fmt(v)) + suffix;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ---------- reveal ---------- */
  if (isStatic) document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* counters observer */
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('[data-count]').forEach(animateCount);
      if (e.target.matches('[data-count]')) animateCount(e.target);
      cio.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('[data-count]').forEach((el) => cio.observe(el.closest('.stat, .big-stat, .counter') || el));

  /* bars */
  const chart = document.querySelector('.repair-chart');
  if (chart) {
    const bio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        chart.querySelectorAll('.bar-fill').forEach((b) => {
          b.style.width = (parseFloat(b.dataset.w) / 1500 * 100).toFixed(2) + '%';
        });
        chart.classList.add('visible');
        bio.disconnect();
      });
    }, { threshold: 0.4 });
    bio.observe(chart);
  }

  /* ---------- names cards ---------- */
  const codes = ['ZH', 'EN', 'FR', 'RU', 'JA'];
  document.querySelectorAll('.name-card').forEach((card, i) => {
    const back = card.querySelector('.back');
    const tag = document.createElement('span');
    tag.className = 'back-lang';
    tag.textContent = (codes[i] || '') + ' · ' + card.querySelector('.name').textContent;
    back.prepend(tag);
    const toggle = () => {
      const on = card.classList.toggle('flipped');
      card.setAttribute('aria-expanded', String(on));
    };
    card.setAttribute('role', 'button');
    card.setAttribute('aria-expanded', 'false');
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); }
    });
  });

  /* ---------- progress + rail + parallax ---------- */
  const bar = document.getElementById('progressBar');
  const topbar = document.querySelector('.topbar');
  const sections = [...document.querySelectorAll('main .chapter')];
  const railLinks = [...document.querySelectorAll('.rail a')];
  const meadowImg = document.querySelector('.meadow-photo img');
  const meadowSec = document.getElementById('meadow');
  let lastY = window.scrollY;

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    if (topbar) {
      if (y > 220 && y > lastY + 6) topbar.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 120) topbar.classList.remove('is-hidden');
    }
    lastY = y;

    if (railLinks.length) {
      let current = sections[0];
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= window.innerHeight * 0.45) current = s;
      }
      railLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current.id));
    }

    if (meadowImg && meadowSec && !reduce) {
      const r = meadowSec.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
      meadowImg.style.transform = `scale(1.06) translateY(${(p - 0.5) * 26}px)`;
    }
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- section reveal boost ---------- */
  const paint = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.repair, .roof, .meadow, .names').forEach((s) => paint.observe(s));
})();
