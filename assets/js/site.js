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
})();
