var ENCRYPTED_DATA = null;

function setStatus(msg, type) {
    var el = document.getElementById('status');
    el.textContent = msg;
    el.className = 'status ' + (type || '');
}

function setVerifyStatus(msg, type) {
    var el = document.getElementById('verifyStatus');
    el.textContent = msg;
    el.className = 'status ' + (type || '');
}

function doEncrypt() {
    var csv = document.getElementById('csvInput').value.trim();
    var pwd = document.getElementById('encryptPassword').value;
    var confirm = document.getElementById('confirmPassword').value;

    if (!csv) { setStatus('CSV 数据呢 (╯°□°)╯', 'error'); return; }
    if (!pwd) { setStatus('密码呢，没密码加密不了 (╯°□°)╯', 'error'); return; }
    if (pwd !== confirm) { setStatus('两次密码不一样 (ﾟДﾟ*)', 'error'); return; }
    if (pwd.length < 4) { setStatus('密码太短了，至少 4 个字符 (・_・)', 'error'); return; }

    setStatus('加密中...', 'info');
    CryptoUtil.encryptData(csv, pwd).then(function(encrypted) {
        ENCRYPTED_DATA = encrypted;
        document.getElementById('output').value = encrypted;
        document.getElementById('outputCard').classList.remove('hidden');
        setStatus('搞定！共 ' + csv.split('\n').length + ' 行数据已加密', 'success');
        document.getElementById('outputCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(function(err) {
        setStatus('加密失败：' + err, 'error');
    });
}

function doVerify() {
    if (!ENCRYPTED_DATA) { setVerifyStatus('还没加密呢，先加密吧 (・_・)', 'error'); return; }
    var pwd = document.getElementById('verifyPassword').value;
    if (!pwd) { setVerifyStatus('密码呢 (・_・)', 'error'); return; }

    setVerifyStatus('验证中...', 'info');
    CryptoUtil.decryptCSV(ENCRYPTED_DATA, pwd).then(function(plaintext) {
        var lines = plaintext.split('\n');
        setVerifyStatus('验证通过！解密出 ' + lines.length + ' 行数据，首行：' + lines[0].substring(0, 60) + '...', 'success');
    }).catch(function() {
        setVerifyStatus('密码错了或数据坏了 (ﾟДﾟ*)', 'error');
    });
}

function copyOutput() {
    var output = document.getElementById('output');
    output.select();
    navigator.clipboard.writeText(output.value).then(function() {
        setStatus('已复制到剪贴板~', 'success');
    }).catch(function() {
        document.execCommand('copy');
        setStatus('已复制到剪贴板~', 'success');
    });
}

function downloadOutput() {
    var content = document.getElementById('output').value;
    var jsContent = "var ENCRYPTED_CSV = '" + content.replace(/'/g, "\\'") + "';\n";
    var blob = new Blob([jsContent], { type: 'application/javascript' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'data-all.js';
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus('已开始下载 data-all.js，替换 js/data/data-all.js 即可', 'success');
}

(function() {
    var dropZone = document.getElementById('dropZone');
    var fileInput = document.getElementById('fileInput');
    var csvInput = document.getElementById('csvInput');
    var dropText = document.getElementById('dropText');

    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            readFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            readFile(fileInput.files[0]);
        }
    });

    function readFile(file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            csvInput.value = e.target.result;
            dropZone.classList.add('success');
            dropText.textContent = '读完了：' + file.name + '（' + e.target.result.split('\n').length + ' 行）';
            setStatus('读取完毕：' + file.name, 'success');
        };
        reader.onerror = function() {
            setStatus('文件读取失败 (；´д｀)', 'error');
        };
        reader.readAsText(file);
    }
})();