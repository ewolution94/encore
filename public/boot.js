// Applies the saved theme before first paint so there's no flash of the wrong one, and pins
// theme-color to it, which colours an installed app's status bar. Mirrors
// src/lib/theme.svelte.ts; keep the two in step.
try {
  var theme = localStorage.getItem('encore:theme');
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.dataset.theme = theme;
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) metas[i].content = theme === 'light' ? '#ffffff' : '#0f0f12';
  }
} catch (e) {}

