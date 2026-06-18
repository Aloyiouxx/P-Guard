/* ============================================================
   js/router.js
   Handles page navigation: shows/hides the correct .page
   section and keeps the active nav-item state in sync across
   the desktop sidebar and mobile sidebar.
   Depends on: ui.js (closeNav) — but works fine even if that
   hasn't loaded yet, since navigateTo is only ever called from
   a click, not at script-load time.
   ============================================================ */

const PAGES = [
  'analyzer', 'dashboard', 'threatfeed', 'urlanalyzer',
  'attachment', 'header', 'history', 'analytics', 'settings'
];

/**
 * Switches the visible page and updates nav active states.
 * Called via inline onclick="navigateTo('pagename')" from both
 * the desktop sidebar links and the mobile sidebar links.
 */
function navigateTo(page) {
  if (!PAGES.includes(page)) {
    console.warn(`navigateTo: unknown page "${page}"`);
    return;
  }

  // Show the target page, hide every other one
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.style.display = (p === page) ? '' : 'none';
  });

  // Sync the "active" class across every nav-item in BOTH
  // the desktop sidebar and the mobile sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Reset scroll position so the new page opens at the top
  const main = document.getElementById('mainContent');
  if (main) main.scrollTop = 0;
  window.scrollTo(0, 0);

  // Safety net: always close the mobile drawer after navigating,
  // even if the calling link forgot to do it itself
  if (typeof closeNav === 'function') closeNav();
}

// Explicitly attach to window. Inline onclick="" attributes can
// only resolve functions that exist in global scope, so this
// line is what actually makes every nav link work.
window.navigateTo = navigateTo;
