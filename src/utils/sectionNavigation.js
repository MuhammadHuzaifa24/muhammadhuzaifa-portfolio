// Center short section content; give tall sections a clear landing below the header.
export function sectionScrollTop({ contentTop, contentHeight, viewportHeight, headerHeight, maxScroll }) {
  const available = Math.max(0, viewportHeight - headerHeight);
  const gap = Math.max(28, (available - contentHeight) / 2);
  return Math.max(0, Math.min(maxScroll, contentTop - headerHeight - gap));
}
function layoutTop(element) {
  let top = 0;
  for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
  return top;
}
export function scrollToSection(id, reduced = false) {
  const section = document.getElementById(id);
  if (!section) return;
  const heading = section.querySelector('.section-heading') || section;
  const contentTop = layoutTop(heading);
  const paddingBottom = Number.parseFloat(getComputedStyle(section).paddingBottom) || 0;
  const headerHeight = document.querySelector('.navbar')?.getBoundingClientRect().height || 0;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const top = id === 'home' || id === 'main' ? 0 : sectionScrollTop({ contentTop, contentHeight: layoutTop(section) + section.offsetHeight - paddingBottom - contentTop, viewportHeight: innerHeight, headerHeight, maxScroll });
  window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });
  section.setAttribute('tabindex', '-1');
  section.focus({ preventScroll: true });
  history.replaceState(null, '', `#${id}`);
}
