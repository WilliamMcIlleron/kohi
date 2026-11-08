/* ==========================================================================
   Kōhī by Ifuku — progressive enhancement only.
   Every page works with this file blocked; nothing here is load-bearing.
   ========================================================================== */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* --- Header: paint the bar once the page has scrolled past the top ------- */
  const header = $('.site-header');
  if (header && 'IntersectionObserver' in window) {
    // The sentinel is as tall as the header, so the bar paints only once the
    // page has scrolled a header's worth — not on the first pixel of scroll.
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText =
      'position:absolute;top:0;left:0;width:1px;height:var(--header-h);pointer-events:none;';
    document.body.prepend(sentinel);

    new IntersectionObserver(
      ([entry]) => header.classList.toggle('is-stuck', !entry.isIntersecting)
    ).observe(sentinel);
  }

  /* --- Mobile navigation --------------------------------------------------- */
  const nav = $('#nav');
  const toggle = $('.nav-toggle');

  if (nav && toggle) {
    const setNav = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      header?.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', () => {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close on link activation, Escape, or when the layout returns to desktop.
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        toggle.focus();
      }
    });

    const desktop = window.matchMedia('(min-width: 52.0625rem)');
    desktop.addEventListener('change', (e) => { if (e.matches) setNav(false); });
  }

  /* --- Scroll reveal ------------------------------------------------------- */
  const revealables = $$('[data-reveal]');
  if (revealables.length) {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      revealables.forEach((el) => el.classList.add('is-revealed'));
    } else {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

      revealables.forEach((el) => observer.observe(el));
    }
  }

  /* --- Reels: poster until asked, then load and play ----------------------- */
  $$('.reel').forEach((reel) => {
    const button = $('.reel__play', reel);
    const video = $('video', reel);
    if (!button || !video) return;

    button.addEventListener('click', () => {
      if (!video.src && video.dataset.src) {
        video.src = video.dataset.src;
        video.load();
      }
      reel.classList.add('is-playing');
      video.controls = true;
      video.play().catch(() => { reel.classList.remove('is-playing'); });
      video.focus();
    });

    video.addEventListener('pause', () => {
      if (video.currentTime === 0 || video.ended) reel.classList.remove('is-playing');
    });
  });

  /* --- Lightbox ------------------------------------------------------------ */
  const dialog = $('#lightbox');
  const tiles = $$('[data-lightbox]');

  if (dialog && tiles.length && typeof dialog.showModal === 'function') {
    const img = $('.lightbox__figure img', dialog);
    const caption = $('.lightbox__caption', dialog);
    const counter = $('.lightbox__count', dialog);
    let index = 0;

    const show = (i) => {
      index = (i + tiles.length) % tiles.length;
      const tile = tiles[index];
      img.src = tile.dataset.full;
      img.alt = tile.dataset.caption || '';
      caption.textContent = tile.dataset.caption || '';
      counter.textContent = `${index + 1} / ${tiles.length}`;
    };

    tiles.forEach((tile, i) => {
      tile.addEventListener('click', () => { show(i); dialog.showModal(); });
    });

    $('[data-lb="prev"]', dialog)?.addEventListener('click', () => show(index - 1));
    $('[data-lb="next"]', dialog)?.addEventListener('click', () => show(index + 1));
    $('[data-lb="close"]', dialog)?.addEventListener('click', () => dialog.close());

    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    });

    // Click the backdrop (i.e. outside the figure) to dismiss.
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });

    dialog.addEventListener('close', () => {
      tiles[index]?.focus();
      img.removeAttribute('src');
    });
  }

  /* --- Keep the footer year from going stale ------------------------------- */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* --- Marquee: duplicate the track so the loop is seamless ---------------- */
  $$('.marquee__track').forEach((track) => {
    if (reduceMotion.matches) return;
    track.append(...Array.from(track.children).map((n) => {
      const clone = n.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      return clone;
    }));
  });

  /* --- Sessions: is one running right now? --------------------------------- */
  /* Sessions run 08:00–16:00 every Sunday. The
     clock that matters is the room's, not the visitor's, so every comparison is
     made in SAST. South Africa keeps no daylight saving, which makes a fixed
     +02:00 exact rather than an approximation, and avoids trusting the
     visitor's own timezone setting.

     The header shows the state on every page; the Sessions section gets a row
     above the recurring schedule, so the "Every Sunday" copy stays
     intact and this only adds what's true today. */

  const statusEl = $('.session-status');
  const tracklist = $('#sessions .tracklist');

  if (statusEl || tracklist) {
    const SAST     = 2 * 60 * 60 * 1000;
    const DOORS    = 8;    // opens, SAST
    const CLOSE    = 16;   // closes, SAST
    const DAYS     = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MONTHS   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // A SAST wall-clock time, as an absolute timestamp. Reading it back with
    // the getUTC* family gives the wall clock again, so the visitor's own
    // offset never enters the arithmetic. Out-of-range months roll over, which
    // is what makes December's lookahead into January work.
    const sast = (y, m, d, h = 0) => Date.UTC(y, m, d, h) - SAST;
    const wall = (ms) => new Date(ms + SAST);

    // Every Sunday of the month, in date order.
    const sundaysOf = (y, m) => {
      const firstDay = new Date(Date.UTC(y, m, 1)).getUTCDay();
      const lastDate = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      const dates = [];
      for (let d = 1 + ((7 - firstDay) % 7); d <= lastDate; d += 7) dates.push(d);
      return dates;
    };

    // The first session whose doors haven't already shut. Checking next month
    // too means the last Sunday of any month rolls forward correctly.
    const nextSession = (now) => {
      const here = wall(now);
      const y = here.getUTCFullYear();
      const m = here.getUTCMonth();

      for (const month of [m, m + 1]) {
        for (const date of sundaysOf(y, month)) {
          const closes = sast(y, month, date, CLOSE);
          if (now < closes) return { opens: sast(y, month, date, DOORS), closes };
        }
      }
      return null;
    };

    const asDate = (ms) => {
      const d = wall(ms);
      return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
    };

    // The Sessions row is built once and rewritten in place on each tick.
    let nowRow;
    if (tracklist) {
      nowRow = document.createElement('div');
      nowRow.className = 'tracklist__row tracklist__row--now';
      nowRow.innerHTML =
        '<dt></dt><dd><span class="status-dot" aria-hidden="true"></span><span></span></dd>';
      tracklist.prepend(nowRow);
    }

    const compact = window.matchMedia('(max-width: 52rem)');
    const sastDay = (ms) => Math.floor((ms + SAST) / 86400000);

    const render = () => {
      const now = Date.now();
      const next = nextSession(now);
      if (!next) return;

      const state = now >= next.opens ? 'live'
                  : sastDay(now) === sastDay(next.opens) ? 'today'
                  : 'upcoming';
      const live = state === 'live';

      if (statusEl) {
        // The narrow header has room for the wordmark and the toggle and not
        // much else, so the long form is reserved for the wide layout.
        const text = live  ? (compact.matches ? 'Live now' : 'Session live now')
                   : state === 'today'
                     ? (compact.matches ? 'Today, 08:00' : 'Session today, from 08:00')
                     : `Next session ${asDate(next.opens)}`;

        statusEl.dataset.state = state;
        $('.session-status__text', statusEl).textContent = text;
        $('.status-dot', statusEl).classList.toggle('status-dot--live', live);
        statusEl.hidden = false;
      }

      if (nowRow) {
        $('dt', nowRow).textContent =
          live ? 'Now' : state === 'today' ? 'Today' : 'Next';
        $('dd span:last-child', nowRow).textContent =
          live ? 'Live now, until 16:00'
               : state === 'today' ? 'From 08:00' : asDate(next.opens);

        nowRow.classList.toggle('tracklist__row--live', live);
        $('.status-dot', nowRow).classList.toggle('status-dot--live', live);
      }
    };

    render();

    // Doors move on the hour, so a minute's granularity is enough — but a tab
    // left open overnight only catches up when it comes back to the front.
    setInterval(render, 60000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) render();
    });
    compact.addEventListener('change', render);
  }
})();
