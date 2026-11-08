const membersData = [
    {
        title: 'Florr公会成员',
        members: ['灰鸢Gledery', '体修者', 'Rui', '史恒瑞']
    },
    {
        title: 'Florr公会成员（待加入）',
        members: ['wzy2013', '盖.com', '666']
    },
    {
        title: '社区成员',
        members: ['Yanxz', 'catgirl', '蓝豹杰克逊', '尘心']
    }
];

const playersData = [
    { name: '灰鸢Gledery', level: 'Lv.83', id: 'Glede-China', entryTime: '2023/4', flowers: '10+U' },
    { name: 'Yanxz', level: 'Lv.109', id: 'Yanxz-China', entryTime: '2023', flowers: '1S' },
    { name: 'Catgirl', level: 'Lv.147', id: 'mgh', entryTime: '2024/7', flowers: '45+S' },
    { name: '尘心', level: 'Lv.109', id: 'zhangcc111', entryTime: '2025/3', flowers: '160+U' },
    { name: '蓝豹杰克逊', level: 'Lv.85', id: 'LBJKS-CHINA', entryTime: '2023', flowers: '20+U' },
    { name: 'wzy2013', level: 'Lv.119', id: 'wzy2013', entryTime: '2024/8', flowers: '3S' },
    { name: '体修者', level: 'Lv.88', id: 'zuess', entryTime: '2024', flowers: '20+U' },
    { name: 'Rui', level: 'Lv.91', id: 'advertisement', entryTime: '2024/9', flowers: '20+U' },
    { name: '谢菜鸟不歇菜', level: 'Lv.90', id: 'WoBuShiRen', entryTime: '2026/1', flowers: '10U' },
    { name: '盖.com', level: 'Lv.72', id: 'nello', entryTime: '2025/3', flowers: '2U' },
    { name: '666', level: 'Lv.60', id: '1234AaBbCc', entryTime: '2024/6', flowers: '1U' },
    { name: '史恒瑞', level: 'Lv.80', id: '1255utryrg—', entryTime: '2024/11', flowers: '9U' }
];

function renderMembers() {
    const container = document.getElementById('members-container');
    membersData.forEach(group => {
        const titleDiv = document.createElement('div');
        titleDiv.style.cssText = 'text-align: center; padding: 5px 0; font-size: 16px; color: black;';
        titleDiv.textContent = group.title;
        container.appendChild(titleDiv);
        
        const groupDiv = document.createElement('div');
        groupDiv.className = 'member-group';
        groupDiv.style.cssText = 'text-align: center; margin-bottom: 15px;';
        
        group.members.forEach(member => {
            const button = document.createElement('span');
            button.className = 'pill-button';
            button.textContent = member;
            groupDiv.appendChild(button);
        });
        
        container.appendChild(groupDiv);
    });
}

function renderPlayers() {
    const container = document.getElementById('players-container');
    playersData.forEach(player => {
        const row = document.createElement('div');
        row.className = 'player-row';
        
        row.innerHTML = `
            <h2 class="player-name">${player.name}</h2>
            <div class="stat-item">
                <div class="stat-value">${player.level}</div>
                <div class="stat-label">等级</div>
            </div>
            <div class="stat-item id-field">
                <div class="stat-value">${player.id}</div>
                <div class="stat-label">ID</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${player.entryTime}</div>
                <div class="stat-label">入坑时间</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${player.flowers}</div>
                <div class="stat-label">花瓣状况</div>
            </div>
        `;
        
        container.appendChild(row);
    });
    
    const noteDiv = document.createElement('div');
    noteDiv.style.cssText = 'text-align: center; padding: 10px 0; font-size: 13px; color: #666;';
    noteDiv.innerHTML = '<span>*默认微信用户名为展示名称</span>';
    container.appendChild(noteDiv);
}

document.addEventListener('DOMContentLoaded', function() {
    renderMembers();
    renderPlayers();
});