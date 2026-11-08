// 状态
var currentFilter = 'all';
var searchQuery = '';

// 统计
function countEvents() {
    var total = 0, orgCount = 0, gldCount = 0, ldcCount = 0;
    eventData.forEach(function(yearGroup) {
        yearGroup.events.forEach(function(e) {
            total++;
            if (e.type === 'org') orgCount++;
            if (e.type === 'gld') gldCount++;
            if (e.type === 'ldc') ldcCount++;
        });
    });
    return { total: total, org: orgCount, gld: gldCount, ldc: ldcCount };
}

function updateStats() {
    var counts = countEvents();
    var el = document.getElementById('statsLine');
    var shown = currentFilter === 'all' ? counts.total : counts[currentFilter];
    el.textContent = '共 ' + shown + ' 条记录：组织 ' + counts.org + ' 条 · 灰鸢 ' + counts.gld + ' 条 · 小白狼 ' + counts.ldc + ' 条';
}

// 生成表格内容
function renderTable() {
    var tableBody = document.getElementById('historyBody');
    tableBody.innerHTML = '';

    eventData.forEach(function(yearGroup) {
        var year = yearGroup.year;
        var events = yearGroup.events;
        var filteredEvents = currentFilter === 'all'
            ? events
            : events.filter(function(e) { return e.type === currentFilter; });

        if (filteredEvents.length === 0) return;

        var rowCount = filteredEvents.length;

        filteredEvents.forEach(function(event, index) {
            var row = document.createElement('tr');

            if (index === 0) {
                var yearCell = document.createElement('td');
                yearCell.className = 'year-col';
                yearCell.rowSpan = rowCount;
                yearCell.textContent = year;
                yearCell.id = 'year-' + year;
                row.appendChild(yearCell);
            }

            ['org', 'gld', 'ldc'].forEach(function(type) {
                var cell = document.createElement('td');
                if (event && event.type === type) {
                    cell.className = type + '-col';
                    var eventCell = document.createElement('div');
                    eventCell.className = 'event-cell';
                    eventCell.dataset.text = (event.time + ' ' + event.desc).toLowerCase();

                    var timeDiv = document.createElement('div');
                    timeDiv.className = 'event-time';
                    timeDiv.textContent = event.time;

                    var descDiv = document.createElement('div');
                    descDiv.className = 'event-desc';
                    descDiv.textContent = event.desc;

                    eventCell.appendChild(timeDiv);
                    eventCell.appendChild(descDiv);
                    cell.appendChild(eventCell);
                } else {
                    cell.className = 'empty-cell';
                }
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });
    });

    updateStats();
    applySearch();
}

// 搜索高亮
function applySearch() {
    var cells = document.querySelectorAll('.event-cell');
    var query = searchQuery.trim().toLowerCase();

    if (!query) {
        cells.forEach(function(cell) {
            cell.classList.remove('highlighted', 'dimmed');
        });
        document.querySelectorAll('.year-col').forEach(function(c) { c.classList.remove('dimmed'); });
        document.querySelectorAll('.empty-cell').forEach(function(c) { c.classList.remove('dimmed'); });
        return;
    }

    var matchedRows = new Set();

    cells.forEach(function(cell) {
        var text = cell.dataset.text || '';
        if (text.indexOf(query) !== -1) {
            cell.classList.add('highlighted');
            cell.classList.remove('dimmed');
            matchedRows.add(cell.closest('tr'));
        } else {
            cell.classList.remove('highlighted');
            cell.classList.add('dimmed');
        }
    });

    document.querySelectorAll('#historyBody tr').forEach(function(row) {
        var dim = !matchedRows.has(row);
        var yearCell = row.querySelector('.year-col');
        if (yearCell) yearCell.classList.toggle('dimmed', dim);
        row.querySelectorAll('.empty-cell').forEach(function(c) { c.classList.toggle('dimmed', dim); });
    });
}

// 事件绑定
document.getElementById('searchInput').addEventListener('input', function(e) {
    searchQuery = e.target.value;
    applySearch();
});

document.getElementById('filterButtons').addEventListener('click', function(e) {
    var btn = e.target.closest('.pw-seg-btn');
    if (!btn) return;

    document.querySelectorAll('#filterButtons .pw-seg-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');

    currentFilter = btn.dataset.filter;
    searchQuery = '';
    document.getElementById('searchInput').value = '';
    renderTable();
});

renderTable();