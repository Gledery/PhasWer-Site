// 图片处理工具（压缩 + 水印，上下可折叠）
var photos = [];
var photoCanvases = [];
var watermark = null;
var currentPosition = 'bottom-right';
var positionMode = 'single';
var renderDebounceTimer = null;
var renderBatchToken = 0;
var RENDER_BATCH_SIZE = 2;
var RENDER_DEBOUNCE_MS = 100;

// ============ 上传 ============
function setupImageUpload() {
    var input = document.getElementById('imagesInput');
    var uploadBox = document.getElementById('imagesUpload');

    uploadBox.addEventListener('click', function () { input.click(); });
    uploadBox.addEventListener('dragover', function (e) { e.preventDefault(); uploadBox.classList.add('dragover'); });
    uploadBox.addEventListener('dragleave', function (e) { e.preventDefault(); uploadBox.classList.remove('dragover'); });
    uploadBox.addEventListener('drop', function (e) {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
        var files = Array.from(e.dataTransfer.files).filter(function (f) {
            if (f.type.startsWith('image/')) return true;
            // HEIC/HEIF/TIFF 的 MIME 经常缺失，按扩展名兜底
            return Object.prototype.hasOwnProperty.call(WASM_DECODE_EXTS, getExt(f.name));
        });
        if (files.length > 0) addImages(files);
    });
    input.addEventListener('change', function (e) {
        var files = Array.from(e.target.files);
        if (files.length > 0) addImages(files);
        input.value = '';
    });
}

// 需要走 WASM 解码（浏览器原生 <img> 吃不掉）的扩展名
var WASM_DECODE_EXTS = { heic: 1, heif: 1, tif: 1, tiff: 1 };

function addImages(files) {
    var loaded = 0;
    var arr = new Array(files.length);
    files.forEach(function (file, index) {
        var ext = getExt(file.name);
        // 原生 <img> 能直接解码的格式：走 dataURL；HEIC/TIFF 等：先 WASM 解码成 dataURL
        decodeToFileURL(file, ext).then(function (result) {
            loadPhotoImage(result.dataURL, file, index, arr, done);
        }).catch(function () { done(); });
    });

    function done() {
        loaded++;
        if (loaded === files.length) {
            var valid = arr.filter(Boolean);
            if (valid.length > 0) {
                photos = photos.concat(valid);
                updateImagesUploadStatus();
                rebuildAllItems();
            }
        }
    }
}

// 把任意支持的文件统一解码成可塞进 <img> 的 dataURL
// 返回 { dataURL, originalIsJpeg }：原生格式直接 readAsDataURL；
// HEIC/HEIF/TIFF 先用 WASM 解码再包成 JPEG/PNG dataURL
function decodeToFileURL(file, ext) {
    if (WASM_DECODE_EXTS[ext]) {
        return file.arrayBuffer().then(function (buf) {
            if (ext === 'heic' || ext === 'heif') {
                return decodeHeicToDataURL(buf);
            }
            return decodeTiffToDataURL(buf);
        });
    }
    return readAsDataURL(file).then(function (dataURL) {
        return { dataURL: dataURL };
    });
}

function readAsDataURL(file) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (e) { resolve(e.target.result); };
        reader.onerror = function (e) { reject(e.target.error); };
        reader.readAsDataURL(file);
    });
}

// 由 dataURL 构造 <img>，成功后填入 arr[index]
function loadPhotoImage(dataURL, file, index, arr, done) {
    var img = new Image();
    img.onload = function () {
        var photo = {
            img: img,
            fileName: file.name,
            originalSize: file.size,
            originalExt: getExt(file.name),
            // 仅 JPEG 保留 dataURL（EXIF 写回需要）；其他格式不保留以节省内存（约原图 1.33 倍）
            originalDataURL: dataURL.indexOf('image/jpeg') !== -1 ? dataURL : null,
            originalIsJpeg: dataURL.indexOf('image/jpeg') !== -1,
            isHDR: false,               // 异步探测后置 true
            _hdrBadgeEl: null,          // 缓存徽标 DOM，探测完成时刷新
            exifKeep: null,        // null=跟随全局, true=强制保留, false=强制不保留
            exifOriginal: null,    // 原始 exifObj（懒加载）
            exifCurrent: null      // 编辑后的工作副本
        };
        arr[index] = photo;
        // 异步扫描文件头判断是否 HDR（HEIC/HEIF/AVIF 的 PQ/HLG）
        file.slice(0, 1048576).arrayBuffer().then(function (buf) {
            if (detectHDR(buf)) {
                photo.isHDR = true;
                if (photo._hdrBadgeEl) photo._hdrBadgeEl.style.display = '';
            }
        }).catch(function () {});
        done();
    };
    img.onerror = done;
    img.src = dataURL;
}

// 水印上传（可拖拽上传框）
function setupWatermarkUpload() {
    var box = document.getElementById('watermarkUploadBox');
    var input = document.getElementById('watermarkInput');
    var removeBtn = document.getElementById('removeWatermarkBtn');
    var text = document.getElementById('watermarkFileName');

    function loadWatermarkFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
            var img = new Image();
            img.onload = function () {
                watermark = img;
                text.textContent = file.name;
                box.classList.add('success');
                removeBtn.style.display = 'inline-block';
                input.value = '';
                scheduleRender();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    box.addEventListener('click', function (e) {
        if (e.target.closest('.remove-watermark-btn')) return;
        input.click();
    });

    box.addEventListener('dragover', function (e) { e.preventDefault(); box.classList.add('dragover'); });
    box.addEventListener('dragleave', function (e) { e.preventDefault(); box.classList.remove('dragover'); });
    box.addEventListener('drop', function (e) {
        e.preventDefault();
        box.classList.remove('dragover');
        var file = e.dataTransfer.files[0];
        loadWatermarkFile(file);
    });

    input.addEventListener('change', function (e) {
        loadWatermarkFile(e.target.files[0]);
    });

    removeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        watermark = null;
        text.textContent = '点击或拖拽水印图片';
        box.classList.remove('success');
        removeBtn.style.display = 'none';
        scheduleRender();
    });
}

function updateImagesUploadStatus() {
    var uploadBox = document.getElementById('imagesUpload');
    var title = document.getElementById('imagesUploadTitle');
    var hint = document.getElementById('imagesUploadHint');
    if (photos.length > 0) {
        uploadBox.classList.add('success');
        title.textContent = '已添加 ' + photos.length + ' 张图片';
        hint.textContent = '点击继续添加更多图片';
    } else {
        uploadBox.classList.remove('success');
        title.textContent = '添加图片';
        hint.textContent = '点击或拖拽图片到此处';
    }
    updateKeepMetaAvailability();
}

// 无 JPEG 时禁用 EXIF 保留
function updateKeepMetaAvailability() {
    var hasJpeg = photos.some(function (p) { return p.originalIsJpeg; });
    var checkbox = document.getElementById('keepMetaEnable');
    var bar = document.querySelector('.exif-bar');
    checkbox.disabled = !hasJpeg;
    bar.classList.toggle('disabled', !hasJpeg);
    if (!hasJpeg) checkbox.checked = false;
}

// ============ 开关状态 ============
function compressEnabled() {
    return document.getElementById('compressEnable').checked;
}

function watermarkEnabled() {
    return document.getElementById('watermarkEnable').checked;
}

// ============ 参数 ============
function getFormat() {
    var btn = document.querySelector('#formatSelect .pw-seg-btn.active');
    return btn ? btn.dataset.fmt : 'auto';
}

function setFormat(fmt) {
    document.querySelectorAll('#formatSelect .pw-seg-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.fmt === fmt);
    });
    updateHints();
}

function keepMetaEnabled() {
    var el = document.getElementById('keepMetaEnable');
    return !!(el && el.checked);
}

function getParams() {
    var qVal = document.getElementById('qualityInput').value;
    return {
        format: getFormat(),
        quality: (parseInt(qVal) || 99) / 100,
        resizeEnabled: document.getElementById('resizeEnable').checked,
        resizeMax: parseInt(document.getElementById('resizeInput').value) || 1920,
        keepMeta: keepMetaEnabled(),
        size: parseInt(document.getElementById('sizeInput').value) || 20,
        opacity: (parseInt(document.getElementById('opacityInput').value) || 50) / 100,
        rotation: (parseInt(document.getElementById('rotationInput').value) || 0) * Math.PI / 180,
        offsetX: parseInt(document.getElementById('offsetXInput').value) || 0,
        offsetY: parseInt(document.getElementById('offsetYInput').value) || 0,
        padding: parseInt(document.getElementById('paddingInput').value) || 20,
        tileSpacing: parseInt(document.getElementById('tileSpacingInput').value) || 50
    };
}

function getExt(fileName) {
    var m = (fileName || '').toLowerCase().match(/\.([a-z0-9]+)$/);
    return m ? m[1] : '';
}

// 扫描文件头判断是否为 HDR 内容（HEIC/HEIF/AVIF 等 ISOBMFF 容器）
// 原理：查找 colr/nclx 颜色信息盒，读取其中的 transfer_characteristics；
// 值为 16(PQ) 或 18(HLG) 即 HDR。普通 SDR 的 HEIC/AVIF 不会被误判。
// 注：JPEG 的 Ultra HDR 增益图（ISO 21496-1）不含此盒，暂不识别。
function detectHDR(arrayBuffer) {
    var b = new Uint8Array(arrayBuffer);
    var n = b.length;
    for (var i = 0; i + 11 < n; i++) {
        // "colr"
        if (b[i] === 0x63 && b[i + 1] === 0x6F && b[i + 2] === 0x6C && b[i + 3] === 0x72) {
            // "nclx"
            if (b[i + 4] === 0x6E && b[i + 5] === 0x63 && b[i + 6] === 0x6C && b[i + 7] === 0x78) {
                var transfer = (b[i + 10] << 8) | b[i + 11]; // transfer_characteristics（大端 uint16）
                if (transfer === 16 || transfer === 18) return true; // PQ 或 HLG
            }
        }
    }
    return false;
}

// 压缩关闭时，按原图格式近无损输出
function getOutputMime(photo) {
    if (compressEnabled()) {
        var fmt = getFormat();
        if (fmt !== 'auto') return fmt;
    }
    switch (photo.originalExt) {
        case 'jpg': case 'jpeg': return 'image/jpeg';
        case 'webp': return 'image/webp';
        case 'avif': return 'image/avif';
        case 'png': return 'image/png';
        case 'heic': case 'heif':           // WASM 解码后已是 JPEG 中间格式，按 JPEG 输出避免二次转码
            return 'image/jpeg';
        case 'gif': case 'bmp':
        case 'tif': case 'tiff': return 'image/png';
        default: return 'image/jpeg';
    }
}

function getEffectiveQuality() {
    if (!compressEnabled()) return 0.95;
    return getParams().quality;
}

// 质量模式：fixed=固定质量滑块，adaptive=自适应搜索
function getQualityMode() {
    var btn = document.querySelector('#qualityModeSelect .pw-seg-btn.active');
    return btn ? btn.dataset.mode : 'fixed';
}

function getAdaptiveLevel() {
    var btn = document.querySelector('#adaptiveLevelSelect .pw-seg-btn.active');
    return btn ? btn.dataset.level : 'balanced';
}

// 各格式的说明文案（格式 hint），含格式相关的质量行为提示
var FORMAT_HINTS = {
    'auto':       '「自动」按原图格式输出',
    'image/jpeg': '有损压缩，适合照片与渐变色，兼容性最好且能保留 EXIF 信息',
    'image/webp': '提供更高的压缩率，现代浏览器通用的格式',
    'image/avif': '压缩率最高（同画质比 JPEG/WebP 再小 30%-50%），编码较慢，固定模式 80 约等于 JPEG 的 95',
    'image/png':  '无损格式，支持透明图。98 以上为无损；降低将做 256 色量化（照片达不到质量门槛时自动保持无损）'
};

// 质量提示：固定模式描述滑块，自适应模式只描述当前选中的档位
var QUALITY_HINT_FIXED = '越高画质越好，体积越大。95 以上几乎与原图无差别';
var QUALITY_HINT_ADAPTIVE = {
    high:     '接近视觉无损并留有充足的编辑空间',
    balanced: '在体积与画质之间尽量平衡',
    small:    '至稍微可察觉的程度，体积最小'
};

// 统一刷新所有动态 hint（格式 hint + 质量 hint）
function updateHints() {
    var fmt = getFormat();
    var fh = document.getElementById('formatHint');
    if (fh) fh.textContent = FORMAT_HINTS[fmt] || FORMAT_HINTS['auto'];
    var qh = document.getElementById('qualityHint');
    if (qh) {
        if (getQualityMode() === 'adaptive') {
            qh.textContent = QUALITY_HINT_ADAPTIVE[getAdaptiveLevel()] || QUALITY_HINT_ADAPTIVE.balanced;
        } else {
            qh.textContent = QUALITY_HINT_FIXED;
        }
    }
}

function setQualityMode(mode) {
    document.querySelectorAll('#qualityModeSelect .pw-seg-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.mode === mode);
    });
    var isAdaptive = mode === 'adaptive';
    document.getElementById('qualitySliderRow').style.display = isAdaptive ? 'none' : '';
    document.getElementById('adaptiveLevelSelect').style.display = isAdaptive ? '' : 'none';
    updateHints();
    scheduleRender();
}

function extFromMime(mime) {
    switch (mime) {
        case 'image/jpeg': return 'jpg';
        case 'image/webp': return 'webp';
        case 'image/avif': return 'avif';
        default: return 'png';
    }
}

// ============ 元数据（EXIF）保留 ============
var PIEXIF_URLS = [
    'https://cdn.jsdelivr.net/npm/piexifjs@1.0.6/piexif.min.js',
    'https://unpkg.com/piexifjs@1.0.6/piexif.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/piexifjs/1.0.6/piexif.min.js'
];
var piexifPromise = null;

function ensurePiexif() {
    if (typeof piexif !== 'undefined') return Promise.resolve();
    if (piexifPromise) return piexifPromise;
    piexifPromise = loadScript(PIEXIF_URLS, 0).catch(function (e) {
        piexifPromise = null;
        throw e;
    });
    return piexifPromise;
}

// ============ PNG 无损优化（oxipng） ============
// 原理：浏览器 canvas 导出的 PNG 用的是最朴素的 zlib + 默认滤镜，体积偏大。
// oxipng 会逐行尝试全部滤镜并用类 zopfli 的极致 deflate 重压，全程像素不变，
// 典型可比原生 PNG 小 15%-30%。它是 ESM 模块，故用动态 import() 懒加载。
var OXIPNG_URLS = [
    'https://esm.sh/@jsquash/oxipng@2.3.0',
    'https://cdn.jsdelivr.net/npm/@jsquash/oxipng@2.3.0/+esm'
];
var oxipngPromise = null;

function ensureOxipng() {
    if (oxipngPromise) return oxipngPromise;
    var i = 0;
    function tryNext() {
        if (i >= OXIPNG_URLS.length) {
            oxipngPromise = null;
            return Promise.reject(new Error('oxipng 所有 CDN 均失败'));
        }
        var url = OXIPNG_URLS[i++];
        return import(url).then(function (mod) {
            if (mod && typeof mod.optimise === 'function') return mod.optimise;
            if (mod && typeof mod.default === 'function') return mod.default;
            throw new Error('oxipng 模块缺少 optimise 导出');
        }).catch(function () { return tryNext(); });
    }
    oxipngPromise = tryNext().catch(function (e) {
        oxipngPromise = null;
        throw e;
    });
    return oxipngPromise;
}

// 对 PNG blob 做无损优化；任何失败或优化后反而变大都回退原 blob
function optimizePngWithOxipng(blob) {
    if (blob.type !== 'image/png') return Promise.resolve(blob);
    return ensureOxipng().then(function (optimise) {
        return blob.arrayBuffer().then(function (buf) {
            return optimise(new Uint8Array(buf), { level: 3, interlace: false, optimizeAlpha: true });
        }).then(function (out) {
            var opt = new Blob([out], { type: 'image/png' });
            return opt.size < blob.size ? opt : blob;
        });
    }).catch(function () { return blob; });
}

// ============ PNG 有损量化（imagequant / libimagequant WASM） ============
// 原理：把真彩 PNG 降为 256 色调色板（8-bit indexed），用 libimagequant 挑选
// 最佳调色板 + 误差扩散抖动，视觉损失极小但体积可降 60%-80%（正是 pngquant
// 的核心算法）。set_quality(min, target) 带质量门槛：若实际量化质量达不到 min
// 会自动抛错中止——照片类图像会因此安全回退到无损路径，不会出现难看的色带。
var IMAGEQUANT_URLS = [
    'https://esm.sh/imagequant@0.1.2'
];
var imagequantPromise = null;

function ensureImagequant() {
    if (imagequantPromise) return imagequantPromise;
    var i = 0;
    function tryNext() {
        if (i >= IMAGEQUANT_URLS.length) {
            imagequantPromise = null;
            return Promise.reject(new Error('imagequant 所有 CDN 均失败'));
        }
        var url = IMAGEQUANT_URLS[i++];
        return import(url).then(function (mod) {
            if (mod && mod.Imagequant && mod.ImagequantImage) return mod;
            throw new Error('imagequant 模块缺少导出');
        }).catch(function () { return tryNext(); });
    }
    imagequantPromise = tryNext().catch(function (e) {
        imagequantPromise = null;
        throw e;
    });
    return imagequantPromise;
}

// 取画布 RGBA 像素做有损量化，返回 PNG blob；失败/中止时 reject 由调用方兜底
function quantizePngWithImagequant(canvas, quality) {
    var ctx = canvas.getContext('2d');
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = new Uint8Array(imgData.data.buffer);
    return ensureImagequant().then(function (mod) {
        var inst = new mod.Imagequant();
        // min 留 10 分 slack，达不到 min 则中止（安全网）
        inst.set_quality(Math.max(0, quality - 10), quality);
        inst.set_speed(4);
        var image = new mod.ImagequantImage(pixels, canvas.width, canvas.height, 0);
        var out;
        try {
            out = inst.process(image); // 返回量化后的 PNG 字节
        } finally {
            if (image.free) image.free();
            if (inst.free) inst.free();
        }
        return new Blob([out], { type: 'image/png' });
    });
}

// ============ AVIF 编码（@jsquash/avif） ============
// AVIF 基于 AV1，是目前压缩率最高的实用图像格式，同画质比 JPEG/WebP 再小 30%-50%。
// 浏览器原生不支持 canvas 导出 AVIF，故必须走 WASM 编解码器。
// 编码较慢（尤其大图），所以默认放在自适应管线里按需调用，并保留 WebP 回退。
var AVIF_URLS = [
    'https://esm.sh/@jsquash/avif@2.1.1',
    'https://cdn.jsdelivr.net/npm/@jsquash/avif@2.1.1/+esm'
];
var avifPromise = null;

function ensureAvif() {
    if (avifPromise) return avifPromise;
    var i = 0;
    function tryNext() {
        if (i >= AVIF_URLS.length) {
            avifPromise = null;
            return Promise.reject(new Error('avif 所有 CDN 均失败'));
        }
        var url = AVIF_URLS[i++];
        return import(url).then(function (mod) {
            // @jsquash/avif 导出 encode 为 default
            var enc = mod && (mod.default || mod.encode);
            if (typeof enc === 'function') return enc;
            throw new Error('avif 模块缺少 encode 导出');
        }).catch(function () { return tryNext(); });
    }
    avifPromise = tryNext().catch(function (e) {
        avifPromise = null;
        throw e;
    });
    return avifPromise;
}

// 用 AVIF 编码 canvas，返回 blob；失败时 reject 由调用方回退
function encodeAvif(canvas, quality) {
    var ctx = canvas.getContext('2d');
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return ensureAvif().then(function (encode) {
        // AVIF quality 0-100（整数），speed 6 = 均衡档（0 最慢最好，10 最快最差）
        return encode(imgData, { quality: quality, speed: 6, subsample: 1 });
    }).then(function (buf) {
        return new Blob([buf], { type: 'image/avif' });
    });
}

// ============ HEIC/HEIF 解码（heic2any，基于 libheif WASM） ============
// 用途：Chrome/Edge/Firefox 桌面端原生 <img> 解不了 HEIC（仅 Safari 可以），
// 故输入侧先用 heic2any 把它解码并转成 JPEG Blob，再走原本的 dataURL 管线。
// 首次使用时从 CDN 拉取（约 500KB），失败直接抛错（调用方会跳过该文件）。
var HEIC2ANY_URLS = [
    'https://esm.sh/heic2any@0.0.4',
    'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/+esm'
];
var heic2anyPromise = null;

function ensureHeic2any() {
    if (heic2anyPromise) return heic2anyPromise;
    var i = 0;
    function tryNext() {
        if (i >= HEIC2ANY_URLS.length) {
            heic2anyPromise = null;
            return Promise.reject(new Error('heic2any 所有 CDN 均失败'));
        }
        var url = HEIC2ANY_URLS[i++];
        return import(url).then(function (mod) {
            var fn = mod && (mod.default || mod);
            if (typeof fn === 'function') return fn;
            throw new Error('heic2any 模块缺少导出');
        }).catch(function () { return tryNext(); });
    }
    heic2anyPromise = tryNext().catch(function (e) {
        heic2anyPromise = null;
        throw e;
    });
    return heic2anyPromise;
}

// 解码 HEIC/HEIF ArrayBuffer → JPEG dataURL（带 type 标识，便于后续 EXIF 判断）
function decodeHeicToDataURL(buf) {
    var blob = new Blob([buf]);
    return ensureHeic2any().then(function (heic2any) {
        // 输出 JPEG（单张），质量拉高以作为"中间格式"几乎无损
        return heic2any({ blob: blob, toType: 'image/jpeg', quality: 0.95 });
    }).then(function (out) {
        var outBlob = Array.isArray(out) ? out[0] : out;
        return blobToDataURL(outBlob).then(function (dataURL) {
            return { dataURL: dataURL };
        });
    });
}

// ============ TIFF 解码（UTIF.js） ============
// 用途：浏览器原生不支持 TIFF 显示，用 UTIF 解析后画到 canvas 再导出 PNG dataURL。
var UTIF_URLS = [
    'https://cdn.jsdelivr.net/npm/utif@3.1.0/UTIF.js',
    'https://unpkg.com/utif@3.1.0/UTIF.js'
];
var utifPromise = null;

function ensureUTIF() {
    if (typeof UTIF !== 'undefined') return Promise.resolve();
    if (utifPromise) return utifPromise;
    utifPromise = loadScript(UTIF_URLS, 0).catch(function (e) {
        utifPromise = null;
        throw e;
    });
    return utifPromise;
}

// 解码 TIFF ArrayBuffer → PNG dataURL（TIFF 多为无损存储，故保持 PNG 输出）
function decodeTiffToDataURL(buf) {
    return ensureUTIF().then(function () {
        var ifds = UTIF.decode(buf);
        if (!ifds || ifds.length === 0) throw new Error('TIFF 无 IFD');
        var first = ifds[0];
        UTIF.decodeImage(buf, first);
        var rgba = UTIF.toRGBA8(first);     // Uint8Array RGBA
        var w = first.width, h = first.height;
        var canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        var ctx = canvas.getContext('2d');
        var imgData = ctx.createImageData(w, h);
        imgData.data.set(rgba);
        ctx.putImageData(imgData, 0, 0);
        return canvas.toDataURL('image/png');
    }).then(function (dataURL) {
        return { dataURL: dataURL };
    });
}

// Blob → dataURL 通用工具
function blobToDataURL(blob) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (e) { resolve(e.target.result); };
        reader.onerror = function (e) { reject(e.target.error); };
        reader.readAsDataURL(blob);
    });
}

// 单图保留元数据：优先取单图覆盖，否则取全局
function getEffectiveKeepMeta(photo) {
    if (photo.exifKeep !== null && photo.exifKeep !== undefined) return photo.exifKeep;
    return keepMetaEnabled();
}

// 深拷贝 exifObj（仅 IFD，thumbnail 单独引用）
function cloneExif(exifObj) {
    var clone = {};
    ['0th', 'Exif', 'GPS', 'Interop', '1st'].forEach(function (ifd) {
        clone[ifd] = exifObj[ifd] ? JSON.parse(JSON.stringify(exifObj[ifd])) : {};
    });
    clone.thumbnail = exifObj.thumbnail || null;
    return clone;
}

// 懒加载某图的 EXIF（返回 Promise<exifObj>）
function loadExifForPhoto(photo) {
    if (photo.exifCurrent) return Promise.resolve(photo.exifCurrent);
    return ensurePiexif().then(function () {
        try {
            photo.exifOriginal = piexif.load(photo.originalDataURL);
            photo.exifCurrent = cloneExif(photo.exifOriginal);
            return photo.exifCurrent;
        } catch (e) {
            return null;
        }
    }).catch(function () { return null; });
}

// 可编辑字段配置（文本类）
var EXIF_EDIT_FIELDS = [
    { ifd: '0th', tag: 271, label: '品牌' },
    { ifd: '0th', tag: 272, label: '型号' },
    { ifd: '0th', tag: 305, label: '软件' },
    { ifd: '0th', tag: 306, label: '修改时间' },
    { ifd: 'Exif', tag: 36867, label: '拍摄时间' },
    { ifd: 'Exif', tag: 42036, label: '镜头' }
];
// 只读字段配置（数值类，格式化展示）
var EXIF_READONLY_FIELDS = [
    { ifd: 'Exif', tag: 33437, label: '光圈', format: function (v) { return v ? 'f/' + (v[0] / v[1]) : ''; } },
    { ifd: 'Exif', tag: 33434, label: '快门', format: function (v) { if (!v) return ''; return v[1] === 1 ? v[0] + 's' : '1/' + Math.round(v[1] / v[0]) + 's'; } },
    { ifd: 'Exif', tag: 34855, label: 'ISO', format: function (v) { return v != null ? String(v) : ''; } },
    { ifd: 'Exif', tag: 37386, label: '焦距', format: function (v) { return v ? (v[0] / v[1]) + 'mm' : ''; } }
];

function getExifSummary(exifObj) {
    if (!exifObj) return '无 EXIF 数据';
    var parts = [];
    var make = exifObj['0th'] && exifObj['0th'][271];
    var model = exifObj['0th'] && exifObj['0th'][272];
    if (make || model) parts.push(((make || '') + ' ' + (model || '')).trim());
    var date = exifObj['Exif'] && exifObj['Exif'][36867];
    if (date) parts.push(date);
    var hasGPS = exifObj['GPS'] && Object.keys(exifObj['GPS']).length > 0;
    if (hasGPS) parts.push('📍含定位');
    return parts.length > 0 ? parts.join(' · ') : '无关键信息';
}

function toggleExifPanel(index) {
    var photo = photos[index];
    if (!photo || !photo.originalIsJpeg) return;
    var panel = document.getElementById('exifPanel-' + index);
    var toggle = document.getElementById('exifToggle-' + index);
    if (!panel) return;
    var isOpen = panel.classList.contains('open');
    if (isOpen) {
        panel.classList.remove('open');
        toggle.classList.remove('open');
        return;
    }
    panel.classList.add('open');
    toggle.classList.add('open');
    if (panel.dataset.built === '1') return; // 已构建过
    loadExifForPhoto(photo).then(function (exifObj) {
        buildExifPanel(index, photo, exifObj);
    });
}

function buildExifPanel(index, photo, exifObj) {
    var panel = document.getElementById('exifPanel-' + index);

    // 面板内只放字段
    panel.innerHTML = '';
    panel.dataset.built = '1';
    if (!exifObj) {
        panel.innerHTML = '<div class="exif-empty">该图片没有 EXIF 数据</div>';
        return;
    }

    var fieldsWrap = document.createElement('div');
    fieldsWrap.className = 'exif-fields';
    EXIF_EDIT_FIELDS.forEach(function (f) {
        var val = exifObj[f.ifd] && exifObj[f.ifd][f.tag];
        if (val === undefined || val === null) return;
        var row = document.createElement('div');
        row.className = 'exif-field';
        row.innerHTML = '<label>' + f.label + '</label>';
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'exif-field-input';
        input.value = val;
        input.addEventListener('input', function () {
            if (!photo.exifCurrent) return;
            if (!photo.exifCurrent[f.ifd]) photo.exifCurrent[f.ifd] = {};
            photo.exifCurrent[f.ifd][f.tag] = this.value;
        });
        row.appendChild(input);
        fieldsWrap.appendChild(row);
    });

    EXIF_READONLY_FIELDS.forEach(function (f) {
        var val = exifObj[f.ifd] && exifObj[f.ifd][f.tag];
        if (val === undefined || val === null) return;
        var text = f.format(val);
        if (!text) return;
        var row = document.createElement('div');
        row.className = 'exif-field exif-readonly';
        row.innerHTML = '<label>' + f.label + '</label><span class="exif-field-val">' + text + '</span>';
        fieldsWrap.appendChild(row);
    });
    if (fieldsWrap.children.length > 0) panel.appendChild(fieldsWrap);
    else panel.innerHTML = '<div class="exif-empty">无可编辑字段</div>';
}

function dataURLToBlob(dataURL) {
    return fetch(dataURL).then(function (r) { return r.blob(); });
}

function buildOutputBlob(photo, canvas, mime, quality) {
    return new Promise(function (resolve) {
        canvas.toBlob(function (blob) { resolve(blob); }, mime, quality);
    }).then(function (blob) {
        if (!blob) return null;
        return applyExifIfNeeded(photo, blob, mime);
    });
}

// 取 PNG 量化目标质量（0-100）：固定模式用滑块，自适应模式按档位映射
function getPngQuantQuality() {
    if (getQualityMode() === 'adaptive') {
        var map = { high: 88, balanced: 72, small: 55 };
        return map[getAdaptiveLevel()] || 72;
    }
    return Math.round(getEffectiveQuality() * 100);
}

// PNG 专用输出：有损量化（imagequant）→ 无损重压（oxipng），任何环节失败回退原生
function finalizePng(photo, blob) {
    return optimizePngWithOxipng(blob).then(function (opt) {
        return applyExifIfNeeded(photo, opt, 'image/png');
    });
}

function buildPngOutput(photo, canvas) {
    var q = getPngQuantQuality();
    var step;
    if (q >= 98) {
        // 接近无损：跳过量化，直接原生 PNG 再 oxipng 重压
        step = new Promise(function (resolve) {
            canvas.toBlob(function (blob) { resolve(blob); }, 'image/png');
        });
    } else {
        // 有损量化；imagequant 不可用或质量门槛未过会 reject，随后回退原生
        step = quantizePngWithImagequant(canvas, q).catch(function () {
            return new Promise(function (resolve) {
                canvas.toBlob(function (blob) { resolve(blob); }, 'image/png');
            });
        });
    }
    return step.then(function (blob) {
        if (!blob) return null;
        return finalizePng(photo, blob);
    });
}

// 把 EXIF（含可编辑字段）写回 JPEG 输出；非 JPEG 或不保留时原样返回
function applyExifIfNeeded(photo, blob, mime) {
    var keepMeta = getEffectiveKeepMeta(photo);
    if (!keepMeta || !photo.originalIsJpeg || mime !== 'image/jpeg' || !photo.originalDataURL) {
        return Promise.resolve(blob);
    }
    return ensurePiexif().then(function () {
        return blobToDataURL(blob).then(function (outDataURL) {
            // 优先用编辑后的工作副本，否则读原图
            var exifObj = photo.exifCurrent || piexif.load(photo.originalDataURL);
            var exifBytes = piexif.dump(exifObj);
            return dataURLToBlob(piexif.insert(exifBytes, outDataURL));
        });
    }).catch(function () { return blob; });
}

// ============ 自适应压缩 ============
// 原理：对同一张图在多个质量下反复编码，再把结果解码回像素与渲染结果逐像素比对，
// 用 PSNR（峰值信噪比）衡量失真。二分查找"刚好低于肉眼可察觉阈值"的最低质量，
// 从而在保证视觉无损的前提下拿到最小体积。纯浏览器 canvas API，无外部依赖。
//
// 性能优化：比对在缩小版画布（≤200px）上进行，缩小后 PSNR 约高 7dB（已校准），
// 编码/解码/PSNR 的计算量降低约 100 倍；最终输出再按找到的质量一次性编码完整画布。
var ADAPTIVE_LEVELS = {
    high:     { psnr: 50, lo: 0.55, hi: 0.98 }, // 接近视觉无损，导入 PS 难辨差别
    balanced: { psnr: 43, lo: 0.35, hi: 0.92 }, // 画质优秀，体积大幅下降（推荐）
    small:    { psnr: 36, lo: 0.20, hi: 0.85 }  // 压至肉眼刚可察觉，体积最小
};

var ADAPTIVE_SAMPLE_SIZE = 200; // 比对画布最大边长
var PSNR_CALIBRATION = 7;       // 小画布 PSNR 上偏校准（dB）

function canvasToBlob(canvas, mime, quality) {
    return new Promise(function (resolve) {
        canvas.toBlob(function (blob) { resolve(blob); }, mime, quality);
    });
}

// 把 blob 解码回 ImageData 以便逐像素比对
function blobToImageData(blob) {
    if (typeof createImageBitmap === 'function') {
        return createImageBitmap(blob).then(function (bmp) {
            var c = document.createElement('canvas');
            c.width = bmp.width; c.height = bmp.height;
            var ctx = c.getContext('2d');
            ctx.drawImage(bmp, 0, 0);
            var data = ctx.getImageData(0, 0, c.width, c.height);
            if (bmp.close) bmp.close();
            return data;
        });
    }
    return new Promise(function (resolve, reject) {
        var url = URL.createObjectURL(blob);
        var img = new Image();
        img.onload = function () {
            var c = document.createElement('canvas');
            c.width = img.width; c.height = img.height;
            var ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(ctx.getImageData(0, 0, c.width, c.height));
        };
        img.onerror = function () { URL.revokeObjectURL(url); reject(); };
        img.src = url;
    });
}

// 计算两份 ImageData 之间的 PSNR（dB）。越高越接近原图，100 表示完全一致
function computePSNR(truthData, compData) {
    var a = truthData.data, b = compData.data;
    var n = a.length;
    var sum = 0;
    for (var i = 0; i < n; i++) {
        var d = a[i] - b[i];
        sum += d * d;
    }
    var mse = sum / n;
    if (mse <= 1e-6) return 100;
    return 10 * Math.log10((255 * 255) / mse);
}

// 让出主线程一帧，避免连续 Promise 链阻塞 UI
function yieldToMain() {
    return new Promise(function (resolve) { requestAnimationFrame(resolve); });
}

// 二分搜索：在缩小版画布上快速找到最优质量，再一次性编码完整画布
function adaptiveSearch(canvas, mime, targetPsnr, lo, hi) {
    // 1. 构建缩小版比对画布（与渲染结果同比例）
    var maxDim = Math.max(canvas.width, canvas.height);
    var scale = maxDim > ADAPTIVE_SAMPLE_SIZE ? ADAPTIVE_SAMPLE_SIZE / maxDim : 1;
    var sw = Math.max(1, Math.round(canvas.width * scale));
    var sh = Math.max(1, Math.round(canvas.height * scale));

    var sCanvas = document.createElement('canvas');
    sCanvas.width = sw;
    sCanvas.height = sh;
    var sCtx = sCanvas.getContext('2d');
    sCtx.drawImage(canvas, 0, 0, sw, sh);
    var truth = sCtx.getImageData(0, 0, sw, sh);

    // 2. 小画布的 PSNR 比全图高约 PSNR_CALIBRATION dB，校准目标值
    var smallTarget = targetPsnr + PSNR_CALIBRATION;
    var bestQuality = null;
    var iter = 0;
    var MAX_ITER = 5;

    function testSmall(q) {
        return canvasToBlob(sCanvas, mime, q).then(function (blob) {
            if (!blob) return { q: q, psnr: 0 };
            return blobToImageData(blob).then(function (comp) {
                return { q: q, psnr: computePSNR(truth, comp) };
            }).catch(function () { return { q: q, psnr: 0 }; });
        });
    }

    function step() {
        if (iter >= MAX_ITER || hi - lo < 0.04) {
            // 3. 用找到的最优质量一次性编码完整画布
            var finalQ = bestQuality != null ? bestQuality : hi;
            return canvasToBlob(canvas, mime, finalQ);
        }
        iter++;
        var q = (lo + hi) / 2;
        return testSmall(q).then(function (r) {
            if (r.psnr >= smallTarget) { bestQuality = q; hi = q; }
            else { lo = q; }
            return yieldToMain().then(step); // 让出主线程，避免卡顿
        });
    }

    return step();
}

// 取 AVIF 目标质量（0-100）：固定模式用滑块，自适应模式按档位映射
function getAvifQuality() {
    if (getQualityMode() === 'adaptive') {
        var map = { high: 78, balanced: 62, small: 45 };
        return map[getAdaptiveLevel()] || 62;
    }
    return Math.round(getEffectiveQuality() * 100);
}

// 按当前模式产出最终 blob（自适应模式自动搜索，固定模式用滑块质量）
function buildOutputBlobSmart(photo, canvas, mime) {
    if (mime === 'image/png') {
        return buildPngOutput(photo, canvas);
    }
    if (mime === 'image/avif') {
        var aq = getAvifQuality();
        // AVIF 编码慢，不做多轮搜索；失败回退 WebP
        return encodeAvif(canvas, aq).then(function (blob) {
            return applyExifIfNeeded(photo, blob, mime);
        }).catch(function () {
            return buildOutputBlobSmart(photo, canvas, 'image/webp');
        });
    }
    if (getQualityMode() === 'adaptive') {
        var lv = ADAPTIVE_LEVELS[getAdaptiveLevel()] || ADAPTIVE_LEVELS.balanced;
        return adaptiveSearch(canvas, mime, lv.psnr, lv.lo, lv.hi).then(function (blob) {
            if (!blob) return null;
            return applyExifIfNeeded(photo, blob, mime);
        });
    }
    return buildOutputBlob(photo, canvas, mime, getEffectiveQuality());
}

// ============ 水印位置 ============
function selectPosition(pos) {
    currentPosition = pos;
    document.querySelectorAll('.position-cell').forEach(function (c) {
        c.classList.toggle('active', c.dataset.pos === pos);
    });
    scheduleRender();
}

function setPositionMode(mode) {
    positionMode = mode;
    document.querySelectorAll('#positionModeSelect .pw-seg-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.mode === mode);
    });

    var isTile = mode === 'tile';
    document.getElementById('positionGrid').style.display = isTile ? 'none' : 'grid';
    document.getElementById('paddingGroup').classList.toggle('disabled', isTile);
    document.getElementById('tileSpacingGroup').classList.toggle('disabled', !isTile);
    document.getElementById('offsetXGroup').classList.toggle('disabled', isTile);
    document.getElementById('offsetYGroup').classList.toggle('disabled', isTile);

    scheduleRender();
}

function calcPosition(canvasW, canvasH, wmWidth, wmHeight, padding) {
    var x = 0, y = 0;
    switch (currentPosition) {
        case 'top-left':       x = padding; y = padding; break;
        case 'top-center':     x = (canvasW - wmWidth) / 2; y = padding; break;
        case 'top-right':      x = canvasW - wmWidth - padding; y = padding; break;
        case 'center-left':    x = padding; y = (canvasH - wmHeight) / 2; break;
        case 'center':         x = (canvasW - wmWidth) / 2; y = (canvasH - wmHeight) / 2; break;
        case 'center-right':   x = canvasW - wmWidth - padding; y = (canvasH - wmHeight) / 2; break;
        case 'bottom-left':    x = padding; y = canvasH - wmHeight - padding; break;
        case 'bottom-center':  x = (canvasW - wmWidth) / 2; y = canvasH - wmHeight - padding; break;
        case 'bottom-right':   x = canvasW - wmWidth - padding; y = canvasH - wmHeight - padding; break;
    }
    return { x: x, y: y };
}

function renderWatermark(ctx, canvasW, canvasH, params) {
    if (!watermark || !watermark.width || !watermark.height) return;

    var maxWidth = canvasW * params.size / 100;
    if (maxWidth <= 0) return;
    var scale = maxWidth / watermark.width;
    var wmW = watermark.width * scale;
    var wmH = watermark.height * scale;

    ctx.save();
    ctx.globalAlpha = params.opacity;

    if (positionMode === 'tile') {
        var spacing = params.tileSpacing;
        var stepX = wmW + spacing;
        var stepY = wmH + spacing;
        for (var ty = -wmH; ty < canvasH + wmH; ty += stepY) {
            for (var tx = -wmW; tx < canvasW + wmW; tx += stepX) {
                ctx.save();
                ctx.translate(tx + wmW / 2, ty + wmH / 2);
                ctx.rotate(params.rotation);
                ctx.drawImage(watermark, -wmW / 2, -wmH / 2, wmW, wmH);
                ctx.restore();
            }
        }
    } else {
        var pos = calcPosition(canvasW, canvasH, wmW, wmH, params.padding);
        ctx.translate(pos.x + params.offsetX + wmW / 2, pos.y + params.offsetY + wmH / 2);
        ctx.rotate(params.rotation);
        ctx.drawImage(watermark, -wmW / 2, -wmH / 2, wmW, wmH);
    }

    ctx.restore();
}

// ============ 渲染 ============
function renderImageToCanvas(photo, canvas) {
    var params = getParams();
    var doCompress = compressEnabled();
    var doWatermark = watermarkEnabled();

    var w = photo.img.width, h = photo.img.height;
    var tw = w, th = h;

    // 仅在压缩启用时才缩放
    if (doCompress && params.resizeEnabled && Math.max(w, h) > params.resizeMax) {
        var scale = params.resizeMax / Math.max(w, h);
        tw = Math.max(1, Math.round(w * scale));
        th = Math.max(1, Math.round(h * scale));
    }

    canvas.width = tw;
    canvas.height = th;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, tw, th);
    if (getOutputMime(photo) === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, tw, th);
    }
    ctx.drawImage(photo.img, 0, 0, tw, th);

    // 仅在水印启用且有水印图时才叠加
    if (doWatermark && watermark) {
        renderWatermark(ctx, tw, th, params);
    }
}

function generateBlobFor(photo, canvas, index) {
    photo.renderToken = (photo.renderToken || 0) + 1;
    var token = photo.renderToken;
    var mime = getOutputMime(photo);
    buildOutputBlobSmart(photo, canvas, mime).then(function (blob) {
        if (photo.renderToken !== token) return;
        photo.blob = blob;
        photo.outMime = mime;
        photo.compressedSize = blob ? blob.size : 0;
        updateSizeDOM(index);
        updateSummary();
        updateActionButtons();
    });
}

function rebuildAllItems() {
    if (photos.length === 0) {
        document.getElementById('previewGrid').style.display = 'none';
        document.getElementById('summaryBar').style.display = 'none';
        document.getElementById('placeholder').style.display = 'block';
        document.getElementById('renameSection').style.display = 'none';
        updateActionButtons();
        return;
    }

    document.getElementById('placeholder').style.display = 'none';
    document.getElementById('previewGrid').style.display = 'grid';
    document.getElementById('renameSection').style.display = 'flex';
    document.getElementById('summaryBar').style.display = 'flex';

    var previewGrid = document.getElementById('previewGrid');
    previewGrid.innerHTML = '';
    photoCanvases = [];

    photos.forEach(function (photo, index) {
        var item = document.createElement('div');
        item.className = 'preview-item';

        var nameRow = document.createElement('div');
        nameRow.className = 'preview-name-row';

        var nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'preview-name-input';
        // 恢复之前输入的自定义名（如果有），否则用原文件名
        nameInput.value = photo.customName || photo.fileName.replace(/\.[^.]+$/, '');
        nameInput.placeholder = '文件名';
        nameInput.addEventListener('input', function () { photo.customName = this.value; });
        nameRow.appendChild(nameInput);

        // 重置文件名按钮
        var resetBtn = document.createElement('button');
        resetBtn.className = 'reset-name-btn';
        resetBtn.type = 'button';
        resetBtn.title = '重置文件名';
        resetBtn.textContent = '↺';
        resetBtn.onclick = function () {
            photo.customName = '';
            nameInput.value = photo.fileName.replace(/\.[^.]+$/, '');
        };
        nameRow.appendChild(resetBtn);

        var removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '✕';
        removeBtn.onclick = function () { removePhoto(index); };
        nameRow.appendChild(removeBtn);
        item.appendChild(nameRow);

        // 图片信息（尺寸、格式）
        var info = document.createElement('div');
        info.className = 'preview-info';
        var fmt = photo.originalExt.toUpperCase();
        info.textContent = photo.img.width + '×' + photo.img.height + ' · ' + fmt;

        // HDR 徽标（探测到 HDR / 广色域时显示）
        var hdrBadge = document.createElement('span');
        hdrBadge.className = 'preview-hdr-badge';
        hdrBadge.textContent = 'HDR';
        hdrBadge.title = '检测到 HDR / 广色域内容，浏览器已自动色调映射为 SDR（标准动态范围）处理';
        hdrBadge.style.display = photo.isHDR ? '' : 'none';
        photo._hdrBadgeEl = hdrBadge;
        info.appendChild(hdrBadge);
        item.appendChild(info);

        // JPEG 才显示 EXIF 折叠面板
        if (photo.originalIsJpeg) {
            (function (idx) {
                // 摘要（面板外，始终可见）
                var exifSummary = document.createElement('div');
                exifSummary.className = 'exif-summary';
                exifSummary.id = 'exifSummary-' + idx;
                exifSummary.textContent = '读取中...';
                item.appendChild(exifSummary);

                // 单图保留开关（面板外）
                var keepRow = document.createElement('div');
                keepRow.className = 'exif-keep-row';
                keepRow.innerHTML = '<span class="exif-keep-label">此图元数据</span>';
                var seg = document.createElement('div');
                seg.className = 'pw-segmented exif-seg';
                seg.id = 'exifSeg-' + idx;
                keepRow.appendChild(seg);
                item.appendChild(keepRow);

                // 折叠触发条
                var exifToggle = document.createElement('div');
                exifToggle.className = 'exif-toggle';
                exifToggle.id = 'exifToggle-' + idx;
                exifToggle.innerHTML = '<span class="exif-toggle-label">EXIF 字段</span><span class="exif-toggle-arrow">▸</span>';
                exifToggle.onclick = function () { toggleExifPanel(idx); };
                item.appendChild(exifToggle);

                // 字段面板（折叠）
                var exifPanel = document.createElement('div');
                exifPanel.className = 'exif-panel';
                exifPanel.id = 'exifPanel-' + idx;
                item.appendChild(exifPanel);

                // 即时加载摘要和开关（不展开字段）
                loadExifForPhoto(photo).then(function (exifObj) {
                    var summaryEl = document.getElementById('exifSummary-' + idx);
                    var keepSeg = document.getElementById('exifSeg-' + idx);
                    if (summaryEl) {
                        summaryEl.textContent = exifObj ? getExifSummary(exifObj) : '无 EXIF 数据';
                    }
                    if (keepSeg && exifObj) {
                        keepSeg.innerHTML = '';
                        [['跟随全局', null], ['保留', true], ['不保留', false]].forEach(function (opt) {
                            var btn = document.createElement('button');
                            btn.type = 'button';
                            btn.className = 'pw-seg-btn' + (photo.exifKeep === opt[1] ? ' active' : '');
                            btn.textContent = opt[0];
                            btn.onclick = function () {
                                photo.exifKeep = opt[1];
                                keepSeg.querySelectorAll('.pw-seg-btn').forEach(function (b) { b.classList.remove('active'); });
                                btn.classList.add('active');
                                scheduleRender();
                            };
                            keepSeg.appendChild(btn);
                        });
                    }
                });
            })(index);
        }

        var canvas = document.createElement('canvas');
        item.appendChild(canvas);

        var sizeStats = document.createElement('div');
        sizeStats.className = 'size-stats';
        sizeStats.innerHTML =
            '<span class="size-original"></span>' +
            '<span class="size-arrow">→</span>' +
            '<span class="size-compressed">计算中...</span>' +
            '<span class="size-saving"></span>';
        item.appendChild(sizeStats);

        var downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.textContent = '下载';
        downloadBtn.onclick = function () { downloadSingleImage(index); };
        item.appendChild(downloadBtn);

        previewGrid.appendChild(item);
        photoCanvases.push(canvas);

        (function (idx) {
            canvas.addEventListener('click', function (e) {
                e.stopPropagation();
                openPreviewOverlay(idx);
            });
        })(index);
    });

    updateActionButtons();
    // DOM 创建完毕，分块渲染画布（避免大批图片卡死）
    scheduleRender();
}

function updateSizeDOM(index) {
    var photo = photos[index];
    if (!photo) return;
    var item = document.querySelectorAll('.preview-item')[index];
    if (!item) return;
    var origEl = item.querySelector('.size-original');
    var compEl = item.querySelector('.size-compressed');
    var saveEl = item.querySelector('.size-saving');
    origEl.textContent = formatBytes(photo.originalSize);
    if (photo.compressedSize != null) {
        compEl.textContent = formatBytes(photo.compressedSize);
        var diff = photo.originalSize - photo.compressedSize;
        var pct = photo.originalSize > 0 ? Math.round(diff / photo.originalSize * 100) : 0;
        if (diff >= 0) {
            saveEl.textContent = '↓ ' + pct + '%';
            saveEl.classList.remove('bad');
        } else {
            saveEl.textContent = '↑ ' + Math.abs(pct) + '%';
            saveEl.classList.add('bad');
        }
    }
}

// 合并同一帧内的多次调用，避免逐张 blob 完成时频繁写 DOM
var _summaryScheduled = false;
function updateSummary() {
    if (_summaryScheduled) return;
    _summaryScheduled = true;
    requestAnimationFrame(function () {
        _summaryScheduled = false;
        _updateSummaryNow();
    });
}

function _updateSummaryNow() {
    var totalOrig = 0, totalComp = 0;
    photos.forEach(function (p) {
        totalOrig += p.originalSize || 0;
        totalComp += p.compressedSize || 0;
    });
    document.getElementById('totalOriginal').textContent = formatBytes(totalOrig);
    var allDone = photos.every(function (p) { return p.compressedSize != null; });
    document.getElementById('totalCompressed').textContent = allDone ? formatBytes(totalComp) : '计算中...';
    var diff = totalOrig - totalComp;
    var pct = totalOrig > 0 ? Math.round(diff / totalOrig * 100) : 0;
    var savingItem = document.querySelector('.summary-saving');
    var label = document.getElementById('totalSavingLabel');
    if (!allDone) {
        document.getElementById('totalSaving').textContent = '—';
        return;
    }
    if (diff >= 0) {
        label.textContent = '总节省';
        savingItem.classList.remove('summary-increase');
        document.getElementById('totalSaving').textContent = '↓ ' + pct + '% (' + formatBytes(diff) + ')';
    } else {
        label.textContent = '总增加';
        savingItem.classList.add('summary-increase');
        document.getElementById('totalSaving').textContent = '↑ ' + Math.abs(pct) + '% (' + formatBytes(Math.abs(diff)) + ')';
    }
}

function updateActionButtons() {
    var has = photos.length > 0;
    document.getElementById('downloadAllBtn').disabled = !has;
    document.getElementById('downloadIndividualBtn').disabled = !has;
}

function removePhoto(index) {
    var photo = photos[index];
    if (photo && photo.img) photo.img.src = ''; // 释放解码位图内存
    photos.splice(index, 1);
    updateImagesUploadStatus();
    rebuildAllItems();
}

function scheduleRender() {
    clearTimeout(renderDebounceTimer);
    renderBatchToken++; // 取消正在进行的批次
    renderDebounceTimer = setTimeout(function () {
        renderBatchToken++;
        var token = renderBatchToken;
        var i = 0;
        function chunk() {
            if (token !== renderBatchToken) return; // 已被新参数取消
            var end = Math.min(i + RENDER_BATCH_SIZE, photos.length);
            for (var k = i; k < end; k++) {
                if (photoCanvases[k]) {
                    renderImageToCanvas(photos[k], photoCanvases[k]);
                    generateBlobFor(photos[k], photoCanvases[k], k);
                }
            }
            i = end;
            if (i < photos.length) requestAnimationFrame(chunk);
        }
        chunk();
    }, RENDER_DEBOUNCE_MS);
}

// ============ 区块折叠 ============
function setupSectionToggle(headerId, checkboxId, sectionId) {
    var header = document.getElementById(headerId);
    var checkbox = document.getElementById(checkboxId);
    var section = document.getElementById(sectionId);

    // 点击标题栏（开关以外的区域）也能切换
    header.addEventListener('click', function (e) {
        if (e.target.closest('.pw-switch')) return;
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    });

    checkbox.addEventListener('change', function () {
        section.classList.toggle('collapsed', !this.checked);
        // 延迟渲染，等 CSS 折叠动画完成再算画布，避免主线程争抢导致卡顿
        clearTimeout(renderDebounceTimer);
        renderDebounceTimer = setTimeout(function () { scheduleRender(); }, 450);
    });
}

// ============ 控件绑定 ============
function bindControls(sliderId, inputId) {
    var slider = document.getElementById(sliderId);
    var input = document.getElementById(inputId);
    slider.addEventListener('input', function () { input.value = slider.value; scheduleRender(); });
    input.addEventListener('input', function () { slider.value = input.value; scheduleRender(); });
}

// ============ 预览弹窗 ============
var previewOverlayURL = null;

function openPreviewOverlay(index) {
    var photo = photos[index];
    if (!photo) return;
    var overlay = document.getElementById('previewOverlay');
    var img = document.getElementById('previewOverlayImg');
    var title = document.getElementById('previewOverlayTitle');
    // 复用渲染管线已生成的 blob，避免 toDataURL 重复编码
    var sourceBlob = photo.blob;
    if (sourceBlob) {
        if (previewOverlayURL) URL.revokeObjectURL(previewOverlayURL);
        previewOverlayURL = URL.createObjectURL(sourceBlob);
        img.src = previewOverlayURL;
    } else {
        // 兜底：尚未渲染完成时用 canvas 直接生成
        var canvas = photoCanvases[index];
        if (!canvas) return;
        var mime = photo.outMime || getOutputMime(photo);
        // AVIF 无法用 canvas 原生编码，预览兜底退回 JPEG
        var dispMime = mime === 'image/avif' ? 'image/jpeg' : mime;
        img.src = canvas.toDataURL(dispMime, getEffectiveQuality());
    }
    title.textContent = photo.fileName;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePreviewOverlay() {
    document.getElementById('previewOverlay').classList.remove('active');
    document.body.style.overflow = '';
    if (previewOverlayURL) {
        URL.revokeObjectURL(previewOverlayURL);
        previewOverlayURL = null;
    }
}

// ============ 工具函数 ============
function formatBytes(bytes) {
    if (bytes == null) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getCustomName(index, originalName) {
    var photo = photos[index];
    if (photo && photo.customName && photo.customName.trim()) return photo.customName.trim();
    return originalName.replace(/\.[^.]+$/, '');
}

function getOutputName(index, photo) {
    var prefix = document.getElementById('renameInput').value.trim();
    var mime = photo.outMime || getOutputMime(photo);
    var ext = extFromMime(mime);
    var base = getCustomName(index, photo.fileName);
    if (prefix) return prefix + base + '.' + ext;
    return base + '.' + ext;
}

function loadScript(urls, index) {
    return new Promise(function (resolve, reject) {
        if (index >= urls.length) { reject('所有 CDN 均加载失败'); return; }
        var script = document.createElement('script');
        script.src = urls[index];
        script.onload = resolve;
        script.onerror = function () { loadScript(urls, index + 1).then(resolve).catch(reject); };
        document.head.appendChild(script);
    });
}

function showStatus(text) {
    var status = document.createElement('div');
    status.textContent = text;
    status.style.cssText = 'position:fixed;top:20px;right:20px;background:var(--accent);color:white;padding:15px 25px;border-radius:50px;z-index:1000;font-weight:600;box-shadow:0 4px 15px rgba(162,206,255,0.4);transition:opacity 0.3s ease;';
    document.body.appendChild(status);
    return status;
}

// ============ 下载 ============
function downloadSingleImage(index) {
    var photo = photos[index];
    var mime = photo.outMime || getOutputMime(photo);
    // 复用渲染管线已生成的 blob，避免重复编码
    if (photo.blob) {
        triggerDownload(photo.blob, getOutputName(index, photo));
        return;
    }
    var canvas = photoCanvases[index];
    buildOutputBlobSmart(photo, canvas, mime).then(function (blob) {
        if (!blob) return;
        triggerDownload(blob, getOutputName(index, photo));
    });
}

function triggerDownload(blob, fileName) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
}

var JSZIP_URLS = [
    'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js',
    'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

// ============ 初始化 ============
setupImageUpload();
setupWatermarkUpload();
setupSectionToggle('compressHeader', 'compressEnable', 'compressSection');
setupSectionToggle('watermarkHeader', 'watermarkEnable', 'watermarkSection');

bindControls('qualitySlider', 'qualityInput');
bindControls('sizeSlider', 'sizeInput');
bindControls('opacitySlider', 'opacityInput');
bindControls('rotationSlider', 'rotationInput');
bindControls('offsetXSlider', 'offsetXInput');
bindControls('offsetYSlider', 'offsetYInput');
bindControls('paddingSlider', 'paddingInput');
bindControls('tileSpacingSlider', 'tileSpacingInput');

document.getElementById('formatSelect').addEventListener('click', function (e) {
    var btn = e.target.closest('.pw-seg-btn');
    if (!btn) return;
    setFormat(btn.dataset.fmt);
    scheduleRender();
});

document.getElementById('qualityModeSelect').addEventListener('click', function (e) {
    var btn = e.target.closest('.pw-seg-btn');
    if (!btn) return;
    setQualityMode(btn.dataset.mode);
});

document.getElementById('adaptiveLevelSelect').addEventListener('click', function (e) {
    var btn = e.target.closest('.pw-seg-btn');
    if (!btn) return;
    document.querySelectorAll('#adaptiveLevelSelect .pw-seg-btn').forEach(function (b) {
        b.classList.toggle('active', b === btn);
    });
    updateHints();
    scheduleRender();
});

document.getElementById('positionModeSelect').addEventListener('click', function (e) {
    var btn = e.target.closest('.pw-seg-btn');
    if (!btn) return;
    setPositionMode(btn.dataset.mode);
});

document.getElementById('resizeEnable').addEventListener('change', function () {
    document.getElementById('resizeInput').disabled = !this.checked;
    scheduleRender();
});

document.getElementById('resizeInput').addEventListener('input', scheduleRender);
document.getElementById('keepMetaEnable').addEventListener('change', scheduleRender);

document.getElementById('previewOverlayClose').addEventListener('click', closePreviewOverlay);
document.getElementById('previewOverlay').addEventListener('click', function (e) {
    if (e.target === this) closePreviewOverlay();
});
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.getElementById('previewOverlay').classList.contains('active')) {
        closePreviewOverlay();
    }
});

document.getElementById('downloadAllBtn').addEventListener('click', async function () {
    if (photos.length === 0) return;
    var btn = this;
    if (btn.disabled) return;
    btn.disabled = true;
    var status = showStatus('正在准备打包 ' + photos.length + ' 张图片...');
    try {
        if (typeof JSZip === 'undefined') {
            status.textContent = '正在加载打包库...';
            await loadScript(JSZIP_URLS, 0);
        }
        var zip = new JSZip();
        for (var i = 0; i < photos.length; i++) {
            var photo = photos[i];
            var mime = photo.outMime || getOutputMime(photo);
            // 优先复用渲染管线已生成的 blob，避免重复编码
            var blob = photo.blob || await buildOutputBlobSmart(photo, photoCanvases[i], mime);
            if (blob) zip.file(getOutputName(i, photo), blob);
            status.textContent = '正在打包... (' + (i + 1) + '/' + photos.length + ')';
        }
        status.textContent = '正在生成 ZIP 文件...';
        var zipBlob = await zip.generateAsync({ type: 'blob' });
        var url = URL.createObjectURL(zipBlob);
        var a = document.createElement('a');
        var prefix = document.getElementById('renameInput').value.trim();
        var zipName = prefix.replace(/[_\s]+$/g, '');
        a.href = url;
        a.download = (zipName || 'processed') + '.zip';
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
        status.textContent = '下载完成 ✓';
        setTimeout(function () {
            status.style.opacity = '0';
            setTimeout(function () { document.body.removeChild(status); }, 300);
            btn.disabled = false;
        }, 1500);
    } catch (err) {
        status.textContent = '打包失败，尝试逐张下载...';
        setTimeout(function () { document.body.removeChild(status); }, 2000);
        for (var j = 0; j < photos.length; j++) {
            downloadSingleImage(j);
            await new Promise(function (r) { setTimeout(r, 300); });
        }
        btn.disabled = false;
    }
});

document.getElementById('downloadIndividualBtn').addEventListener('click', async function () {
    if (photos.length === 0) return;
    var btn = this;
    if (btn.disabled) return;
    btn.disabled = true;
    var status = showStatus('正在逐张下载 ' + photos.length + ' 张图片...');
    for (var i = 0; i < photos.length; i++) {
        downloadSingleImage(i);
        status.textContent = '正在下载... (' + (i + 1) + '/' + photos.length + ')';
        await new Promise(function (r) { setTimeout(r, 300); });
    }
    status.textContent = '下载完成 ✓';
    setTimeout(function () {
        status.style.opacity = '0';
        setTimeout(function () { document.body.removeChild(status); }, 300);
        btn.disabled = false;
    }, 1500);
});

// ============ 全屏预览（portal 到 body，脱离所有祖先 containing block） ============
var fsOriginalParent = null;
var fsOriginalNext = null;
var fsOverlay = null;

function enterFullscreen() {
    var section = document.getElementById('previewSection');
    // 记住原始位置
    fsOriginalParent = section.parentNode;
    fsOriginalNext = section.nextSibling;
    // 创建遮罩
    fsOverlay = document.createElement('div');
    fsOverlay.className = 'fullscreen-overlay';
    document.body.appendChild(fsOverlay);
    // portal 到 body
    document.body.appendChild(section);
    // 锁定背景滚动
    document.body.style.overflow = 'hidden';
    // 触发遮罩淡入
    requestAnimationFrame(function () { fsOverlay.classList.add('visible'); });
    section.classList.add('expanded');
    var btn = document.getElementById('expandPreviewBtn');
    if (btn) { btn.textContent = '✕'; btn.title = '退出全屏'; }
}

function exitFullscreen() {
    var section = document.getElementById('previewSection');
    section.classList.remove('expanded');
    // 恢复背景滚动
    document.body.style.overflow = '';
    // 移除遮罩
    if (fsOverlay) {
        fsOverlay.classList.remove('visible');
        var ov = fsOverlay;
        setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 300);
        fsOverlay = null;
    }
    // 放回原位
    if (fsOriginalParent) {
        if (fsOriginalNext) fsOriginalParent.insertBefore(section, fsOriginalNext);
        else fsOriginalParent.appendChild(section);
        fsOriginalParent = null; fsOriginalNext = null;
    }
    var btn = document.getElementById('expandPreviewBtn');
    if (btn) { btn.textContent = '⛶'; btn.title = '全屏预览'; }
}

document.getElementById('expandPreviewBtn').addEventListener('click', function () {
    var section = document.getElementById('previewSection');
    if (section.classList.contains('expanded')) exitFullscreen();
    else enterFullscreen();
});

document.getElementById('fullscreenClose').addEventListener('click', exitFullscreen);

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        var section = document.getElementById('previewSection');
        if (section.classList.contains('expanded')) exitFullscreen();
    }
});

// ============ 清空所有照片 ============
document.getElementById('clearAllBtn').addEventListener('click', function () {
    if (photos.length === 0) return;
    // 如果在全屏预览中，先退出
    var fsSection = document.getElementById('previewSection');
    if (fsSection.classList.contains('expanded')) exitFullscreen();
    // 释放所有图片占用的解码位图内存
    photos.forEach(function (p) { if (p.img) p.img.src = ''; });
    photos = [];
    photoCanvases = [];
    rebuildAllItems();
    updateImagesUploadStatus();
    clearTimeout(renderDebounceTimer);
});

// ============ 重置参数 ============
var DEFAULTS = {
    quality: 99, resizeEnabled: false, resizeMax: 1920,
    size: 20, opacity: 50, rotation: 0,
    offsetX: 0, offsetY: 0, padding: 20, tileSpacing: 50
};

document.getElementById('resetParamsBtn').addEventListener('click', function () {
    setFormat('auto');
    setQualityMode('adaptive');
    document.querySelectorAll('#adaptiveLevelSelect .pw-seg-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.level === 'balanced');
    });
    document.getElementById('qualitySlider').value = DEFAULTS.quality;
    document.getElementById('qualityInput').value = DEFAULTS.quality;
    document.getElementById('resizeEnable').checked = DEFAULTS.resizeEnabled;
    document.getElementById('resizeInput').disabled = true;
    document.getElementById('resizeInput').value = DEFAULTS.resizeMax;

    var sliders = [
        ['sizeSlider', 'sizeInput', DEFAULTS.size],
        ['opacitySlider', 'opacityInput', DEFAULTS.opacity],
        ['rotationSlider', 'rotationInput', DEFAULTS.rotation],
        ['offsetXSlider', 'offsetXInput', DEFAULTS.offsetX],
        ['offsetYSlider', 'offsetYInput', DEFAULTS.offsetY],
        ['paddingSlider', 'paddingInput', DEFAULTS.padding],
        ['tileSpacingSlider', 'tileSpacingInput', DEFAULTS.tileSpacing]
    ];
    sliders.forEach(function (s) {
        document.getElementById(s[0]).value = s[2];
        document.getElementById(s[1]).value = s[2];
    });

    setPositionMode('single');
    selectPosition('bottom-right');

    document.getElementById('keepMetaEnable').checked = false;
    document.getElementById('compressEnable').checked = true;
    document.getElementById('watermarkEnable').checked = false;
    document.getElementById('compressSection').classList.remove('collapsed');
    document.getElementById('watermarkSection').classList.add('collapsed');

    // 清除所有 EXIF 编辑
    photos.forEach(function (p) {
        p.exifKeep = null;
        p.exifCurrent = null;
        p.exifOriginal = null;
        p.customName = '';
    });

    clearTimeout(renderDebounceTimer);
    renderDebounceTimer = setTimeout(function () { scheduleRender(); }, 550);
});
