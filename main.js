/* ============================================================
   js/main.js
   Entry point — runs after all other scripts are loaded.
   Binds global keyboard shortcuts and any one-time init.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Ctrl+Enter / Cmd+Enter triggers analyze from anywhere
  document.getElementById('emailInput').addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      analyze();
    }
  });

  // Escape closes mobile nav
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeNav();
  });

});
