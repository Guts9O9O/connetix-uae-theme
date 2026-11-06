/**
 * CONNETIX "snap-to-cart": when cart lines change, the header cart icon gives a short
 * magnetic "snap" (scale overshoot). Horizon's own fly-to-cart animation carries the
 * product image to the icon; px-base.css restyles it as a tumbling tile.
 * Respects prefers-reduced-motion (the CSS animation is disabled there).
 */
import { StandardEvents } from '@shopify/events';

const SNAP_CLASS = 'px-snap';

function snapCartIcon() {
  const icon = document.querySelector('.header-actions__cart-icon');
  if (!icon) return;
  icon.classList.remove(SNAP_CLASS);
  // Restart the animation on repeated adds
  void icon.offsetWidth;
  icon.classList.add(SNAP_CLASS);
  icon.addEventListener('animationend', () => icon.classList.remove(SNAP_CLASS), { once: true });
}

document.addEventListener(StandardEvents.cartLinesUpdate, () => {
  // Let the fly-to-cart element arrive first (~600ms)
  window.setTimeout(snapCartIcon, 560);
});
