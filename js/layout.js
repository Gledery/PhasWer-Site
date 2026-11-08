// 通用布局注入：wallpaper 层 + 子页面标准 dock
(function () {
  'use strict';

  // 注入 wallpaper 层（同步执行，确保在页面内容之前）
  if (!document.querySelector('.wallpaper-layer')) {
    document.body.insertAdjacentHTML('afterbegin',
      '<div class="wallpaper-layer" role="presentation" aria-hidden="true">' +
      '<div class="blob blob-1"></div>' +
      '<div class="blob blob-2"></div>' +
      '</div>'
    );
  }

  // DOM 加载后注入标准 dock（仅子页面，index.html 有自定义 dock）
  document.addEventListener('DOMContentLoaded', function () {
    if (!document.querySelector('.dock')) {
      document.body.insertAdjacentHTML('beforeend',
        '<nav class="dock" role="navigation" aria-label="快捷导航">' +
        '<div class="dock-item">' +
        '<button onclick="scrollToTop()" aria-label="回到顶部"><img src="img/dock-icon/chevron_line_up_64dp.svg" alt="回到顶部"></button>' +
        '<span class="dock-tooltip">回到顶部</span>' +
        '</div>' +
        '<div class="dock-item">' +
        '<button onclick="window.location.href=\'index.html\'" aria-label="返回主页"><img src="img/dock-icon/close_64dp.svg" alt="关闭"></button>' +
        '<span class="dock-tooltip">关闭</span>' +
        '</div>' +
        '</nav>'
      );
    }
  });
})();
