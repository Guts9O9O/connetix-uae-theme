/*
 * CONNETIX UAE — media that plays only while it is on screen.
 *
 * Markup: an element with [data-px-video] containing a <video muted loop playsinline preload="metadata">
 * and, optionally, a button with [data-px-video-toggle] (data-play-label / data-pause-label).
 *
 * - Plays when at least a third of the video is visible, pauses when it scrolls away.
 * - With reduced motion, nothing plays until the visitor presses Play.
 * - The toggle button lets anyone pause looping video (WCAG 2.2.2).
 */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function setupVideos(root = document) {
  root.querySelectorAll('[data-px-video]').forEach((wrap) => {
    if (wrap.dataset.pxReady) return;
    wrap.dataset.pxReady = 'true';

    const video = wrap.querySelector('video');
    const toggle = wrap.querySelector('[data-px-video-toggle]');
    if (!video) return;

    let heldByVisitor = reduceMotion.matches;
    let onScreen = false;

    const sync = () => {
      const playing = !video.paused;
      wrap.classList.toggle('is-playing', playing);
      if (toggle) {
        toggle.setAttribute('aria-pressed', String(playing));
        toggle.setAttribute('aria-label', playing ? toggle.dataset.pauseLabel : toggle.dataset.playLabel);
      }
    };

    const play = () => {
      if (video.preload !== 'auto') video.preload = 'auto';
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
    };

    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);

    toggle?.addEventListener('click', () => {
      if (video.paused) {
        heldByVisitor = false;
        play();
      } else {
        heldByVisitor = true;
        video.pause();
      }
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          if (onScreen && !heldByVisitor) play();
          else if (!onScreen) video.pause();
        },
        { threshold: 0.35 }
      );
      observer.observe(wrap);
    } else if (!heldByVisitor) {
      play();
    }

    sync();
  });
}

setupVideos();
document.addEventListener('shopify:section:load', (event) => setupVideos(event.target));

/*
 * Hero tiles lean toward the pointer, a few pixels at most, like tiles feeling a magnet
 * nearby. Mouse and trackpad only; nothing moves with reduced motion. Each tile's own
 * `translate` is set directly (the snap-in animation owns `transform`).
 */
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

function setupLean(root = document) {
  root.querySelectorAll('[data-px-lean]').forEach((grid) => {
    if (grid.dataset.pxLeanReady) return;
    grid.dataset.pxLeanReady = 'true';
    const tiles = [...grid.children];
    const MAX = 6;
    let frame = 0;
    let rects = [];

    const measure = () => {
      rects = tiles.map((tile) => tile.getBoundingClientRect());
    };

    const reset = () => {
      cancelAnimationFrame(frame);
      tiles.forEach((tile) => {
        tile.style.translate = '';
      });
    };

    grid.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse' || reduceMotion.matches || !finePointer.matches) return;
      measure();
    });

    grid.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse' || reduceMotion.matches || !finePointer.matches || !rects.length) return;
      const { clientX: x, clientY: y } = event;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        tiles.forEach((tile, i) => {
          const r = rects[i];
          const dx = x - (r.left + r.width / 2);
          const dy = y - (r.top + r.height / 2);
          const distance = Math.hypot(dx, dy) || 1;
          const pull = Math.max(0, 1 - distance / (r.width * 1.6));
          tile.style.translate = `${((dx / distance) * MAX * pull).toFixed(2)}px ${((dy / distance) * MAX * pull).toFixed(2)}px`;
        });
      });
    });

    grid.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', () => rects.length && measure(), { passive: true });
  });
}

/*
 * Shop by range index: the row under the pointer, or with keyboard focus, becomes active
 * and its photograph fills the stage. Rows stay plain links; clicking navigates.
 */
function setupRangeIndex(root = document) {
  root.querySelectorAll('[data-px-range-index]').forEach((section) => {
    if (section.dataset.pxReady) return;
    section.dataset.pxReady = 'true';
    const items = [...section.querySelectorAll('.px-ri__item')];
    const activate = (item) => {
      if (!item || item.classList.contains('is-active')) return;
      items.forEach((other) => other.classList.toggle('is-active', other === item));
    };
    items.forEach((item) => {
      item.addEventListener('pointerenter', (event) => {
        if (event.pointerType === 'mouse') activate(item);
      });
      item.addEventListener('focusin', () => activate(item));
    });
  });
}

setupLean();
setupRangeIndex();
document.addEventListener('shopify:section:load', (event) => {
  setupLean(event.target);
  setupRangeIndex(event.target);
});
