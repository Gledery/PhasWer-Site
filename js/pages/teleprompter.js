var isPlaying = false;
var isMirrored = false;
var showGuide = true;
var autoHideBar = false;
var scrollOffset = 0;
var scrollSpeed = 3;
var animFrameId = null;
var startTime = null;
var elapsedPaused = 0;
var guideEl = null;

var speedSlider = document.getElementById('speedSlider');
var fontSizeSlider = document.getElementById('fontSizeSlider');
var lineHeightSlider = document.getElementById('lineHeightSlider');
var countdownSlider = document.getElementById('countdownSlider');

speedSlider.addEventListener('input', function() {
    scrollSpeed = parseInt(this.value);
    document.getElementById('speedValue').textContent = this.value;
});

fontSizeSlider.addEventListener('input', function() {
    document.getElementById('fontSizeValue').textContent = this.value;
});

lineHeightSlider.addEventListener('input', function() {
    var lh = (parseInt(this.value) / 10).toFixed(1);
    document.getElementById('lineHeightValue').textContent = lh;
});

countdownSlider.addEventListener('input', function() {
    document.getElementById('countdownValue').textContent = this.value;
});

function toggleMirror() {
    isMirrored = !isMirrored;
    document.getElementById('mirrorToggle').classList.toggle('active', isMirrored);
}

function toggleGuide() {
    showGuide = !showGuide;
    document.getElementById('guideToggle').classList.toggle('active', showGuide);
}

function toggleAutoHide() {
    autoHideBar = !autoHideBar;
    document.getElementById('autoHideToggle').classList.toggle('active', autoHideBar);
}

function loadSampleText() {
    document.getElementById('scriptInput').value =
        '这是一段用于测试提词器的示例文本，包含各种长度和类型的句子，帮助你调整滚动速度、字号、行距等参数。\n\n' +
        '短句测试。一二三四五。开门见山。\n\n' +
        '这是一段中等长度的句子，用来测试默认字号下的显示效果，确保文字不会显得拥挤或者稀疏。\n\n' +
        '这是一段较长的句子，模拟实际演讲中常见的复杂表述场景。当你在正式录制中使用提词器时，往往会遇到这种包含大量信息、需要一口气读完的长句。这个长句可以帮助你判断当前字号是否足够舒适、行间距是否合理、以及滚动速度是否跟得上你的语速。\n\n' +
        '数字测试：1、2、3、10、50、100、3.14、2026 年、99.9%、1/4、7:30。\n\n' +
        '标点符号测试：逗号，句号。感叹号！问号？顿号、冒号：分号；引号「这样」和「那样」括号（注意这里）破折号——连接线。省略号……\n\n' +
        '英文混排测试：App、iOS、Android、WiFi、Bluetooth、USB-C、HTML、JavaScript、Python、ChatGPT、YouTube、Instagram。\n\n' +
        '以下测试不同段落长度。\n\n' +
        '短。\n\n' +
        '这是一段包含两句话的短段落。第二句话也在这里。\n\n' +
        '这是一段包含三句话的中等段落。第二句话稍微长一点，用来模拟正常的语速节奏。第三句话作为段落的结尾，帮助测试段落之间的视觉间隔是否清晰。\n\n' +
        '这是一段刻意拉长的段落，包含四到五句话。它的目的是测试在较小字号下，连续阅读时的速度。如果你觉得这段文字看起来太密集，可以尝试增大字号或者调大行间距。每个人的视力习惯不同，建议找到最适合自己的参数组合。第五句话在这里为整个段落收尾。\n\n' +
        '渐变长度测试：\n' +
        '短。\n' +
        '稍长一点。\n' +
        '再稍微长一些的句子。\n' +
        '这已经是比较长的一句话了，可以感受一下阅读节奏。\n' +
        '最后是一句非常非常长的话，用来测试极端情况下提词器的表现，看看滚动是否平滑、文字是否清晰、你是否能跟上这个速度而不觉得吃力或者需要反复倒退。\n\n' +
        '空白行间距测试——下面有两个空行：\n\n\n\n' +
        '你看到这段文字之前，中间应该有两个空行的间隔。这可以帮助你判断段落之间的留白是否足够。\n\n' +
        '最后，这是一段收尾文字。到这里你应该已经测试了短句、长句、数字、标点、英文混排、重复节奏、渐变长度、空白间隔、场景切换、密排文本和逐行换行等多种场景。现在可以根据你的感受，最终确定滚动速度、字号大小和行间距的参数了。祝你录制顺利！';
}

function clearText() {
    document.getElementById('scriptInput').value = '';
}

function startPrompter() {
    var text = document.getElementById('scriptInput').value.trim();
    if (!text) {
        alert('请先输入台词文稿');
        return;
    }

    var fontSize = parseInt(fontSizeSlider.value);
    var lineHeight = (parseInt(lineHeightSlider.value) / 10).toFixed(1);
    var textColor = document.getElementById('textColor').value;
    var bgColor = document.getElementById('bgColor').value;

    var content = document.getElementById('prompterContent');
    content.textContent = text;
    content.style.fontSize = fontSize + 'px';
    content.style.lineHeight = lineHeight;
    content.style.color = textColor;
    content.classList.toggle('mirrored', isMirrored);

    var overlay = document.getElementById('prompterOverlay');
    overlay.style.background = bgColor;
    overlay.classList.add('visible');

    scrollOffset = 0;
    content.style.transform = (isMirrored ? 'scaleX(-1) ' : '') + 'translateY(0)';
    isPlaying = false;
    startTime = null;
    elapsedPaused = 0;

    document.getElementById('statusIndicator').textContent = '⏸ 已暂停';
    document.getElementById('progressBar').style.transform = 'scaleX(0)';
    document.getElementById('topbarElapsed').textContent = '00:00';

    updateGuideLine();

    var countdown = parseInt(countdownSlider.value);
    if (countdown > 0) {
        showCountdown(countdown);
    }

    document.body.style.overflow = 'hidden';
}

function showCountdown(seconds) {
    var overlay = document.getElementById('countdownOverlay');
    var numEl = document.getElementById('countdownNumber');
    overlay.classList.add('visible');

    var remaining = seconds;
    numEl.textContent = remaining;

    var interval = setInterval(function() {
        remaining--;
        if (remaining <= 0) {
            clearInterval(interval);
            overlay.classList.remove('visible');
            togglePlayPause();
        } else {
            numEl.textContent = remaining;
        }
    }, 1000);
}

function togglePlayPause() {
    var countdownEl = document.getElementById('countdownOverlay');
    if (countdownEl.classList.contains('visible')) return;

    isPlaying = !isPlaying;

    if (isPlaying) {
        if (!startTime) startTime = Date.now() - elapsedPaused;
        else startTime = Date.now() - elapsedPaused;
        document.getElementById('statusIndicator').textContent = '▶ 播放中';
        startScroll();
    } else {
        elapsedPaused = Date.now() - startTime;
        document.getElementById('statusIndicator').textContent = '⏸ 已暂停';
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }
    }
}

function startScroll() {
    var scrollArea = document.getElementById('scrollArea');
    var content = document.getElementById('prompterContent');

    var areaHeight = scrollArea.offsetHeight;
    var contentHeight = content.scrollHeight;
    var maxScroll = contentHeight - areaHeight + areaHeight * 0.6;

    function frame() {
        if (!isPlaying) return;

        scrollOffset += scrollSpeed * 0.15;

        if (scrollOffset >= maxScroll) {
            scrollOffset = maxScroll;
            isPlaying = false;
            document.getElementById('statusIndicator').textContent = '✓ 已完成';
            updateProgress(maxScroll);
            updateElapsed();
            return;
        }

        var transform = 'translateY(' + (-scrollOffset + scrollArea.offsetHeight * 0.35) + 'px)';
        if (isMirrored) transform = 'scaleX(-1) ' + transform;
        content.style.transform = transform;

        updateProgress(maxScroll);
        updateElapsed();

        animFrameId = requestAnimationFrame(frame);
    }

    animFrameId = requestAnimationFrame(frame);
}

function updateProgress(maxScroll) {
    var pct = Math.min(100, Math.round((scrollOffset / maxScroll) * 100));
    document.getElementById('progressBar').style.transform = 'scaleX(' + (pct / 100) + ')';
    document.getElementById('topbarProgress').textContent = pct + '%';
}

function updateElapsed() {
    if (!startTime) return;
    var ms = Date.now() - startTime;
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    document.getElementById('topbarElapsed').textContent =
        (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function adjustSpeedInPrompter(delta) {
    scrollSpeed = Math.max(1, Math.min(10, scrollSpeed + delta));
    document.getElementById('topbarSpeed').textContent = scrollSpeed;
    speedSlider.value = scrollSpeed;
    document.getElementById('speedValue').textContent = scrollSpeed;
}

function toggleMirrorInPrompter() {
    isMirrored = !isMirrored;
    document.getElementById('mirrorToggle').classList.toggle('active', isMirrored);

    var content = document.getElementById('prompterContent');
    var scrollArea = document.getElementById('scrollArea');
    var transform = 'translateY(' + (-scrollOffset + scrollArea.offsetHeight * 0.35) + 'px)';
    if (isMirrored) transform = 'scaleX(-1) ' + transform;
    content.style.transform = transform;
}

function toggleFullscreen() {
    var overlay = document.getElementById('prompterOverlay');
    if (!document.fullscreenElement) {
        overlay.requestFullscreen().catch(function() {});
    } else {
        document.exitFullscreen();
    }
}

function resetScroll() {
    scrollOffset = 0;
    elapsedPaused = 0;
    startTime = null;
    isPlaying = false;
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
    var content = document.getElementById('prompterContent');
    var scrollArea = document.getElementById('scrollArea');
    var transform = 'translateY(' + (scrollArea.offsetHeight * 0.35) + 'px)';
    if (isMirrored) transform = 'scaleX(-1) ' + transform;
    content.style.transform = transform;
    document.getElementById('statusIndicator').textContent = '⏸ 已暂停';
    document.getElementById('progressBar').style.transform = 'scaleX(0)';
    document.getElementById('topbarProgress').textContent = '0%';
    document.getElementById('topbarElapsed').textContent = '00:00';
}

function exitPrompter() {
    isPlaying = false;
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    document.getElementById('prompterOverlay').classList.remove('visible');
    document.getElementById('countdownOverlay').classList.remove('visible');
    document.body.style.overflow = '';
    removeGuideLine();
}

function updateGuideLine() {
    removeGuideLine();
    if (!showGuide) return;

    var scrollArea = document.getElementById('scrollArea');
    guideEl = document.createElement('div');
    guideEl.style.cssText =
        'position:absolute;left:0;right:0;height:2px;background:rgba(255,255,255,0.25);' +
        'top:35%;z-index:5;pointer-events:none;box-shadow:0 0 8px rgba(255,255,255,0.15);';
    scrollArea.appendChild(guideEl);
}

function removeGuideLine() {
    if (guideEl && guideEl.parentNode) {
        guideEl.parentNode.removeChild(guideEl);
        guideEl = null;
    }
}

document.addEventListener('keydown', function(e) {
    var overlay = document.getElementById('prompterOverlay');
    if (!overlay.classList.contains('visible')) return;

    if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
    } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        adjustSpeedInPrompter(-1);
    } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        adjustSpeedInPrompter(1);
    } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMirrorInPrompter();
    } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
    } else if (e.code === 'Escape') {
        e.preventDefault();
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            exitPrompter();
        }
    }
});

var topbarTimer = null;
document.getElementById('scrollArea').addEventListener('mousemove', function() {
    if (!autoHideBar) return;
    var topbar = document.getElementById('prompterTopbar');
    topbar.classList.remove('hidden-bar');
    clearTimeout(topbarTimer);
    topbarTimer = setTimeout(function() {
        topbar.classList.add('hidden-bar');
    }, 2000);
});

document.getElementById('scrollArea').addEventListener('wheel', function(e) {
    e.preventDefault();
    scrollOffset = Math.max(0, scrollOffset - e.deltaY * 0.5);

    var content = document.getElementById('prompterContent');
    var scrollArea = document.getElementById('scrollArea');
    var maxScroll = content.scrollHeight - scrollArea.offsetHeight + scrollArea.offsetHeight * 0.6;

    var transform = 'translateY(' + (-scrollOffset + scrollArea.offsetHeight * 0.35) + 'px)';
    if (isMirrored) transform = 'scaleX(-1) ' + transform;
    content.style.transform = transform;

    updateProgress(maxScroll);
}, { passive: false });

document.getElementById('textColor').addEventListener('change', function() {
    var content = document.getElementById('prompterContent');
    if (document.getElementById('prompterOverlay').classList.contains('visible')) {
        content.style.color = this.value;
    }
});

document.getElementById('bgColor').addEventListener('change', function() {
    if (document.getElementById('prompterOverlay').classList.contains('visible')) {
        document.getElementById('prompterOverlay').style.background = this.value;
    }
});