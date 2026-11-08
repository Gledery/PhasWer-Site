# PhasWer 的小站

## 这是什么

**PhasWer 的小站** 是一个为 PhasWer 工作室制作的小站~

## 功能列表

写在这里主要是备忘，可能会有更新不及时的地方

### 首页
- 社区成员介绍（含 B 站主页跳转）
- 友情链接卡片
- 代表作画廊（桌面端支持滚轮操控，按发布时间排序）
- Frostart 新标签页插件介绍与安装引导
- 底部版本号从 changelog 动态提取

### 子页面
- **更新日志**：带侧边栏导航的版本时间线
- **数据看板**：灰鸢的 B 站账号数据追踪，AES-256-GCM 加密，需密码查看，趋势图支持起止节点选择
- **设计语言**：全站视觉规范手记
- **历史年表**：社区发展大事记，带搜索与分类筛选
- **提词器**：在线提词器
- **图片处理工具**：图片压缩（自适应模式 / AVIF / PNG 量化 / EXIF 保留）+ 批量水印，支持 HEIC/HEIF、TIFF 输入，可 ZIP 批量打包
- **数据加密工具**：生成 data-all.js 用的加密工具（PBKDF2 + AES-256-GCM）

### 全局
- 毛玻璃设计语言，动态光斑壁纸层
- 入场动画 + 滚动触发动画（IntersectionObserver，老旧内核自动回退），遵守 `prefers-reduced-motion`
- 统一的 `pw-segmented` 分段选择器组件，跨页面复用
- 移动端适配

### 角落 Kaomoji

藏在每个页面右下角的小彩蛋，点它有惊喜（也不一定）。完整交互逻辑在 [common.js](./js/common.js) 里：

- **三阶段表情**：按点击次数切换，`<10` 开心 → `<24` 无奈 → `≥24` 崩溃，台词池也跟着变
- **空闲动作**：4 秒不点就重置，10 秒后开始自言自语、原地转圈、晃来晃去
- **调皮动作**：偶发跑到屏幕另一边、钻出屏幕外再回来、水平翻转、窜到中间视察
- **页面专属欢迎语**：进不同页面会按 `document.title` 说不同的话
- **无障碍**：`role="button"` + `tabindex="0"`，支持 Enter / Space 触发

---

## 项目结构

```
PhaswerWebSource/
├── css/                        # 所有样式
│   ├── core.css                # 全局：设计令牌、布局、动画、玻璃态、dock、Kaomoji
│   ├── 404.css
│   ├── changelog.css
│   ├── data.css
│   ├── design.css
│   ├── encrypt-tool.css
│   ├── history.css
│   ├── index.css
│   ├── teleprompter.css
│   ├── upio.css
│   └── image-tools.css           # 图片处理工具（压缩 + 水印）
│
├── js/
│   ├── common.js               # 全局：scrollToTop、入场动画、光斑、角落 Kaomoji
│   ├── crypto.js               # 加密工具（PBKDF2 + AES-256-GCM，data / encrypt-tool 共用）
│   ├── layout.js               # 布局注入（壁纸层 + 子页面 dock）
│   ├── data/                   # 纯数据文件
│   │   ├── changelog-data.js   # 更新日志版本数据
│   │   ├── data-all.js         # 数据看板加密数据
│   │   ├── history-data.js     # 历史年表事件数据
│   │   └── index-gallery.js    # 首页画廊数据
│   └── pages/                  # 页面专属逻辑
│       ├── changelog.js
│       ├── data.js
│       ├── design.js
│       ├── encrypt-tool.js
│       ├── history.js
│       ├── index.js
│       ├── teleprompter.js
│       ├── upio.js
│       └── image-tools.js        # 图片处理工具（压缩 + 水印）
│
├── img/                        # 图片资源
│   ├── avatar/                 # 成员头像
│   ├── dock-icon/              # dock 栏 SVG 图标
│   └── video-cover/            # 视频封面
│
├── index.html                  # 首页
├── changelog.html              # 更新日志
├── data.html                   # 数据看板（加密，需密码）
├── design.html                 # 设计语言
├── encrypt-tool.html           # 加密工具（生成 data-all.js）
├── history.html                # 历史年表
├── teleprompter.html           # 提词器
├── upio.html                   # UPIO 页面
├── image-tools.html            # 图片处理工具（压缩 + 水印）
├── 404.html                    # 错误页
└── favicon.png
```

---

## 技术栈

原生 HTML / CSS / JS，CSS Custom Properties + `backdrop-filter`，Web Crypto API（加密），Canvas（图片处理），外加 heic2any / UTIF.js / JSZip / imagequant / oxipng 等按需懒加载的第三方库。

之所以不上框架，一是站点就这么大没必要，二是想保持代码可直接阅读，这样想抄哪段直接拿走就行（只要遵守 GPL-3.0 协议都欢迎）。

### 浏览器兼容性

面向现代浏览器，没有做刻意的老旧内核兼容。依赖到的关键 API：

- `backdrop-filter`、CSS Custom Properties、`aspect-ratio`、`text-wrap: balance`
- Web Crypto API（`crypto.subtle`，需 HTTPS 或 localhost）
- `IntersectionObserver`（无此 API 时滚动入场动画自动回退到 scroll + resize 监听）
- `<input type="file">` 的 HEIC/HEIF、TIFF 解码依赖 heic2any / UTIF.js 懒加载

IE 一律不支持，建议 Chrome / Edge / Firefox / Safari 较新版本。

---

## 资源加载约定

每个 HTML 按固定顺序引用资源：

```html
<head>
  <link rel="stylesheet" href="css/core.css">       <!-- 全局 -->
  <link rel="stylesheet" href="css/{页面名}.css">    <!-- 页面专属 -->
</head>
<body>
  <script src="js/layout.js"></script>              <!-- body 第一行：同步注入壁纸层 -->

  <!-- 页面内容 -->

  <script src="js/common.js"></script>              <!-- body 末尾：全局逻辑 + Kaomoji -->
  <script src="js/crypto.js"></script>              <!-- 仅 data / encrypt-tool 引用 -->
  <script src="js/data/{数据文件}.js"></script>      <!-- 需要数据的页面，在逻辑之前引用 -->
  <script src="js/pages/{页面名}.js"></script>       <!-- 页面专属逻辑 -->
</body>
```

- `js/layout.js` 必须在 `<body>` 第一行同步加载，否则壁纸层注入晚于页面内容会闪屏
- `js/common.js` 在 `<body>` 末尾加载，内含角落 Kaomoji 组件
- 页面脚本依赖全局变量（如 `versions`、`ENCRYPTED_CSV`）时，数据文件需在逻辑文件之前引用

---

## 设计令牌

全部定义在 [core.css](./css/core.css) 顶部的 `:root`，是全站视觉的单一来源：

| 类别 | 示例变量 | 说明 |
| --- | --- | --- |
| 半透明底色 | `--bg-card` `--bg-dock` `--bg-main` | 玻璃态容器的背景浓度梯度 |
| 阴影档位 | `--shadow-sm` `--shadow-md` `--shadow-lg` `--shadow-xxl` | 全站统一调用的四级阴影 |
| 圆角档位 | `--radius-sm` … `--radius-max` `--radius-pill` | 从 20px 到 75px，pill 为胶囊 |
| 主题色 | `--color-org` `--color-gld` `--color-ldc` | 成员主题色（绿 / 蓝 / 黄） |
| 渐变 | `--gradient-page` `--gradient-wallpaper` | 页面底色与壁纸层底色 |
| 布局 | `--header-height` `--content-max-width` | 顶部栏高度与内容最大宽度（1300px） |

想改全站风格只要动这里。设计语言页 (`design.html`) 的令牌总览表格即按此自动同步。

---

## 加密实现

数据看板的 CSV 数据并不是明文存储，而是用 [crypto.js](./js/crypto.js) 里的 `CryptoUtil` 加密后塞进 `js/data/data-all.js`。核心参数：

- **算法**：AES-256-GCM（带认证，防篡改）
- **密钥派生**：PBKDF2 / SHA-256，**100000 次迭代**
- **密文格式**：`base64(salt) : base64(iv) : base64(ciphertext)`，salt 16 字节随机、iv 12 字节随机
- **密码不落盘**：浏览器侧输入，仅活在内存里，刷新就没了

加密用的工具是 `encrypt-tool.html`，把 CSV 文本粘进去输密码就能生成 `data-all.js`

---

## 致谢

虽然这个站真的很小，但站在这些好东西的肩膀上。所有第三方库都按需懒加载

| 库 | 版本 | 应用 |
| --- | --- | --- |
| [Chart.js](https://www.chartjs.org/) | 4.4.7 | 数据看板趋势图 |
| [JSZip](https://stuk.github.io/jszip/) | 3.10.1 | 图片处理工具的 ZIP 批量打包 |
| [oxipng](https://github.com/shssoichiro/oxipng)（@jsquash） | 2.3.0 | PNG 无损重压 |
| [imagequant](https://pngquant.org/)（libimagequant WASM） | 0.1.2 | PNG 256 色量化 |
| [heic2any](https://github.com/catdad-experiments/heic2any) | 0.0.4 | HEIC/HEIF 解码 |
| [UTIF.js](https://github.com/photopea/UTIF.js) | 3.1.0 | TIFF 解码 |
| [HarmonyOS Sans SC](https://ayahub.com/)（@ayahub webfont） | — | 全站字体，woff2 走 jsDelivr CDN |

以上第三方库全部按需懒加载

---


## 协议

[GPL-3.0](./LICENSE) © 灰鸢 Gledery

---

<p align="center">
  © 灰鸢 Gledery 闲的没事用肝创建 (。・ω・。)<br>
  你滑到底了哇，去喝杯水吧~
</p>
