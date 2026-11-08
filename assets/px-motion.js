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
