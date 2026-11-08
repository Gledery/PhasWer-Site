function getVersionLevel(v) {
    var parts = v.split('.');
    if (parts[1] === '0' && parts[2] === '0') return 'major';
    if (parts[2] === '0') return 'minor';
    return 'patch';
}

var LEVEL_COLORS = {
    major: '#27ae60',
    minor: '#6dbf8b',
    patch: '#b8deca'
};


function renderSidebar() {
    var sidebar = document.getElementById('sidebar');
    var currentMajor = null;
    versions.forEach(function(v) {
        var major = v.version.split('.')[0];
        if (major !== currentMajor) {
            currentMajor = major;
            var title = document.createElement('div');
            title.className = 'sidebar-section-title';
            title.textContent = 'v' + major + '.x';
            sidebar.appendChild(title);
        }
        var item = document.createElement('div');
        item.className = 'sidebar-item';
        item.dataset.version = v.version;
        var dot = document.createElement('span');
        dot.className = 'sidebar-dot';
        dot.style.background = LEVEL_COLORS[getVersionLevel(v.version)];
        item.appendChild(dot);
        item.appendChild(document.createTextNode('v' + v.version));
        item.addEventListener('click', function() {
            var el = document.getElementById('v-' + v.version);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('highlight');
                setTimeout(function() { el.classList.remove('highlight'); }, 1500);
            }
        });
        sidebar.appendChild(item);
    });
}

function renderVersions() {
    var list = document.getElementById('versionList');
    versions.forEach(function(v) {
        var level = getVersionLevel(v.version);
        var card = document.createElement('div');
        card.className = 'version-card';
        card.id = 'v-' + v.version;
        card.dataset.level = level;

        var header = document.createElement('div');
        header.className = 'version-header';

        var badge = document.createElement('span');
        badge.className = 'version-badge';
        badge.textContent = 'v' + v.version;

        var date = document.createElement('span');
        date.className = 'version-date';
        date.textContent = v.date;

        header.appendChild(badge);
        header.appendChild(date);

        var inner = document.createElement('div');
        inner.className = 'version-body-inner';

        v.changes.forEach(function(desc) {
            var item = document.createElement('div');
            item.className = 'change-item';
            item.textContent = desc;
            inner.appendChild(item);
        });

        card.appendChild(header);
        card.appendChild(inner);
        list.appendChild(card);
    });
}

function initScrollSpy() {
    var sidebar = document.getElementById('sidebar');
    var items = document.querySelectorAll('.sidebar-item');
    var cards = document.querySelectorAll('.version-card');

    sidebar.addEventListener('wheel', function(e) {
        e.stopPropagation();
    }, { passive: true });

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var ver = entry.target.id.replace('v-', '');
                items.forEach(function(item) {
                    var isActive = item.dataset.version === ver;
                    item.classList.toggle('active', isActive);
                    if (isActive) {
                        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }
                });
            }
        });
    }, { rootMargin: '-30% 0px -60% 0px' });

    cards.forEach(function(card) { observer.observe(card); });
}

renderSidebar();
renderVersions();
initScrollSpy();