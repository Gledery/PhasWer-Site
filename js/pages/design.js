// =========================================
// 设计语言页脚本
// —— 全局演示函数 + 导航 / 组件交互
// =========================================

// =========================================
// 第一部分：全局函数（挂载到 window，供 HTML onclick 直接调用）
// =========================================

var bgGradients = {
    1: 'linear-gradient(135deg, #D3E7FF 0%, #EAE2FF 100%)',
    2: 'linear-gradient(135deg, #e8f4ff 0%, #d7e4ff 50%, #e8fffe 100%)',
    3: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    4: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
};

// 缓动函数演示
window.playEasing = function (demo) {
    var ball = demo.querySelector('.easing-ball');
    var isAtStart = ball.style.transform === '' || ball.style.transform === 'translateX(0px)';

    if (isAtStart) {
        ball.style.transform = 'translateX(' + (demo.offsetWidth - 60) + 'px)';
    } else {
        ball.style.transform = 'translateX(0px)';
    }
};

// 背景层切换
window.showBgLayer = function (layer) {
    var items = document.querySelectorAll('.bg-layer-item');
    items.forEach(function (item) { item.classList.remove('active'); });

    var bgBase = document.getElementById('bgBase');
    var bgBlob1 = document.getElementById('bgBlob1');
    var bgBlob2 = document.getElementById('bgBlob2');
    var bgBlob3 = document.getElementById('bgBlob3');
    var bgBlob4 = document.getElementById('bgBlob4');
    var bgGlass = document.getElementById('bgGlass');
    var label = document.getElementById('bgDemoLabel');

    // Reset all visible
    bgBase.style.opacity = '1';
    bgBlob1.style.opacity = '1';
    bgBlob2.style.opacity = '1';
    bgBlob3.style.opacity = '1';
    bgBlob4.style.opacity = '1';
    bgGlass.style.opacity = '1';

    if (layer === 'all') {
        label.textContent = '完整效果';
        items[0].classList.add('active');
    } else if (layer === 'base') {
        bgBlob1.style.opacity = '0';
        bgBlob2.style.opacity = '0';
        bgBlob3.style.opacity = '0';
        bgBlob4.style.opacity = '0';
        bgGlass.style.opacity = '0';
        label.textContent = '渐变底色层';
        items[1].classList.add('active');
    } else if (layer === 'blob') {
        bgBase.style.opacity = '0';
        bgGlass.style.opacity = '0';
        label.textContent = '光斑层';
        items[2].classList.add('active');
    } else if (layer === 'glass') {
        bgBase.style.opacity = '0';
        bgBlob1.style.opacity = '0';
        bgBlob2.style.opacity = '0';
        bgBlob3.style.opacity = '0';
        bgBlob4.style.opacity = '0';
        label.textContent = '玻璃态层';
        items[3].classList.add('active');
    }
};

// 背景渐变切换
window.applyBgGradient = function (num) {
    var bgBase = document.getElementById('bgBase');
    bgBase.style.background = bgGradients[num];

    var items = document.querySelectorAll('.bg-layer-item');
    items.forEach(function (item) { item.classList.remove('active'); });
    items[0].classList.add('active');

    var bgBlob1 = document.getElementById('bgBlob1');
    var bgBlob2 = document.getElementById('bgBlob2');
    var bgBlob3 = document.getElementById('bgBlob3');
    var bgBlob4 = document.getElementById('bgBlob4');
    var bgGlass = document.getElementById('bgGlass');
    bgBlob1.style.opacity = '1';
    bgBlob2.style.opacity = '1';
    bgBlob3.style.opacity = '1';
    bgBlob4.style.opacity = '1';
    bgGlass.style.opacity = '1';

    var label = document.getElementById('bgDemoLabel');
    label.textContent = '方案 ' + num;
};

// 玻璃态演示更新
window.updateGlassDemo = function () {
    var opacity = document.getElementById('glassOpacity').value / 100;
    var blur = document.getElementById('glassBlur').value;
    var sat = document.getElementById('glassSat').value;
    var border = document.getElementById('glassBorder').value / 100;
    var activeBtn = document.querySelector('#glassShadowSelect .pw-seg-btn.active');
    var shadow = activeBtn ? activeBtn.getAttribute('data-value') : 'var(--shadow-lg)';

    document.getElementById('glassOpacityVal').textContent = opacity.toFixed(2);
    document.getElementById('glassBlurVal').textContent = blur + 'px';
    document.getElementById('glassSatVal').textContent = sat + '%';
    document.getElementById('glassBorderVal').textContent = border.toFixed(2);

    var box = document.getElementById('glassDemoBox');
    box.style.background = 'rgba(255, 255, 255, ' + opacity + ')';
    box.style.backdropFilter = 'saturate(' + sat + '%) blur(' + blur + 'px)';
    box.style.webkitBackdropFilter = 'saturate(' + sat + '%) blur(' + blur + 'px)';
    box.style.border = '2px solid rgba(255, 255, 255, ' + border + ')';
    box.style.boxShadow = shadow === 'none' ? 'none' : shadow;
};

// 玻璃态阴影选择
window.selectGlassShadow = function (btn) {
    document.querySelectorAll('#glassShadowSelect .pw-seg-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    window.updateGlassDemo();
};

// 玻璃态重置
window.resetGlassDemo = function () {
    document.getElementById('glassOpacity').value = 35;
    document.getElementById('glassBlur').value = 8;
    document.getElementById('glassSat').value = 150;
    document.getElementById('glassBorder').value = 30;
    document.querySelectorAll('#glassShadowSelect .pw-seg-btn').forEach(function (b) { b.classList.remove('active'); });
    document.querySelector('#glassShadowSelect .pw-seg-btn[data-value="var(--shadow-lg)"]').classList.add('active');
    window.updateGlassDemo();
};


// =========================================
// 第二部分：IIFE - 页面交互逻辑
// =========================================
(function () {
    'use strict';

    function init() {
        // ---- 1. 入场动画由 CSS @starting-style 处理，卡片滚动揭示由 common.js 的 IntersectionObserver 处理 ----

        // ---- 2. 代码块复制按钮 ----
        document.querySelectorAll('.code-block').forEach(function (block) {
            var btn = block.querySelector('.copy-btn');
            if (!btn) return;
            btn.addEventListener('click', function () {
                var text = block.innerText.replace('复制', '').trim();
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(text).then(function () {
                        btn.textContent = '已复制';
                        btn.classList.add('copied');
                        setTimeout(function () {
                            btn.textContent = '复制';
                            btn.classList.remove('copied');
                        }, 1500);
                    });
                }
            });
        });

        // ---- 3. 导航栏交互 ----
        var navLinks = document.querySelectorAll('.nav-link');
        var sections = document.querySelectorAll('.card[id]');
        var sidebar = document.querySelector('.design-sidebar');
        var overlay = document.querySelector('.design-nav-overlay');
        var toggleBtn = document.querySelector('.design-nav-toggle');

        function setActiveNav(targetId) {
            navLinks.forEach(function (link) {
                var isActive = link.getAttribute('data-target') === targetId;
                link.classList.toggle('active', isActive);
                // 激活的导航项自动滚动到侧边栏可视区（借鉴 changelog）
                if (isActive && link.scrollIntoView) {
                    link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            });
        }

        // scrollspy - 监听 .card[id]
        if ('IntersectionObserver' in window) {
            var navObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        setActiveNav(entry.target.id);
                    }
                });
            }, { rootMargin: '-100px 0px -60% 0px' });

            sections.forEach(function (section) { navObserver.observe(section); });
        }

        // 导航点击：平滑滚动 + 高亮目标卡片
        navLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                var targetId = link.getAttribute('data-target');
                if (!targetId) return;
                e.preventDefault();
                var target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // 高亮目标卡片 1.5s（借鉴 changelog）
                    target.classList.add('highlight');
                    setTimeout(function () { target.classList.remove('highlight'); }, 1500);
                }
                closeNavDrawer();
            });
        });

        // 侧边栏切换逻辑（统一由浮动 toggle 按钮控制）
        function isDesktop() {
            return window.innerWidth > 1100;
        }

        function syncToggleIcon() {
            var navVisible;
            if (isDesktop()) {
                navVisible = sidebar && !sidebar.classList.contains('collapsed');
            } else {
                navVisible = sidebar && sidebar.classList.contains('open');
            }
            if (toggleBtn) {
                toggleBtn.classList.toggle('nav-active', navVisible);
            }
        }

        function openNavDrawer() {
            if (sidebar) sidebar.classList.add('open');
            if (overlay) overlay.classList.add('show');
            syncToggleIcon();
        }

        function closeNavDrawer() {
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
            syncToggleIcon();
        }

        function collapseSidebar() {
            if (!sidebar) return;
            sidebar.classList.add('collapsed');
            document.body.classList.add('sidebar-collapsed');
            syncToggleIcon();
        }

        function expandSidebar() {
            if (!sidebar) return;
            sidebar.classList.remove('collapsed');
            document.body.classList.remove('sidebar-collapsed');
            syncToggleIcon();
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (isDesktop()) {
                    // 桌面端：切换折叠/展开
                    if (sidebar && sidebar.classList.contains('collapsed')) {
                        expandSidebar();
                    } else {
                        collapseSidebar();
                    }
                } else {
                    // 移动端：切换抽屉
                    if (sidebar && sidebar.classList.contains('open')) {
                        closeNavDrawer();
                    } else {
                        openNavDrawer();
                    }
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', closeNavDrawer);
        }

        // 窗口尺寸变化时重置图标状态
        window.addEventListener('resize', syncToggleIcon);

        // 初始化图标状态
        syncToggleIcon();

        // 侧边栏滚轮事件隔离（防止滚动穿透，借鉴 changelog）
        if (sidebar) {
            sidebar.addEventListener('wheel', function (e) {
                e.stopPropagation();
            }, { passive: true });
        }

        // ---- 4. 组件交互 ----

        // option-btn / pw-seg-btn 组切换
        document.querySelectorAll('[data-demo-group]').forEach(function (group) {
            group.querySelectorAll('.demo-option-btn, .pw-seg-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    group.querySelectorAll('.demo-option-btn, .pw-seg-btn').forEach(function (b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                });
            });
        });

        // tab 切换
        document.querySelectorAll('.demo-tab-nav').forEach(function (nav) {
            nav.querySelectorAll('.demo-tab-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    nav.querySelectorAll('.demo-tab-btn').forEach(function (b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                });
            });
        });

        // accent-picker swatch 切换
        document.querySelectorAll('.demo-accent-picker').forEach(function (picker) {
            picker.querySelectorAll('.demo-accent-swatch').forEach(function (swatch) {
                swatch.addEventListener('click', function () {
                    picker.querySelectorAll('.demo-accent-swatch').forEach(function (s) { s.classList.remove('active'); });
                    swatch.classList.add('active');
                });
            });
        });

        // ---- 5. toast / 进度条 / modal / context-menu ----

        // toast 弹出（成功）
        var toastDemoBtn = document.getElementById('toastDemoBtn');
        if (toastDemoBtn) {
            toastDemoBtn.addEventListener('click', function () {
                var stage = toastDemoBtn.closest('.demo-stage');
                var existingToast = stage.querySelector('.demo-toast');
                if (existingToast) existingToast.remove();

                var toast = document.createElement('div');
                toast.className = 'demo-toast';
                toast.textContent = '操作成功';
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px) scale(0.92)';
                toast.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                stage.appendChild(toast);

                requestAnimationFrame(function () {
                    toast.style.opacity = '1';
                    toast.style.transform = 'translateY(0) scale(1)';
                });

                setTimeout(function () {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(20px) scale(0.92)';
                    setTimeout(function () { toast.remove(); }, 300);
                }, 2500);
            });
        }

        // toast 弹出（错误）
        var toastErrorBtn = document.getElementById('toastErrorBtn');
        if (toastErrorBtn) {
            toastErrorBtn.addEventListener('click', function () {
                var stage = toastErrorBtn.closest('.demo-stage');
                var existingToast = stage.querySelector('.demo-toast');
                if (existingToast) existingToast.remove();

                var toast = document.createElement('div');
                toast.className = 'demo-toast error';
                toast.textContent = '操作失败';
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px) scale(0.92)';
                toast.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                stage.appendChild(toast);

                requestAnimationFrame(function () {
                    toast.style.opacity = '1';
                    toast.style.transform = 'translateY(0) scale(1)';
                });

                setTimeout(function () {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(20px) scale(0.92)';
                    setTimeout(function () { toast.remove(); }, 300);
                }, 2500);
            });
        }

        // 进度条动画（scaleX 避免 layout 重排）
        var storageFills = document.querySelectorAll('.demo-storage-fill');
        storageFills.forEach(function (fill) {
            var target = fill.getAttribute('data-width') || '60%';
            var targetScale = parseFloat(target) / 100;
            fill.style.transform = 'scaleX(0)';
            fill.dataset.targetScale = targetScale;
            var fillObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        setTimeout(function () { fill.style.transform = 'scaleX(' + targetScale + ')'; }, 200);
                        fillObserver.unobserve(fill);
                    }
                });
            }, { rootMargin: '0px 0px -50px 0px' });
            fillObserver.observe(fill);
        });

        // 进度条手动重播
        var storageReplayBtn = document.getElementById('storageReplayBtn');
        if (storageReplayBtn) {
            storageReplayBtn.addEventListener('click', function () {
                storageFills.forEach(function (fill) {
                    fill.style.transition = 'none';
                    fill.style.transform = 'scaleX(0)';
                    fill.offsetHeight; /* 强制重排*/
                    fill.style.transition = '';
                    requestAnimationFrame(function () {
                        fill.style.transform = 'scaleX(' + fill.dataset.targetScale + ')';
                    });
                });
            });
        }

        // 模态框打开/关闭
        var modalDemoBtn = document.getElementById('modalDemoBtn');
        if (modalDemoBtn) {
            var modalOverlay = document.createElement('div');
            modalOverlay.className = 'demo-modal-overlay';
            modalOverlay.innerHTML =
                '<div class="demo-modal">' +
                  '<div class="demo-modal-title">确认删除？</div>' +
                  '<div class="demo-modal-content">此操作不可撤销，确定要删除这个项目吗？</div>' +
                  '<div class="demo-modal-actions">' +
                    '<button class="demo-cancel-btn" style="flex:1;" data-close>取消</button>' +
                    '<button class="demo-danger-btn" style="flex:1;" data-close>删除</button>' +
                  '</div>' +
                '</div>';
            document.body.appendChild(modalOverlay);

            function openModal() { modalOverlay.classList.add('open'); }
            function closeModal() { modalOverlay.classList.remove('open'); }

            modalDemoBtn.addEventListener('click', openModal);
            modalOverlay.addEventListener('click', function (e) {
                if (e.target === modalOverlay || e.target.hasAttribute('data-close')) closeModal();
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') closeModal();
            });
        }

        // 右键菜单弹出
        var ctxDemoArea = document.getElementById('ctxDemoArea');
        if (ctxDemoArea) {
            var ctxMenu = document.createElement('div');
            ctxMenu.className = 'demo-context-menu';
            ctxMenu.innerHTML =
                '<div class="demo-context-item">复制</div>' +
                '<div class="demo-context-item">剪切</div>' +
                '<div class="demo-context-item">粘贴</div>' +
                '<div class="demo-context-divider"></div>' +
                '<div class="demo-context-item">重命名</div>' +
                '<div class="demo-context-item danger">删除</div>';
            document.body.appendChild(ctxMenu);

            ctxDemoArea.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                ctxMenu.style.left = e.clientX + 'px';
                ctxMenu.style.top = e.clientY + 'px';
                ctxMenu.classList.add('show');
            });

            document.addEventListener('click', function () { ctxMenu.classList.remove('show'); });
            document.addEventListener('contextmenu', function (e) {
                if (!ctxDemoArea.contains(e.target)) ctxMenu.classList.remove('show');
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
