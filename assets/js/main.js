(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- header: overlay → solid on scroll ---- */
  var header = document.querySelector('.site-header');
  function onScrollHeader() {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  if (header) { onScrollHeader(); window.addEventListener('scroll', onScrollHeader, { passive: true }); }

  /* ---- mobile menu ---- */
  var menu = document.getElementById('mmenu');
  var openBtn = document.getElementById('menuOpen');
  var closeBtn = document.getElementById('menuClose');
  if (menu && openBtn && closeBtn) {
    openBtn.addEventListener('click', function () { menu.classList.add('open'); closeBtn.focus(); });
    closeBtn.addEventListener('click', function () { menu.classList.remove('open'); openBtn.focus(); });
    menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') menu.classList.remove('open'); });
  }

  /* ---- thread: 선을 따라 (scroll-drawn, desktop only) ---- */
  var threadSvg = document.getElementById('thread');
  if (threadSvg && !reduced && window.matchMedia('(min-width: 1200px)').matches) {
    var path = threadSvg.querySelector('path');
    var len = 0;
    function sizeThread() {
      var h = document.documentElement.scrollHeight;
      threadSvg.setAttribute('height', h);
      threadSvg.style.height = h + 'px';
      len = path.getTotalLength();
      path.style.strokeDasharray = len;
      drawThread();
    }
    function drawThread() {
      var doc = document.documentElement;
      var progress = (window.scrollY + window.innerHeight * 0.85) / doc.scrollHeight;
      progress = Math.max(0, Math.min(1, progress));
      path.style.strokeDashoffset = len * (1 - progress);
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { drawThread(); ticking = false; }); }
    }, { passive: true });
    window.addEventListener('resize', sizeThread);
    if (document.readyState === 'complete') sizeThread();
    else window.addEventListener('load', sizeThread);
  }

  /* ---- carousels (두피 카드 등) ---- */
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.carousel');
    var dots = root.querySelectorAll('.dots i');
    var slides = track.children.length;
    var idx = 0, timer = null, paused = false;
    function go(i) {
      idx = (i + slides) % slides;
      track.scrollTo({ left: track.clientWidth * idx, behavior: reduced ? 'auto' : 'smooth' });
    }
    function sync() {
      var i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      if (i !== idx) idx = i;
      dots.forEach(function (d, k) { d.classList.toggle('active', k === idx); });
    }
    track.addEventListener('scroll', function () { requestAnimationFrame(sync); }, { passive: true });
    ['pointerdown', 'touchstart', 'mouseenter'].forEach(function (ev) {
      root.addEventListener(ev, function () { paused = true; }, { passive: true });
    });
    root.addEventListener('mouseleave', function () { paused = false; });
    if (!reduced) timer = setInterval(function () { if (!paused) go(idx + 1); }, 5500);
    sync();
  });

  /* ---- programs: category nav active state ---- */
  var catLinks = document.querySelectorAll('.cat-nav a');
  if (catLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    catLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          catLinks.forEach(function (a) { a.classList.remove('active'); });
          var a = map[en.target.id];
          if (a) { a.classList.add('active'); a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('.category[id]').forEach(function (s) { io.observe(s); });
  }

  /* ---- back to top ---- */
  var toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 1200);
    }, { passive: true });
    toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });
  }
})();
