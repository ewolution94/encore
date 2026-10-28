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

// The splash screen's switch (#splash, written into index.html by plans/splash-rollout/launch.mjs).
// Copy this block to the end of the app's pre-paint script (public/boot.js or its equivalent, a
// classic script in <head>: the CSP allows no inline script). TCGSL's public/boot.js is the original.
//
// The splash shows in the installed app only, or with ?splash for a look in a browser tab. It starts
// where the iOS launch image left the mark, plays once, then fades into the app once the first screen
// is in (the app dispatches `splash:ready`), and it never stays past 1.5 s: on a slow connection the
// app's skeletons take over. Once faded it leaves the DOM, which keeps it out of every view transition.
try {
  var standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone || /[?&]splash\b/.test(location.search)) {
    var root = document.documentElement;
    root.classList.add('splash');
    // The launch image centres the mark on the whole screen. Should the page start below the
    // status bar (with viewport-fit=cover it doesn't), lift the mark by half the bar.
    var lift = (screen.height - innerHeight) / 2;
    if (standalone && innerHeight > innerWidth && lift > 0 && lift < 60) root.style.setProperty('--splash-lift', lift + 'px');
    // Clinch keeps its own motion setting on <html data-motion> (set just before this runs).
    var still = matchMedia('(prefers-reduced-motion: reduce)').matches || root.dataset.motion === 'reduced';
    var played = still;
    var ready = false;
    var gone = false;
    var leave = function () {
      if (gone) return;
      gone = true;
      root.classList.add('splash-out');
      setTimeout(function () {
        var splash = document.getElementById('splash');
        if (splash) splash.remove();
        root.classList.remove('splash', 'splash-out');
      }, still ? 220 : 340);
    };
    document.addEventListener('animationend', function (e) {
      if (e.animationName !== 'splash-glint') return;
      played = true;
      if (ready) leave();
    });
    addEventListener('splash:ready', function () {
      ready = true;
      if (played) leave();
    });
    setTimeout(leave, 1500);
  } else {
    addEventListener('DOMContentLoaded', function () {
      var splash = document.getElementById('splash');
      if (splash) splash.remove();
    });
  }
} catch (e) {}
