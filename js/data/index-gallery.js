// 画廊组件（IIFE 封装，不污染全局作用域）
(function () {
  'use strict';

  var videoGalleries = [
    {
      title: "超高脂的赛博相声和其他",
      subtitle: "远超圈层的质量和最完美的细节<br>BY 灰鸢Gledery",
      videos: [
        { href: "https://www.bilibili.com/video/BV1gscSzVE3C", cover: "img/video-cover/89115e275e405e278b50a660023228ad60d2cd04.jpg@672w_378h_1c.avif", title: "十七岁的最后四个月，他把自己变成了一次“主办方”......" },
        { href: "https://www.bilibili.com/video/BV1s8m7BkEGV", cover: "img/video-cover/a51a7ca6d597fd2085848ef0d3d9e2e804c54dc2.jpg@672w_378h_1c.avif", title: "我提前用上了五年后的哔哩哔哩网页端？！" },
        { href: "https://www.bilibili.com/video/BV18P2qBMEUD", cover: "img/video-cover/9c0c41bfcff3d00a25394b06b43096afe3b1c7ac.jpg@672w_378h_1c.avif", title: "良心的神！我找到了最完美的音乐软件，但是......" },
        { href: "https://www.bilibili.com/video/BV1e7CbB1ETg/", cover: "img/video-cover/0a79d4a5e6c27fb8f23ab41528af0e15f835ec4b.jpg@672w_378h_1c.avif", title: "我发现了一群只在双十一出现的人？！" },
        { href: "https://www.bilibili.com/video/BV1dKWgzaETZ", cover: "img/video-cover/facbf915f1ecff6728b39b561e4eca9ebd01077c.jpg@672w_378h_1c.avif", title: "教程说了，装机要用力！！！" },
        { href: "https://www.bilibili.com/video/BV1HTsizDEk4/", cover: "img/video-cover/bbc6331706407bb7c5ede01dec82d4d16c1937a1.jpg@672w_378h_1c.avif", title: "感谢Windows 10，重新教会了我们做人！！！" },
        { href: "https://www.bilibili.com/video/BV1ZrEpztE2v/", cover: "img/video-cover/ea2eb17c3b77e9166e5a7ed792ceed16d89bfaa7.jpg@672w_378h_1c.avif", title: "花了109小时来学会停止折磨自己——我的音乐创作实录" }
      ]
    },
    {
      title: "野史",
      subtitle: "Holy shit: [短语] 神圣的史<br>BY 小白狼LDC",
      videos: [
        { href: "https://www.bilibili.com/video/BV19uFUz6EW8/", cover: "img/video-cover/afe7bdbdbbc00dcba05467040bcb3cf73ec034da.jpg@672w_378h_1c.avif", title: "《火星好像还没被殖民》" },
        { href: "https://www.bilibili.com/video/BV1gwF6z5E8x/", cover: "img/video-cover/41902e18daced9c42ae4d8317bf81c2af6436655.jpg@672w_378h_1c.avif", title: "《 您 的 骑 士 正 在 取 餐 》" },
        { href: "https://www.bilibili.com/video/BV1SWCLBPEkn/", cover: "img/video-cover/5dbcbdc3b9e7fc3fd022d1df9d8a2b74e1a47434.jpg@672w_378h_1c.avif", title: "\"快看！我发现了古人的浏览记录\"" },
        { href: "https://www.bilibili.com/video/BV1evWpzcEMF/", cover: "img/video-cover/bd359b2437cc81c84b6095badb1ff8c96858109f.jpg@672w_378h_1c.avif", title: "村民说这里的羊不多……" },
        { href: "https://www.bilibili.com/video/BV1WRxGzsEEk/", cover: "img/video-cover/7ae03ddd3f2b35a06966cd15db021217c22b74e0.jpg@672w_378h_1c.avif", title: "最近奇特的动物好像有点多…" },
        { href: "https://www.bilibili.com/video/BV1S9A3ejEee/", cover: "img/video-cover/70107ead4b44c3b33be8df256238d6b3b5afd89f.jpg@672w_378h_1c.avif", title: "这是一个正经的过年纪实短片" },
        { href: "https://www.bilibili.com/video/BV1yxmqYqEBM/", cover: "img/video-cover/6ecb8d576770fedbeccc7fb0ddc2128494105e0e.jpg@672w_378h_1c.avif", title: "我见到了天下第一奇洞!【贵州 第四期】" },
        { href: "https://www.bilibili.com/video/BV1cKvye3E7w/", cover: "img/video-cover/a445709c2d96bd5463dc55143c4b773fb4aefb69.jpg@672w_378h_1c.avif", title: "如何辨别伪人？不要放过任何一个细节！" }
      ]
    },
    {
      title: "整活向的TABS",
      subtitle: "用独特的方式打开熟悉的TABS<br>BY 小白狼LDC",
      videos: [
        { href: "https://www.bilibili.com/video/BV1wqHnzNERE/", cover: "img/video-cover/d8750d2cb19a101a11593732c41b9314714c758f.jpg@672w_378h_1c.avif", title: "看！这是我给顾客画的画像！" },
        { href: "https://www.bilibili.com/video/BV17XpQzEE31/", cover: "img/video-cover/3d0e2544b2710eda30a6ddf128d496029b3d723f.jpg@672w_378h_1c.avif", title: "《维京游轮》" },
        { href: "https://www.bilibili.com/video/BV1c4h4zBEFB/", cover: "img/video-cover/548fa4a8f2e50f86fa755e16c1a73f112a9a1948.jpg@672w_378h_1c.avif", title: "让我想想" },
        { href: "https://www.bilibili.com/video/BV1w4bUzcEXe/", cover: "img/video-cover/e68f7a12ebe002d7b8e5e625bc056bfcc8b7afde.jpg@672w_378h_1c.avif", title: "没 人 比 我 更 快" },
        { href: "https://www.bilibili.com/video/BV1RQgqzBEi1/", cover: "img/video-cover/1724ff1d65453159304e561963caf6cfa46b7914.jpg@672w_378h_1c.avif", title: "《做梦都没想明白》" }
      ]
    },
    {
      title: "我和赤鸢做邻居",
      subtitle: "全站唯一机位，英国牛津郡进口视频<br>BY 灰鸢Gledery",
      videos: [
        { href: "https://www.bilibili.com/video/BV1v5CbBmEhJ/", cover: "img/video-cover/1747124d40a815ede37a312490fde4f7ee3d7328.jpg@672w_378h_1c.avif", title: "人中嘉豪，鸟中赤鸢【宏 伟的精彩集锦】" },
        { href: "https://www.bilibili.com/video/BV15sn1zxEXM/", cover: "img/video-cover/505ff8209cfc4d73a1826cf5118f5b32193783fe.jpg@672w_378h_1c.avif", title: "赤鸢：我的脑袋不见啦TwT【可爱的精彩集锦】" },
        { href: "https://www.bilibili.com/video/BV1dRKUzhEc4/", cover: "img/video-cover/df2bb793cdd43e34a782f299f92ee9e84bf68dc6.jpg@672w_378h_1c.avif", title: "【赤鸢】全站最高画质！半小时没乱动让我拍！" },
        { href: "https://www.bilibili.com/video/BV15dTCzJEAxk", cover: "img/video-cover/15bb82d0998d14e3a2155ad86843ecaab7672f79.jpg@672w_378h_1c.avif", title: "全鸟圈第一次拍到赤鸢自杀式抢劫！" },
        { href: "https://www.bilibili.com/video/BV15VrLYyEnp/", cover: "img/video-cover/d68c920a7e3fae9c2ecd64139f29f1bcc242b335.jpg@672w_378h_1c.avif", title: "挑战整个鸟圈最逆天的一次拍摄（UP已喜疯）" },
        { href: "https://www.bilibili.com/video/BV1JKSAYgEk8/", cover: "img/video-cover/0120e9e448a73821cb30e0e5cd0c3b68de091eb2.jpg@672w_378h_1c.avif", title: "一棵树上40只鸟，一半都是猛禽！不夸张！" }
      ]
    }
  ];

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function createGalleryHTML(gallery) {
    var videoCards = gallery.videos.map(function (video) {
      return '<div class="video-card">' +
        '<a href="' + escapeHTML(video.href) + '" target="_blank" rel="noopener">' +
        '<img class="video-cover" src="' + escapeHTML(video.cover) + '" alt="' + escapeHTML(video.title) + '" loading="lazy" width="320" height="189" />' +
        '</a>' +
        '<div class="video-info">' +
        '<div class="video-title">' + escapeHTML(video.title) + '</div>' +
        '</div>' +
        '</div>';
    }).join('');

    return '<div class="gallery-title">' + escapeHTML(gallery.title) + '</div>' +
      '<div class="video-title" style="text-align: center;">' + gallery.subtitle + '</div>' +
      '<div class="horizontal-gallery">' +
      '<div class="scroll-container">' +
      '<div class="scroll-wrapper">' + videoCards + '</div>' +
      '</div>' +
      '</div>';
  }

  function initScrollInteraction() {
    document.querySelectorAll('.horizontal-gallery').forEach(function (gallery) {
      var scrollContainer = gallery.querySelector('.scroll-container');
      if (!scrollContainer) return;

      var isDown = false, startX, scrollLeft;

      // 鼠标拖拽：用 Pointer Events 替代 Mouse Events，仅响应鼠标指针，
      // 避免移动端触屏产生的模拟鼠标事件干扰原生滚动
      scrollContainer.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse') return;
        isDown = true;
        scrollContainer.style.cursor = 'grabbing';
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;
        scrollContainer.setPointerCapture(e.pointerId);
      });

      scrollContainer.addEventListener('pointerup', function () {
        if (!isDown) return;
        isDown = false;
        scrollContainer.style.cursor = 'grab';
      });

      scrollContainer.addEventListener('pointercancel', function () {
        isDown = false;
        scrollContainer.style.cursor = 'grab';
      });

      scrollContainer.addEventListener('pointermove', function (e) {
        if (!isDown) return;
        e.preventDefault();
        var x = e.pageX - scrollContainer.offsetLeft;
        scrollContainer.scrollLeft = scrollLeft - (x - startX);
      });

      gallery.addEventListener('wheel', function (e) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY * 4;
      }, { passive: false });

      // 移动端触屏滚动完全交给浏览器原生处理（overflow-x: auto + -webkit-overflow-scrolling: touch）。

      scrollContainer.style.cursor = 'grab';
    });
  }

  function renderGalleries() {
    var container = document.getElementById('galleries-container');
    if (container) {
      container.innerHTML = videoGalleries.map(createGalleryHTML).join('');
      initScrollInteraction();
    }
  }

  document.addEventListener('DOMContentLoaded', renderGalleries);
})();
