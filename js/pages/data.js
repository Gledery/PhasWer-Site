(function() {
    var CHART_JS_URLS = [
        'https://unpkg.com/chart.js@4.4.7/dist/chart.umd.min.js',
        'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.7/chart.umd.min.js'
    ];

    var csvData = [];
    var csvHeaders = [];
    var trendChart = null;
    var tablePageSize = 30;
    var tableCurrentLen = 0;
    var tableFiltered = [];
    var dataReady = false;
    var rangeStartIdx = 0;
    var rangeEndIdx = -1;

    var STAT_ITEMS = [
        { label: '播放量', icon: '▶️' },
        { label: '累计粉丝', icon: '👥' },
        { label: '点赞', icon: '👍' },
        { label: '收藏', icon: '⭐' },
        { label: '硬币', icon: '🪙' },
        { label: '评论', icon: '💬' },
        { label: '弹幕', icon: '📡' },
        { label: '分享', icon: '🔗' }
    ];

    renderPlaceholderStats();
    showChartPlaceholder();

    function renderPlaceholderStats() {
        var grid = document.getElementById('statsGrid');
        grid.innerHTML = '';
        STAT_ITEMS.forEach(function(item) {
            var card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML =
                '<div class="stat-label">' + item.icon + ' ' + item.label + '</div>' +
                '<div class="stat-value">***</div>';
            grid.appendChild(card);
        });
    }

    function showChartPlaceholder() {
        document.getElementById('chartLoading').textContent = '输入密码后查看趋势图表';
    }

    var tablePwdInput = document.getElementById('tablePassword');
    var lockError = document.getElementById('lockError');
    var tableLock = document.getElementById('tableLock');
    var heroUnlock = document.getElementById('heroUnlock');

    tablePwdInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            var pwd = tablePwdInput.value;
            CryptoUtil.decryptCSV(ENCRYPTED_CSV, pwd).then(function(plaintext) {
                dataReady = true;
                parseCSV(plaintext);
                renderStats();
                renderTable();
                loadChartJS(0);
                tableLock.classList.remove('locked');
                var overlay = document.getElementById('tableLockOverlay');
                overlay.style.opacity = '0';
                setTimeout(function() { overlay.style.display = 'none'; }, 500);
                heroUnlock.classList.add('unlocked');
            }).catch(function() {
                lockError.style.display = 'block';
                tablePwdInput.value = '';
                setTimeout(function() { lockError.style.display = 'none'; }, 2000);
            });
        }
    });

    function loadChartJS(index) {
        if (typeof Chart !== 'undefined') {
            initChart();
            return;
        }
        if (index >= CHART_JS_URLS.length) {
            document.getElementById('chartLoading').textContent = '图表库加载失败，请检查网络';
            return;
        }
        var script = document.createElement('script');
        script.src = CHART_JS_URLS[index];
        script.onload = function() {
            initChart();
        };
        script.onerror = function() {
            loadChartJS(index + 1);
        };
        document.head.appendChild(script);
    }

    function parseCSV(text) {
        var lines = text.trim().split('\n');
        csvHeaders = lines[0].split(',').map(function(h) { return h.trim(); });
        csvData = [];
        for (var i = 1; i < lines.length; i++) {
            var values = lines[i].split(',').map(function(v) { return v.trim(); });
            if (values.length === csvHeaders.length) {
                var row = {};
                for (var j = 0; j < csvHeaders.length; j++) {
                    row[csvHeaders[j]] = values[j];
                }
                csvData.push(row);
            }
        }
    }

    function formatNumber(n) {
        if (n >= 10000) {
            return (n / 10000).toFixed(1) + '万';
        }
        return n.toLocaleString();
    }

    function parseNum(val) {
        return parseInt(val, 10) || 0;
    }

    function renderStats() {
        var grid = document.getElementById('statsGrid');
        var latest = csvData[csvData.length - 1];

        grid.innerHTML = '';
        STAT_ITEMS.forEach(function(item) {
            var current = parseNum(latest[item.label]);
            var card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML =
                '<div class="stat-label">' + item.icon + ' ' + item.label + '</div>' +
                '<div class="stat-value">' + formatNumber(current) + '</div>';
            grid.appendChild(card);
        });
    }

    var chartMetrics = ['播放量', '累计粉丝', '点赞', '收藏', '硬币', '评论', '弹幕', '分享'];
    var chartColors = {
        '播放量': { line: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' },
        '累计粉丝': { line: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
        '点赞': { line: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
        '收藏': { line: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
        '硬币': { line: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' },
        '评论': { line: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
        '弹幕': { line: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
        '分享': { line: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)' }
    };

    renderChartToggle();

    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);

    var zoomFixPlugin = {
        id: 'zoomFix',
        beforeEvent: function(chart, args) {
            var evt = args.event;
            if (!evt.native) return;
            var canvas = chart.canvas;
            var rect = canvas.getBoundingClientRect();
            var cssW = canvas.offsetWidth;
            var cssH = canvas.offsetHeight;
            if (cssW === 0 || cssH === 0) return;
            var zoomX = rect.width / cssW;
            var zoomY = rect.height / cssH;
            evt.x = (evt.native.clientX - rect.left) / zoomX;
            evt.y = (evt.native.clientY - rect.top) / zoomY;
        }
    };

    function initChart() {
        renderChartToggle();
        initChartRange();
        renderChart('播放量');
    }

    function initChartRange() {
        var startSel = document.getElementById('rangeStart');
        var endSel = document.getElementById('rangeEnd');
        startSel.innerHTML = '';
        endSel.innerHTML = '';
        csvData.forEach(function(row, i) {
            var date = row[csvHeaders[0]];
            var optS = document.createElement('option');
            optS.value = i; optS.textContent = date;
            startSel.appendChild(optS);
            var optE = document.createElement('option');
            optE.value = i; optE.textContent = date;
            endSel.appendChild(optE);
        });
        rangeStartIdx = 0;
        rangeEndIdx = csvData.length - 1;
        startSel.value = String(rangeStartIdx);
        endSel.value = String(rangeEndIdx);
        document.getElementById('chartRangeBar').style.display = 'flex';
    }

    function applyChartRange() {
        var activeBtn = document.querySelector('#chartToggle .pw-seg-btn.active');
        var metric = activeBtn ? activeBtn.getAttribute('data-metric') : '播放量';
        renderChart(metric);
    }

    function renderChartToggle() {
        var toggle = document.getElementById('chartToggle');
        toggle.innerHTML = '';
        chartMetrics.forEach(function(metric) {
            var btn = document.createElement('button');
            btn.className = 'pw-seg-btn';
            btn.textContent = metric;
            btn.setAttribute('data-metric', metric);
            toggle.appendChild(btn);
        });
    }

    function renderChart(metric) {
        if (typeof Chart === 'undefined') return;

        document.getElementById('chartLoading').style.display = 'none';
        document.getElementById('trendChart').style.display = 'block';

        if (trendChart) trendChart.destroy();

        var startIdx = rangeStartIdx || 0;
        var endIdx = (rangeEndIdx == null || rangeEndIdx < 0) ? csvData.length - 1 : rangeEndIdx;
        if (endIdx < startIdx) endIdx = startIdx;
        var slice = csvData.slice(startIdx, endIdx + 1);
        var labels = slice.map(function(row) { return row[csvHeaders[0]]; });
        var values = slice.map(function(row) { return parseNum(row[metric]); });
        var colors = chartColors[metric] || { line: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' };

        trendChart = new Chart(document.getElementById('trendChart').getContext('2d'), {
            type: 'line',
            plugins: [zoomFixPlugin],
            data: {
                labels: labels,
                datasets: [{
                    label: metric,
                    data: values,
                    borderColor: colors.line,
                    backgroundColor: colors.bg,
                    borderWidth: 2.5,
                    pointRadius: isMobile ? 4 : 0,
                    pointHitRadius: isMobile ? 20 : 10,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: colors.line,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: 20 },
                interaction: { intersect: false, mode: 'index' },
                onHover: function(event, elements, chart) {
                    if (isMobile) {
                        event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: false,
                        external: function(context) {
                            var tooltipEl = document.getElementById('chartjsTooltip');
                            if (!tooltipEl) {
                                tooltipEl = document.createElement('div');
                                tooltipEl.id = 'chartjsTooltip';
                                tooltipEl.className = 'chartjs-tooltip';
                                document.getElementById('trendChart').parentNode.appendChild(tooltipEl);
                            }

                            var tooltipModel = context.tooltip;
                            if (tooltipModel.opacity === 0) {
                                tooltipEl.classList.remove('show');
                                return;
                            }

                            if (tooltipModel.body) {
                                var titleLines = tooltipModel.title || [];
                                var bodyLines = tooltipModel.body.map(function(b) { return b.lines; });

                                var html = '';
                                titleLines.forEach(function(title) {
                                    html += '<div style="font-weight:600;margin-bottom:4px">' + title + '</div>';
                                });
                                bodyLines.forEach(function(body, i) {
                                    body.forEach(function(line) {
                                        html += '<div>' + line + '</div>';
                                    });
                                });
                                tooltipEl.innerHTML = html;
                            }

                            var canvas = context.chart.canvas;
                            var canvasRect = canvas.getBoundingClientRect();
                            var container = canvas.parentNode;
                            var containerRect = container.getBoundingClientRect();

                            var cssW = canvas.offsetWidth;
                            var renderW = canvasRect.width;
                            var zoomRatio = cssW > 0 ? renderW / cssW : 1;

                            var tipX = tooltipModel.caretX * zoomRatio + (canvasRect.left - containerRect.left);
                            var tipY = tooltipModel.caretY * zoomRatio + (canvasRect.top - containerRect.top);

                            tooltipEl.classList.add('show');

                            var tipW = tooltipEl.offsetWidth;
                            var tipH = tooltipEl.offsetHeight;
                            var containerW = containerRect.width;

                            tipY = tipY - tipH - 12;
                            if (tipY < 0) tipY = tooltipModel.caretY * zoomRatio + (canvasRect.top - containerRect.top) + 16;

                            tipX = tipX - tipW / 2;
                            if (tipX < 8) tipX = 8;
                            if (tipX + tipW > containerW - 8) tipX = containerW - tipW - 8;

                            tooltipEl.style.left = tipX + 'px';
                            tooltipEl.style.top = tipY + 'px';
                            tooltipEl.style.transform = 'none';
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { maxTicksLimit: 12, color: '#999', font: { size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                            color: '#999',
                            font: { size: 11 },
                            callback: function(value) {
                                if (value >= 10000) return (value / 10000).toFixed(0) + '万';
                                return value;
                            }
                        }
                    }
                }
            }
        });

        document.querySelectorAll('#chartToggle .pw-seg-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.getAttribute('data-metric') === metric);
        });
    }

    function renderTable(filter, append) {
        var head = document.getElementById('tableHead');
        var body = document.getElementById('tableBody');

        if (!append) {
            head.innerHTML = '';
            csvHeaders.forEach(function(h) {
                var th = document.createElement('th');
                th.textContent = h;
                head.appendChild(th);
            });

            body.innerHTML = '';
            tableFiltered = filter
                ? csvData.filter(function(row) { return row[csvHeaders[0]].indexOf(filter) !== -1; })
                : csvData;
            tableFiltered = tableFiltered.slice().reverse();
            tableCurrentLen = 0;
        }

        var nextLen = Math.min(tableCurrentLen + tablePageSize, tableFiltered.length);
        for (var i = tableCurrentLen; i < nextLen; i++) {
            var row = tableFiltered[i];
            var tr = document.createElement('tr');
            if (i === 0) tr.className = 'latest-row';
            csvHeaders.forEach(function(h) {
                var td = document.createElement('td');
                td.textContent = row[h];
                tr.appendChild(td);
            });
            body.appendChild(tr);
        }
        tableCurrentLen = nextLen;

        var wrap = document.getElementById('loadMoreWrap');
        if (tableCurrentLen < tableFiltered.length) {
            wrap.style.display = 'block';
        } else {
            wrap.style.display = 'none';
        }
    }

    document.getElementById('loadMoreBtn').addEventListener('click', function() {
        renderTable(document.getElementById('tableSearch').value.trim(), true);
    });

    document.getElementById('chartToggle').addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON' && dataReady) {
            renderChart(e.target.getAttribute('data-metric'));
        }
    });

    document.getElementById('tableSearch').addEventListener('input', function(e) {
        renderTable(e.target.value.trim());
    });

    document.getElementById('rangeStart').addEventListener('change', function() {
        if (!dataReady) return;
        var s = parseInt(this.value, 10);
        if (!isNaN(s) && s > rangeEndIdx) {
            rangeEndIdx = s;
            document.getElementById('rangeEnd').value = String(s);
        }
        rangeStartIdx = s;
        applyChartRange();
    });

    document.getElementById('rangeEnd').addEventListener('change', function() {
        if (!dataReady) return;
        var e = parseInt(this.value, 10);
        if (!isNaN(e) && e < rangeStartIdx) {
            rangeStartIdx = e;
            document.getElementById('rangeStart').value = String(e);
        }
        rangeEndIdx = e;
        applyChartRange();
    });

    document.getElementById('rangeReset').addEventListener('click', function() {
        if (!dataReady) return;
        rangeStartIdx = 0;
        rangeEndIdx = csvData.length - 1;
        document.getElementById('rangeStart').value = String(rangeStartIdx);
        document.getElementById('rangeEnd').value = String(rangeEndIdx);
        applyChartRange();
    });
})();