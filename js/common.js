// 通用脚本（IIFE 封装，仅暴露 scrollToTop）
(function () {
  'use strict';

  var currentScrollAnimation = null;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // 平滑滚动到顶部（需暴露给 onclick）
  function scrollToTop() {
    if (currentScrollAnimation) {
      cancelAnimationFrame(currentScrollAnimation);
    }
    var startPosition = window.pageYOffset;
    var distance = -startPosition;
    var duration = Math.min(1000, Math.max(500, Math.abs(distance) * 0.5));
    var startTime = null;

    function animate(currentTime) {
      if (startTime === null) startTime = currentTime;
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeInOutCubic(progress);
      window.scrollTo(0, startPosition + distance * eased);

      if (progress < 1) {
        currentScrollAnimation = requestAnimationFrame(animate);
      } else {
        currentScrollAnimation = null;
      }
    }

    currentScrollAnimation = requestAnimationFrame(animate);
  }
  window.scrollToTop = scrollToTop;

  // 入场动画已改为纯 CSS @starting-style（见 core.css / design.css），无需 JS 注入或 setTimeout。
  // 仅保留卡片滚动揭示（IntersectionObserver）。

  // 滚动卡片触发动画
  // 优先使用 IntersectionObserver：能自动响应滚动、resize、布局变化与动态内容，
  // 解决部分设备 scroll 事件触发不稳、字体/图片延迟加载造成布局偏移后漏触发的问题。
  function initScrollAnimations() {
    var cards = document.querySelectorAll('.card:not(.animate-in)');
    if (cards.length === 0) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, {
        // 与原先 95% 视口阈值行为保持一致：卡片顶端进入视口底部 5% 区域时触发
        rootMargin: '0px 0px -5% 0px',
        threshold: 0
      });
      cards.forEach(function (card) { observer.observe(card); });
      return;
    }

    // 回退方案：scroll + resize 监听（兼容无 IntersectionObserver 的老旧内核）
    var pendingCards = Array.from(cards);
    var raf = null;

    function checkCards() {
      var triggerPos = window.innerHeight * 0.95;
      for (var i = pendingCards.length - 1; i >= 0; i--) {
        if (pendingCards[i].getBoundingClientRect().top < triggerPos) {
          pendingCards[i].classList.add('animate-in');
          pendingCards.splice(i, 1);
        }
      }
      if (pendingCards.length === 0) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
      }
    }

    function onScroll() {
      if (!raf) {
        raf = requestAnimationFrame(function () { checkCards(); raf = null; });
      }
    }

    // 移动端地址栏伸缩、横竖屏切换会改变视口高度，需要重新检测
    var resizeTimer = null;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { raf = null; checkCards(); }, 150);
    }

    checkCards();
    if (pendingCards.length > 0) {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize, { passive: true });
    }
  }

  // 页面 DOM 加载完成后初始化卡片滚动揭示
  document.addEventListener('DOMContentLoaded', function () {
    initScrollAnimations();
  });

  // ============ 光斑动画 ============

  var BLOB_INITIAL = { blob1: { x: 48, y: 28 }, blob2: { x: 52, y: 32 }, blob3: { x: 45, y: 25 }, blob4: { x: 55, y: 30 } };
  var BLOB_TARGET = { blob1: { x: 10, y: 10 }, blob2: { x: 90, y: 90 }, blob3: { x: 15, y: 85 }, blob4: { x: 85, y: 25 } };
  var BLOB_NAMES = ['blob1', 'blob2', 'blob3', 'blob4'];

  function applyBlobPositions(layer, positions, scale) {
    BLOB_NAMES.forEach(function (name) {
      layer.style.setProperty('--' + name + '-x', positions[name].x + '%');
      layer.style.setProperty('--' + name + '-y', positions[name].y + '%');
    });
    layer.style.setProperty('--blob-scale', scale);
  }

  function lerpBlobPositions(progress) {
    var result = {};
    BLOB_NAMES.forEach(function (name) {
      result[name] = {
        x: BLOB_INITIAL[name].x + (BLOB_TARGET[name].x - BLOB_INITIAL[name].x) * progress,
        y: BLOB_INITIAL[name].y + (BLOB_TARGET[name].y - BLOB_INITIAL[name].y) * progress
      };
    });
    return result;
  }

  function initBlobAnimation() {
    var wallpaperLayer = document.querySelector('.wallpaper-layer');
    if (!wallpaperLayer) return;

    if (document.querySelector('.hero-logo')) {
      initBlobParallaxAnimation(wallpaperLayer);
    } else {
      initBlobScatterAnimation(wallpaperLayer);
    }
  }

  function initBlobParallaxAnimation(layer) {
    var heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    var ticking = false;

    function updateBlobs() {
      var progress = Math.min(window.scrollY / (heroSection.offsetHeight + 500), 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      applyBlobPositions(layer, lerpBlobPositions(eased), 0.7 + 0.3 * eased);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(updateBlobs);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateBlobs);
    updateBlobs();
  }

  function initBlobScatterAnimation(layer) {
    var duration = 1000;
    var startTime = null;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = easeInOutCubic(progress);
      applyBlobPositions(layer, lerpBlobPositions(eased), 0.85 + 0.15 * eased);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('load', initBlobAnimation);

  // ============ 角落颜文字组件（原 corner-kaomoji.js，内联以减少请求） ============
  (function() {
  var defaultFace = '(・ω・)';

  var facesEarly = [
    '(・ω・)', '(≧▽≦)', '(ノ´▽`)ノ♪', '(￣▽￣)~*',
    '(・∀・)', '(ﾟ∀ﾟ)', '(*´▽`*)', '(*´∇`*)',
    '(≧∇≦)b', '(・ω・)ノ', '(o´ω`o)ﾉ', '(。・▽・。)'
  ];
  var facesMid = [
    '(。・ω・。)', '(´・ω・`)', '(｀・ω・´)', '(〃￣︶￣)人(￣︶￣〃)',
    '(─▽─)', '(´-ω-`)', '(￣ω￣)'
  ];
  var facesLate = [
    '(Ｔ▽Ｔ)', '(つд⊂)', '(。_。)', '(・_・)',
    '(　´_ゝ`)', '( ˘ω˘ )', '(－ω－)'
  ];

  var messagesEarly = [
    '你在看我吗？',
    '你发现我了！',
    '你点到我了，恭喜',
    '我在这待好久了...',
    '据说认真看网页的人才会发现我',
    '今天也要加油啊awa',
    '要不要去喝杯水',
    '快去三连吧',
    '你能陪我一下吗',
    '今天天气怎么样',
    '你是不是在摸鱼',
    '我偷偷观察你很久了',
    '你是怎么发现我的',
    '我好像被你点醒了',
    '嘿嘿，被你抓到了~',
    '(*/ω\\*) 别...别一直盯着我看啦...',
    '你好呀~今天过得怎么样？',
    '你每点我一下，我就开心一点',
    '偷偷告诉你，其实我很期待你来的',
    '鸢说让我好好看着这个网站...',
    '我在努力当一只合格的Kaomoji！',
    '你的鼠标好好玩，我能碰一下吗',
  ];
  var messagesMid = [
    '别点了别点了...',
    '我只是一个无辜的颜文字',
    '其实我才是鸢（bushi',
    '你是不是闲得慌',
    '你的鼠标还好吗',
    '我要被你点坏了',
    '(´;ω;`) 头好晕...你点太快了',
    '我也有脾气的！'
  ];
  var messagesLate = [
    '再点一下试试',
    '嗯...没有了，真的没有了',
    '已经没有更多彩蛋了啊喂...？',
    '好吧，你赢了',
    '...（沉默）',
    '我已经...什么都不想说了 (´;ω;`)',
  ];

  var idleMessages = [
    '......zzZ', '好无聊啊......', '有人在吗？',
    '（打了个哈欠）', '溜了溜了', '（发呆中）',
    '要不要聊聊天', '（看风景）', '芜湖~♪',
    '（开始数天花板上的格子）',
    '有没有人呀...',
    '趁没人注意偷偷蹦一下',
    '（暗中观察）',
    '嘿嘿嘿...没人在看吧？',
    '（开始原地转圈圈）',
    '无聊到想翻个跟头',
    '（试图逃跑）',
    '我要偷偷溜去隔壁网页看看',
    '（假装自己是一朵蘑菇）',
  ];
  var idleFaces = [
    '(－ω－) zzZ', '(´-ω-`)', '(。_。)', '(￣ω￣)',
    '(・_・)', '(　´_ゝ`)', '(´・ω・`)', '( ˘ω˘ )'
  ];

  function onNaughtyDone() {
    if (isIdle) startIdleWiggle();
  }

  var naughtyActions = [
    function() {
      var g = generation;
      el.style.transition = 'left 0.6s ease';
      el.style.left = 'calc(100vw - 100px)';
      faceEl.textContent = '(＞ω＜)';
      showBubble('嘿嘿，我跑到这边来了~', 3000);
      setTimeout(function() {
        if (generation !== g) return;
        el.style.left = '';
        setTimeout(function() {
          if (generation !== g) return;
          el.style.transition = '';
          faceEl.textContent = pickUnique(idleFaces, faceEl.textContent);
          onNaughtyDone();
        }, 700);
      }, 3000);
    },
    function() {
      var g = generation;
      el.style.transition = 'bottom 0.5s ease';
      el.style.bottom = '-80px';
      showBubble('我溜了......', 1500);
      setTimeout(function() {
        if (generation !== g) return;
        hideBubble();
        setTimeout(function() {
          if (generation !== g) return;
          el.style.bottom = '';
          faceEl.textContent = '(ﾟ∀ﾟ)';
          showBubble('我回来了！想我了吗', 2500);
          setTimeout(function() {
            if (generation !== g) return;
            el.style.transition = '';
            faceEl.textContent = pickUnique(idleFaces, faceEl.textContent);
            onNaughtyDone();
          }, 2800);
        }, 2000);
      }, 2000);
    },
    function() {
      var g = generation;
      faceEl.style.transform = 'scaleX(-1)';
      faceEl.textContent = '(・ω・)';
      showBubble('我反过来了......好玩', 3000);
      setTimeout(function() {
        if (generation !== g) return;
        faceEl.style.transform = '';
        onNaughtyDone();
      }, 3000);
    },
    function() {
      var g = generation;
      el.style.transition = 'left 0.8s ease';
      el.style.left = '50%';
      el.style.transform = 'translateX(-50%)';
      faceEl.textContent = '(ノ´▽`)ノ♪';
      showBubble('我来视察一下中间地带', 3000);
      setTimeout(function() {
        if (generation !== g) return;
        el.style.left = '';
        el.style.transform = '';
        setTimeout(function() {
          if (generation !== g) return;
          el.style.transition = '';
          faceEl.textContent = pickUnique(idleFaces, faceEl.textContent);
          onNaughtyDone();
        }, 900);
      }, 3500);
    },
    function() {
      var g = generation;
      var spinFaces = ['(・ω・)', '(・∀・)', '(ﾟ∀ﾟ)', '(≧▽≦)', '(Ｔ▽Ｔ)'];
      var i = 0;
      faceEl.textContent = spinFaces[0];
      showBubble('转转转......', 2000);
      var spinTimer = setInterval(function() {
        if (generation !== g) { clearInterval(spinTimer); return; }
        i++;
        if (i >= spinFaces.length) {
          clearInterval(spinTimer);
          faceEl.textContent = pickUnique(idleFaces, faceEl.textContent);
          onNaughtyDone();
          return;
        }
        faceEl.textContent = spinFaces[i];
      }, 300);
    }
  ];

  var wakeFace = '(ﾟ∀ﾟ)';
  var wakeMessages = [
    '来啦来啦！', '啊！你回来了！', '嗯？什么事？',
    '我醒了！', '嗷！别吓我...', '你终于来了！'
  ];

  var pageWelcome = {
    '欢迎参观 PhasWer 的小站~': [
      '欢迎参观 PhasWer 的小站~',
    ],
    '更新日志 | PhasWer 的小站': [
      '欢迎来到最官里官气的页面。。',
      '这里记录着鸢的肝细胞牺牲史'
    ],
    '提词器 | PhasWer 的小站': [
      '提词器在此，请开始你的表演'
    ],
    '图片处理工具 | PhasWer 的小站': [
      '来修图片啦~',
    ],
    '批量水印工具 | PhasWer 的小站': [
      '来打水印啦~'
    ],
    '图片压缩工具 | PhasWer 的小站': [
      '来压缩图片啦~',
      '图大了？交给我！'
    ],
    '数据加密工具 | PhasWer 的小站': [
      '来加密数据啦~',
      '安全第一！'
    ],
    '数据看板 | PhasWer 的小站': [
      '来看看数据吧~',
      '数据不会说谎！'
    ],
    'Upers.io | PhasWer 的小站': [
      '欢迎来到 Upers.io'
    ],
    '设计语言 | PhasWer 的小站': [
      '来研究设计语言了？有品位'
    ],
    '历史年表 | PhasWer 的小站': [
      '欢迎来到历史博物馆（bushi'
    ],
    '404 | PhasWer 的小站': [
      '迷路了？喝杯水吧~',
      '这里什么都没有...',
    ]
  };

  var el = document.createElement('div');
  el.className = 'corner-kaomoji';
  el.setAttribute('aria-label', '点我玩');
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.innerHTML = '<span class="face">' + defaultFace + '</span><span class="bubble"></span>';
  document.body.appendChild(el);

  var faceEl = el.querySelector('.face');
  var bubbleEl = el.querySelector('.bubble');

  var clickCount = 0;
  var lastFace = '';
  var lastMessage = '';
  var bubbleTimer = null;
  var idleResetTimer = null;
  var idleActionTimer = null;
  var idleWiggleTimer = null;
  var isIdle = false;
  var wasIdle = false;
  var popTimeout = null;
  var hasWelcomed = false;
  var generation = 0;

  function pickUnique(arr, last) {
    if (arr.length <= 1) return arr[0];
    var choice;
    var attempts = 0;
    do {
      choice = arr[Math.floor(Math.random() * arr.length)];
      attempts++;
    } while (choice === last && attempts < 10);
    return choice;
  }

  function getStagePool(arrEarly, arrMid, arrLate, stage) {
    if (stage >= 2) return arrLate;
    if (stage >= 1) return arrMid;
    return arrEarly;
  }

  function showBubble(text, duration) {
    clearTimeout(bubbleTimer);
    bubbleEl.textContent = text;
    bubbleEl.classList.add('show');
    bubbleTimer = setTimeout(hideBubble, duration || 2500);
  }

  function hideBubble() {
    clearTimeout(bubbleTimer);
    bubbleEl.classList.remove('show');
  }

  function pop() {
    clearTimeout(popTimeout);
    faceEl.style.transform = 'scale(1.2)';
    popTimeout = setTimeout(function() {
      faceEl.style.transform = '';
    }, 150);
  }

  function startIdleWiggle() {
    stopIdleWiggle();
    var transforms = ['rotate(-4deg)', 'rotate(4deg)', 'translateY(3px)', 'translateX(-3px)', 'translateX(3px)'];
    function step() {
      if (!isIdle) return;
      faceEl.style.transform = transforms[Math.floor(Math.random() * transforms.length)];
      idleWiggleTimer = setTimeout(function() {
        if (!isIdle) return;
        faceEl.style.transform = '';
        idleWiggleTimer = setTimeout(step, 800 + Math.random() * 1200);
      }, 600 + Math.random() * 800);
    }
    idleWiggleTimer = setTimeout(step, 500);
  }

  function stopIdleWiggle() {
    clearTimeout(idleWiggleTimer);
    faceEl.style.transform = '';
  }

  function resetPosition() {
    el.style.transition = '';
    el.style.left = '';
    el.style.bottom = '';
    el.style.transform = '';
    faceEl.style.transform = '';
  }

  function clearAllTimers() {
    generation++;
    clearTimeout(idleResetTimer);
    clearTimeout(idleActionTimer);
    clearTimeout(bubbleTimer);
    clearTimeout(popTimeout);
    stopIdleWiggle();
    resetPosition();
  }

  function resetToDefault() {
    isIdle = false;
    wasIdle = false;
    clickCount = 0;
    generation++;
    stopIdleWiggle();
    resetPosition();
    faceEl.textContent = defaultFace;
    hideBubble();
    scheduleIdleAction(10000);
  }

  function scheduleIdleReset() {
    clearTimeout(idleResetTimer);
    idleResetTimer = setTimeout(resetToDefault, 4000);
  }

  function scheduleIdleAction(delay) {
    clearTimeout(idleActionTimer);
    idleActionTimer = setTimeout(doIdleAction, delay || 10000);
  }

  function doIdleAction() {
    if (isIdle) {
      var r = Math.random();
      if (r < 0.35) {
        lastFace = pickUnique(idleFaces, lastFace);
        faceEl.textContent = lastFace;
        lastMessage = pickUnique(idleMessages, lastMessage);
        showBubble(lastMessage, 3000);
      } else if (r < 0.5) {
        stopIdleWiggle();
        naughtyActions[Math.floor(Math.random() * naughtyActions.length)]();
      } else {
        lastFace = pickUnique(idleFaces, lastFace);
        faceEl.textContent = lastFace;
      }
      scheduleIdleAction(8000 + Math.random() * 10000);
      return;
    }

    isIdle = true;
    wasIdle = true;
    stopIdleWiggle();

    lastFace = pickUnique(idleFaces, lastFace);
    faceEl.textContent = lastFace;
    lastMessage = pickUnique(idleMessages, lastMessage);
    showBubble(lastMessage, 3500);
    startIdleWiggle();

    scheduleIdleAction(6000 + Math.random() * 8000);
  }

  function doWelcome() {
    if (hasWelcomed) return;
    hasWelcomed = true;

    var title = document.title || '';
    var pool = pageWelcome[title];
    var msg;
    if (pool) {
      msg = pool[Math.floor(Math.random() * pool.length)];
    } else {
      msg = '你来啦~';
    }

    faceEl.textContent = '(・ω・)ノ';
    showBubble(msg, 3500);

    setTimeout(function() {
      if (clickCount === 0 && !isIdle) {
        faceEl.textContent = defaultFace;
        hideBubble();
      }
    }, 4000);
  }

  el.addEventListener('click', function() {
    clearAllTimers();

    if (wasIdle) {
      isIdle = false;
      wasIdle = false;
      clickCount++;
      faceEl.textContent = wakeFace;
      var wakeMsg = pickUnique(wakeMessages, lastMessage);
      pop();
      showBubble(wakeMsg);
      lastMessage = wakeMsg;
      lastFace = wakeFace;
      scheduleIdleReset();
      return;
    }

    isIdle = false;
    clickCount++;

    var stage = clickCount < 10 ? 0 : (clickCount < 24 ? 1 : 2);
    var facePool = getStagePool(facesEarly, facesMid, facesLate, stage);
    var msgPool = getStagePool(messagesEarly, messagesMid, messagesLate, stage);

    lastFace = pickUnique(facePool, lastFace);
    faceEl.textContent = lastFace;

    lastMessage = pickUnique(msgPool, lastMessage);

    pop();
    showBubble(lastMessage);
    scheduleIdleReset();
  });

  el.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });

  function init() {
    // 双 rAF 确保初始态（opacity:0 + translateX(-20px)）被浏览器渲染后再添加 .animate-in，
    // 否则浏览器会把两态合并成同一帧，过渡不触发，元素直接出现
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('animate-in');
        doWelcome();
        scheduleIdleAction(10000);
      });
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
  })();
})();
