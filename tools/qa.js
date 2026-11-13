(() => {
  const W = innerWidth;
  const vis = (e) => {
    const r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const cs = getComputedStyle(e);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0';
  };
  const clippedByAncestor = (e) => {
    let p = e.parentElement;
    while (p && p !== document.body) {
      const pc = getComputedStyle(p);
      if (pc.visibility === 'hidden' || pc.display === 'none') return true;
      if (/(hidden|auto|scroll|clip)/.test(pc.overflowX)) {
        const pr = p.getBoundingClientRect();
        if (pr.right <= W + 1 && pr.left >= -1) return true;
      }
      if (p.tagName === 'DIALOG' && !p.open) return true;
      if (p.tagName === 'DETAILS' && !p.open && p.firstElementChild !== e) return true;
      p = p.parentElement;
    }
    return false;
  };
  const over = [];
  document.querySelectorAll('body *').forEach((e) => {
    if (!vis(e)) return;
    const cs = getComputedStyle(e);
    if (cs.position === 'fixed') return;
    const r = e.getBoundingClientRect();
    if ((r.right > W + 1 || r.left < -1) && !clippedByAncestor(e)) {
      over.push(`${e.tagName}.${String(e.className).trim().split(/\s+/).slice(0, 2).join('.')} [${Math.round(r.left)},${Math.round(r.right)}]`);
    }
  });
  const broken = [...document.images]
    .filter((i) => i.complete && i.naturalWidth === 0 && i.getBoundingClientRect().width > 0)
    .map((i) => (i.currentSrc || i.src).slice(-60));
  const small = [...document.querySelectorAll('main *, footer *, header *')]
    .filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 2) && parseFloat(getComputedStyle(e).fontSize) < 11.5)
    .slice(0, 6)
    .map((e) => `${e.tagName}:${e.textContent.trim().slice(0, 28)}:${getComputedStyle(e).fontSize}`);
  // overlapping interactive elements in the header
  const hdr = [...document.querySelectorAll('header a, header button, header .px-logo-tag')].filter(vis).map((e) => [e, e.getBoundingClientRect()]);
  const overlaps = [];
  for (let i = 0; i < hdr.length; i++) for (let j = i + 1; j < hdr.length; j++) {
    const [a, ra] = hdr[i], [b, rb] = hdr[j];
    if (a.contains(b) || b.contains(a)) continue;
    const ix = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
    const iy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
    if (ix > 2 && iy > 2) overlaps.push(`${(a.getAttribute('aria-label') || a.textContent.trim()).slice(0, 14)} x ${(b.getAttribute('aria-label') || b.textContent.trim()).slice(0, 14)}`);
  }
  const h1 = document.querySelectorAll('h1').length;
  return { url: location.pathname, W, docW: document.documentElement.scrollWidth, overflow: over.slice(0, 6), overflowCount: over.length, broken, small, overlaps: overlaps.slice(0, 5), h1, height: document.documentElement.scrollHeight };
})()
