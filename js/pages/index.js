// Frame Raw 遮罩交互
(function() {
  var logo = document.getElementById('frame-raw-logo');
  var overlay = document.getElementById('frame-raw-overlay');
  var closeBtn = document.getElementById('overlay-close-btn');
  
  if (!logo || !overlay || !closeBtn) return;
  
  function openOverlay() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeOverlay() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  logo.addEventListener('click', openOverlay);
  closeBtn.addEventListener('click', closeOverlay);
  
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      closeOverlay();
    }
  });
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeOverlay();
    }
  });
})();

// 从 changelog 数据文件提取最新版本号
(function() {
  fetch('js/data/changelog-data.js').then(function(r) { return r.text(); }).then(function(text) {
    var m = text.match(/version:\s*'([\d.]+)'/);
    if (m) {
      var el = document.getElementById('site-version');
      if (el) el.textContent = 'v' + m[1];
    }
  }).catch(function() {});
})();

// 「关于此网页」折叠面板
(function() {
  document.querySelectorAll('[data-about-collapse]').forEach(function(panel) {
    var summary = panel.querySelector('.about-summary');
    if (!summary) return;

    function toggle() {
      var open = panel.classList.toggle('open');
      summary.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    summary.addEventListener('click', function(e) {
      // 点击箭头或文字都触发，阻止默认行为避免重复
      e.preventDefault();
      toggle();
    });

    // 键盘可访问：Enter / Space
    summary.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
})();