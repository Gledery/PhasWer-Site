// 更新日志版本数据（由 changelog.html 抽离，供 changelog.html 渲染使用）
var versions = [
    {
        version: '3.15.1', date: '2026-7-25',
        changes: [
            '图片工具全屏预览重写为了 transform scale 弹出动画并且将背景降到了 0.4 透明度的毛玻璃，由遮罩层兜底可读性',
            '重新设计了全屏关闭按钮',
            'agent.md 改名为 AGENTS.md，修正了之前文件名与约定不符的问题',
            '删除了全站入场动画的 0.4s 全局启动延迟（--enter-delay），@starting-style 才是王道哇哈哈哈哈哈！！！（又一个2.1.0老资历光荣退役了）',
        ]
    },
    {
        version: '3.15.0', date: '2026-7-24',
        changes: [
            '入场动画系统整体重写为纯 CSS @starting-style，默认状态改为可见，删除了 JS setTimeout、.animate-in 的 !important 级联和 body opacity:0 的防闪屏 hack，JS 失败或不支持时内容仍能正常显示',
            'dock 按钮入场改用 @keyframes + backwards fill 实现依次滑入，stagger 不再污染 hover 过渡；design 页 sidebar / nav-toggle 也同时摆脱了屎山构建者 !important',
            '入场延迟统一为全站 --enter-delay(0.4s) 令牌，入场窗口结束后 JS 把令牌归零，避免延迟泄漏到 sidebar 折叠、移动端按钮等交互',
        ]
    },
    {
        version: '3.14.0', date: '2026-7-21',
        changes: [
            '阴影系统重写为了接触影+环境影的模型，hover 时阴影等级同步升级',
            '全站一共8处 transition 补上 box-shadow，hover 时阴影从 md→lg',
            'main 容器和卡片间距统一为了 60px',
            '标题下划线紫色硬编码提取为了 --gradient-accent 令牌，并合并了两个重复的 ::after',
            '统一了about-intro和frostart-note的提示文字字号为13px',
            'design 页面阴影演示区同步更新为双层模型',
        ]
    },
    {
        version: '3.13.5', date: '2026-7-19',
        changes: [
            '重写了版本号分级规则',
            'agent.md 新增了触屏 hover 门控、禁止 transition: all 和 zoom 90% 历史遗留的规范，并增加了按压强度与元素大小关系的记录',
            'core.css 末尾新增 @media (hover: none) 重置块',
            '清理了全站 14 处 transition: all，替换为具体属性',
            '全站约 50 处硬编码 transition 时间统一替换为令牌',
        ]
    },
    {
        version: '3.13.4', date: '2026-7-17',
        changes: [
            '为设计语言页所有组件演示区补上了完整的移动端适配，修复了资源包下载卡在移动端文字被挤成一行的问题',
            '毛玻璃演示区固定宽度容器改为响应式收缩，代码块中也同步补充了 @media 示例',
            '重写了设计语言页 hero 中关于移动端预览的说明文字',
        ]
    },
    {
        version: '3.13.3', date: '2026-7-16',
        changes: [
            '提升了 sidebar 和 toggle 的 z-index 使其高于 kaomoji，移动端不再被遮挡',
            'common.js 新增对 aside 元素的入场动画支持',
        ]
    },
    {
        version: '3.13.2', date: '2026-7-15',
        changes: [
            '移除了旧的内部折叠按钮并改为始终可见的浮动 toggle 按钮，统一控制桌面端折叠/展开和移动端抽屉模式',
            '修复了侧边栏折叠无效的Bug',
            'toggle 按钮改为sidebar 可见时移至内部右上角，隐藏时浮动到左侧，且添加量旋转+缩放的图标切换和 hover/active 动画',
        ]
    },
    {
        version: '3.13.1', date: '2026-7-14',
        changes: [
            '移除了气泡提示、侧边 dock 演示、数据展示区和特色组件区；资源包下载卡和 Frostart 暗色态移至按钮系统区',
            '按钮系统按功能拆分为了基础按钮和卡片型操作两个 section，表单控件拆分为输入控件和选择控件，左侧导航同步更新',
        ]
    },
    {
        version: '3.13.0', date: '2026-7-13',
        changes: [
            '设计语言页从 PhasWer 主站和 Frostart 集成了新增按钮系统/表单控件/导航/反馈/浮层等展示区，每个组件标注来源并配备代码块',
            '新增左侧导航栏，支持滚动联动高亮、点击定位、移动端抽屉模式和滚轮事件隔离',
            '为 subsection 移除了阴影，演示区统一为 demo-stage',
            '入场动画现在统一交由 common.js 通用延迟系统管理（含侧边栏），sidebar 样式对齐 changelog 页',
            'agent.md 新增入场动画统一规则和按钮交互反馈规范',
        ]
    },
    {
        version: '3.12.17', date: '2026-7-12',
        changes: [
            '新增了 agent.md',
            '优化了图片处理工具的内存占用：非 JPEG 图片不再保留原始 dataURL，删除/清空图片时主动释放解码位图',
        ]
    },
    {
        version: '3.12.16', date: '2026-7-12',
        changes: [
            '重写了 README，补上了本地预览、角落 Kaomoji 交互说明、浏览器兼容性、设计令牌、加密实现、代码风格和致谢等章节',
            '首页的关于此网页卡片新增了折叠面板，点开可查看第三方库依赖',
            '为提词器添加了.pw-slider',
            '修复了移动端画廊仍可向右滑过内容边界的问题',
        ]
    },
    {
        version: '3.12.15', date: '2026-7-11',
        changes: [
            '图片处理工具新增 HEIC/HEIF 与 TIFF 输入支持，分别由 heic2any 和 UTIF.js 在首次遇到时懒加载 WASM 解码',
            '为 HEIC/HEIF 文件补上了 drop 拖拽的扩展名兜底',
            '补全了 <input accept> 对 .heic/.heif/.tif/.tiff 的显式声明',
        ]
    },
    {
        version: '3.12.14', date: '2026-7-10',
        changes: [
            '修复了移动端画廊可以一直往右滑过边界的问题',
            '把画廊的鼠标拖拽从 Mouse Events 换成了 Pointer Events，并过滤掉触屏产生的模拟鼠标事件，避免干扰原生滚动',
        ]
    },
    {
        version: '3.12.13', date: '2026-7-9',
        changes: [
            '把卡片滚动入场动画的触发机制从 scroll + getBoundingClientRect 重写为 IntersectionObserver',
            '修复了移动端地址栏伸缩改变视口高度后卡片一直卡在透明状态不入场的问题',
            '不支持 IO 的老旧内核现在会自动回退到 scroll 方案，并补上了 resize 监听',
        ]
    },
    {
        version: '3.12.12', date: '2026-7-9',
        changes: [
            '数据看板的趋势图表新增开始/结束节点选择',
        ]
    },
    {
        version: '3.12.11', date: '2026-7-8',
        changes: [
            '把设计语言页几个演示元素的 transition: all 改成了具体属性',
            '统一了演示区的圆角且用伪元素把自绘开关的点击区域从 28px 扩到了 40×40',
        ]
    },
    {
        version: '3.12.10', date: '2026-7-7',
        changes: [
            '为数据看板的动态数字补上了 tabular-nums',
            '给标题和正文也加了 text-wrap（balance / pretty）',
            '头像和视频封面都加了 1px 纯黑描边',
        ]
    },
    {
        version: '3.12.9', date: '2026-7-6',
        changes: [
            '统一了图片处理的水印位置、历史年表的筛选、设计系统的阴影档位、数据中心的图表指标的四个分段选择控件样式微pw-segmented！芜湖！炒鸡大统一！芜！（已疯',
            '为分段选择器新增可换行变体，选项多或容器窄时不再挤压截断！芜湖！炒鸡大统一！芜！（已疯',
        ]
    },
    {
        version: '3.12.8', date: '2026-7-4',
        changes: [
            '新增 AVIF 输出格式',
            'PNG 压缩接入了 imagequant 做 256 色量化 + oxipng 无损重压，照片达不到质量门槛时自动保持无损',
            '优化了多图渲染和统计的性能',
        ]
    },
    {
        version: '3.12.7', date: '2026-7-3',
        changes: [
            '新增自适应压缩模式（对每张图反复编码并与渲染结果比对）',
            '自适应提供画质优先 / 均衡 / 体积优先三档，切过去时质量滑块自动隐藏',
        ]
    },
    {
        version: '3.12.6', date: '2026-7-2',
        changes: [
            '新增 HDR 图片检测和徽标以提示浏览器已自动转成 SDR',
            '为分段选择器和开关都加了 hover 浮起、active 按下的动画',
        ]
    },
    {
        version: '3.12.5', date: '2026-7-2',
        changes: [
            '新增接近全屏的预览模式',
            '修复了全屏预览的多个Bug，包括弹窗被遮挡，开启时背景仍可滚动，全屏中点清空照片会留下空面板等等等等等等等等等等等等等',
            '修复了清空照片按钮引用了不存在的元素 ID、ZIP 打包时重复渲染所有图片、单图 EXIF 开关切换后不触发重渲染等逻辑错误',
        ]
    },
    {
        version: '3.12.4', date: '2026-7-1',
        changes: [
            '每张 JPEG 新增了 EXIF 面板，包括摘要、单图保留开关、可编辑字段和只读字段',
            '支持了压缩后保留 EXIF',
            '现在没有 JPEG 图片时会自动禁用 EXIF 开关',
        ]
    },
    {
        version: '3.12.2', date: '2026-6-30',
        changes: [
            '为三个页面添加了纯本地说明',
            '所有 Emoji 替换成了 svg 矢量图标',
            '为渲染调度添加了分块渲染（每帧 2 张）、200ms 防抖和批次令牌取消',
            '下载、预览和 ZIP 打包现在优先复用渲染管线已生成好的 blob',
        ]
    },
    {
        version: '3.12.1', date: '2026-6-29',
        changes: [
            'summary 栏改为左右分栏，右侧绘制了新的小 pill 按钮 （可爱捏',
            '处理后的体积如果反而增大了，统计栏会从「总节省」自动切换成「总增加」并标红',
            '折叠动画从 max-height 换成了 grid-template-rows，修复了抽搐的问题',
        ]
    },
    {
        version: '3.12.0', date: '2026-6-28',
        changes: [
            '将图片压缩与批量水印两个工具合并为一个图片处理工具页面 (image-tools.html)',
            '控制面板改为上下折叠式分区',
        ]
    },
    {
        version: '3.11.1', date: '2026-6-28',
        changes: [
            '新增「保留元数据（EXIF）」开关',
            '修复了所有工具页面主区域入场动画丢失的问题',
            '修复了关闭按钮缺少 active 按下状态的问题',
        ]
    },
    {
        version: '3.11.0', date: '2026-6-27',
        changes: [
            '新增了图片压缩工具 (compress.html) 和相应JS和CSS文件',
            '图片压缩工具和水印工具的所有控件均改为继承自Frostart的自绘样式（滑块、开关、分段选择器），控制面板改用 4 列网格布局',
        ]
    },
    {
        version: '3.10.3', date: '2026-6-26',
        changes: [
            '把首页底部的工具按钮改成了带图标和简介的卡片布局',
            '重写了 README.md',
            '采用了 GPL-3.0 协议开源，新增了 LICENSE 文件',
        ]
    },
    {
        version: '3.10.2', date: '2026-6-25',
        changes: [
            '把 changelog-data / data-all / index-gallery / history-data 四个纯数据文件从 js/pages/ 和 js/components/ 抽到了 js/data/',
            '把角落 Kaomoji 组件（corner-kaomoji.js）内联进了 common.js',
        ]
    },
    {
        version: '3.10.1', date: '2026-6-23',
        changes: [
            '修复了字体栈写了 HarmonyOS Sans SC 却没有 @font-face 实则一直 fallback 到雅黑的问题（尼玛用了两年的假鸿蒙（气笑了）',
            '优化了首页 Frostart 卡片的排版并改进了窄屏下的对齐',
            '把 Frostart 介绍里括号中的补充说明弱化为次要文字层级',
        ]
    },
    {
        version: '3.10.0', date: '2026-6-22',
        changes: [
            '把所有页面的内联 <style> 全部抽到了 css/ 目录',
            '把所有页面的内联 <script> 也抽到了 js/pages/，终于三层分离了wwwwwwww我太感动了TwT',
            '删除了职责混乱的 common/ 文件夹，改为 css/ 和 js/ 对称的目录结构，core.css 搬进了 css/，组件归到 js/components/，数据文件归到 js/pages/',
            '重写了 README.md',
        ]
    },
    {
        version: '3.9.13', date: '2026-6-19',
        changes: [
            '首页新增了 Frostart 新标签页插件介绍卡片',
            '修复了在部分场景下favicon由于索引问题无法显示的问题',
            '首页底部版本号改为从 changelog 动态提取',
            '修复了首页画廊在移动端的滚动问题，移除与原生惯性滚动冲突的 touchmove 处理',
        ]
    },
    {
        version: '3.9.12', date: '2026-6-14',
        changes: [
            '修复了 index-gallery.js 里 renderGalleries 被注册了两次导致画廊渲染两遍的问题',
            '修复了水印工具移动端 upload-section 的 grid 在小屏幕下没有降级的问题',
            'dock 栏图标全部从 PNG 换成了 SVG',
        ]
    },
    {
        version: '3.9.11', date: '2026-6-13',
        changes: [
            'crypto.js 用 CryptoUtil 命名空间封装，ab2b64、deriveKey 这些活了快两年的函数《永久怀念》',
            'index-gallery.js 改成了 IIFE，所有画廊数据和滚动交互逻辑变成私有的',
            '新建了 common/layout.js 统一注入壁纸层和子页面 dock',
        ]
    },
    {
        version: '3.9.10', date: '2026-6-11',
        changes: [
            '把 changelog、数据看板、设计语言三个页面重复的 hero 入场动画样式统一提取到了 core.css',
            '统一了 changelog、历史年表重复的 .card 透明覆盖样式',
            '把数据看板和加密工具重复的加密函数抽成了 common/crypto.js',
        ]
    },
    {
        version: '3.9.9', date: '2026-6-10',
        changes: [
            '首页非首屏图片添加了 loading="lazy" 懒加载',
            '光斑动画代码重构，提取了 applyBlobPositions 和 lerpBlobPositions 公共函数',
            '新建了 404 错误页面',
        ]
    },
    {
        version: '3.9.8', date: '2026-6-9',
        changes: [
            '滚动卡片动画改成了缓存元素列表 + requestAnimationFrame 节流，动画完成后自动移除监听',
            '视频封面图片加了 width/height 属性和 aspect-ratio，加载前就能预留正确空间',
            '加了 prefers-reduced-motion 适配，开了系统减少动态效果的用户会直接跳过所有动画',
            '入场动画加了 will-change 提示，动画结束后自动释放',
            'Kaomoji 组件改成了 async 加载',
        ]
    },
    {
        version: '3.9.7', date: '2026-6-8',
        changes: [
            '水印工具新增了 ZIP 批量打包下载（JSZip）和逐张下载两种方式',
            '水印工具新增了每张图片的独立文件名编辑和全局前缀功能',
            '水印工具新增了参数一键重置按钮',
            '水印工具修复了删除按钮与文件名输入框重叠的问题，改为同行 flex 布局',
        ]
    },
    {
        version: '3.9.6', date: '2026-6-7',
        changes: [
            '历史年表新增了搜索功能，分类筛选按钮和统计摘要功能',
            '水印工具新增了单张预览弹窗（毛玻璃遮罩 + 大图），支持 ESC 和点击遮罩关闭',
            '水印工具删除按钮新增了 hover 和 active 动画效果',
        ]
    },
    {
        version: '3.9.5', date: '2026-6-6',
        changes: [
            '修复了Kaomoji气泡文字换行和出框问题，改为左对齐不换行',
            '移动端现在也会显示Kaomoji',
            '玻璃态演示新增了饱和度、阴影强度控件和重置按钮',
            '滑块轨道改为了近似色渐变风格',
        ]
    },
    {
        version: '3.9.4', date: '2026-6-4',
        changes: [
            '同步了设计语言页面令牌总览表格与 core.css 中的变量',
            '新增玻璃态效果板块（带实时参数调节演示），放在背景原理之前',
            '背景原理演示新增玻璃态层和完整效果按钮，层切换时有淡入淡出动画',
        ]
    },
    {
        version: '3.9.3', date: '2026-6-3',
        changes: [
            '数据看板 CSV 数据改为了 PBKDF2 + AES-256-GCM 加密存储，密码正确前数据不可读',
            '新增了 encrypt-tool.html 加密工具页面，用于将 CSV 文本加密生成 data-all.js（这个网页也加密了hh）',
            '统计概览和趋势图表恢复了评论、弹幕、分享三个指标',
            '清理了旧的 SHA-256 哈希验证逻辑和向后兼容代码',
        ]
    },
    {
        version: '3.9.2', date: '2026-6-2',
        changes: [
            '修复了数据看板图表 Tooltip 在全局 zoom 下的坐标偏移问题',
            '移除了 chart-container 的 overflow:hidden，Tooltip 在边缘正常显示',
        ]
    },
    {
        version: '3.9.1', date: '2026-6-1',
        changes: [
            'Kaomoji组件表情和台词按阶段分层匹配（开心→无奈→崩溃）',
            '修复了持续点击时仍会进入待机动作的 bug',
        ]
    },
    {
        version: '3.9.0', date: '2026-5-29',
        changes: [
            '新增角落Kaomoji互动组件（corner-kaomoji.js）',
        ]
    },
    {
        version: '3.8.9', date: '2026-5-10',
        changes: [
            '字体栈优化为 HarmonyOS Sans SC / PingFang SC / Microsoft YaHei',
            '新增文字选中高亮半透明紫色',
            '新增平滑滚动（scroll-behavior: smooth）',
            '新增文字渲染优化（text-rendering: optimizeLegibility）',
            '新增图片拖拽保护（-webkit-user-drag: none）',
        ]
    },
    {
        version: '3.8.8', date: '2026-5-9',
        changes: [
            '修复了水印工具重复选择相同文件时不触发 change 事件的 bug',
            '为 FileReader 和 Image 添加了 onerror 错误处理',
            'placeholder 提示根据当前状态动态显示不同引导文字',
            '下载全部按钮在下载过程中禁用，防止重复点击',
            '修复了 getParams 中 padding 默认值与 HTML 输入不一致的问题',
            '渲染函数增加了零值安全检查'
        ]
    },
    {
        version: '3.8.7', date: '2026-5-3',
        changes: [
            '提词器播放中变速现在立即生效',
            '提词器文本区宽度改为固定 720px',
            '提词器默认开启引导线，倒计时默认 10 秒',
            '移除 watermark.html 和 teleprompter.html 中与 core.css 重复的样式定义',
        ]
    },
    {
        version: '3.8.6', date: '2026-5-2',
        changes: [
            '新增了提词器工具页面（teleprompter.html）',
        ]
    },
    {
        version: '3.8.5', date: '2026-5-2',
        changes: [
            'watermark页面的水印渲染调度从 debounce 改为了 requestAnimationFrame',
            '参数变化时仅重绘 canvas 而不重建 DOM',
            '提取共享的 calcPosition 位置计算函数，消除了三处重复的 switch-case 代码',
        ]
    },
    {
        version: '3.8.4', date: '2026-5-1',
        changes: [
            '修复了 bindControls 函数被重复定义导致第一组绑定失效的 bug',
            '移除了冗余的 downloadSingleImageWithWatermark 函数',
            '下载导出时根据原文件扩展名自动匹配格式，不再一律输出 PNG',
            '延迟释放 ObjectURL 至下载完成后再回收'
        ]
    },
    {
        version: '3.8.3', date: '2026-4-28',
        changes: [
            '水印位置选择器从下拉框改为可视化 9 宫格点击选择器',
            '新增水印平铺模式，内边距控制滑块和间距调节',
            '平铺模式下自动隐藏/禁用不相关的控件（位置选择器、偏移、内边距）'
        ]
    },
    {
        version: '3.8.2', date: '2026-4-26',
        changes: [
            '更新日志左侧导航栏改为容器样式，鼠标滚轮独立滚动且聚焦项自动跟随',
            '修复了导航栏内容溢出时无法滚动的问题'
        ]
    },
    {
        version: '3.8.1', date: '2026-4-26',
        changes: [
            '统一所有页面标题格式为"页面名 | PhasWer 的小站"，并将页面大标题中的"PhasWer"前缀移除',
            '将全站名称由"PhasWer 的赛博工作室"更名为"PhasWer 的小站"'
        ]
    },
    {
        version: '3.8.0', date: '2026-4-24',
        changes: [
            '重写了更新日志页面，集成了core.css',
            '为更新日志添加了左侧版本导航栏，支持快速跳转和滚动高亮',
        ]
    },
    {
        version: '3.7.2', date: '2026-4-21',
        changes: [
            '将全局CSS类名 member-button 重命名为 pill-button，统一命名风格',
            '图表 Tooltip 改为自定义 HTML 毛玻璃样式'
        ]
    },
    {
        version: '3.7.1', date: '2026-4-20',
        changes: [
            '数据表格改为分批加载，每次显示30条，底部"加载更多"按钮追加',
            '隐藏了表格滚动条，表头添加毛玻璃效果',
            '修复了趋势图表鼠标选中点偏移的问题'
        ]
    },
    {
        version: '3.7.0', date: '2026-4-19',
        changes: [
            '新增"数据看板"子页面（data.html 和 Chart.js），展示哔哩哔哩账号数据追踪',
            '数据存储为独立 JS 文件（data-all.js），通过 script 标签加载，兼容所有环境'
        ]
    },
    {
        version: '3.6.16', date: '2026-4-17',
        changes: [
            '将所有 video-cover 和 member-avatar 改为了直接调用B站官方 API【此功能在4月19日撤回】'
        ]
    },
    {
        version: '3.6.15', date: '2026-4-14',
        changes: [
            '将"合作组织"板块更名为"友情链接"',
            '新增 Dinxm Robinson 友情链接'
        ]
    },
    {
        version: '3.6.14', date: '2026-4-12',
        changes: [
            '重命名了 org 相关的 CSS 类名，统一为更简洁的命名',
            '调整了 org-left 宽度以适配更长的名称显示'
        ]
    },
    {
        version: '3.6.13', date: '2026-4-8',
        changes: [
            '修改了 three-groups-merged 的布局，从卡片变成了开放容器',
            '修改了 Slogan 的描述'
        ]
    },
    {
        version: '3.6.12', date: '2026-4-1',
        changes: [
            'video-cover 从 jpg 改为 .jpg@672w_378h_1c.avif 以大幅减少加载时间，同时相应的修改了卡片长宽比'
        ]
    },
    {
        version: '3.6.11', date: '2026-3-31',
        changes: [
            '将 UPIO 页面的静态成员数据改为 JavaScript 动态生成',
            '优化了 CSS 代码结构'
        ]
    },
    {
        version: '3.6.10', date: '2026-3-30',
        changes: [
            '再次修改了 UPIO 界面的元素宽度，修复了在小屏幕设备上显示不全的问题',
            '移除了重复的 dock 样式定义'
        ]
    },
    {
        version: '3.6.9', date: '2026-3-29',
        changes: [
            '修改了 UPIO 界面的元素宽度和移动端适配'
        ]
    },
    {
        version: '3.6.8', date: '2026-3-27',
        changes: [
            'Frame Raw 打开动画改为即时触发',
            '简化了 design.html 和 upio.html 的动画代码，统一使用 common.js'
        ]
    },
    {
        version: '3.6.7', date: '2026-3-22',
        changes: [
            '统一所有页面的入场动画触发机制，全部改用 window.load 事件确保资源加载完成后再触发动画'
        ]
    },
    {
        version: '3.6.6', date: '2026-3-21',
        changes: [
            '修复了在页面加载完成之前所有的入场动画就已经被触发的问题',
            '添加了 loading-overlay',
            '使用 window.load 事件替代 DOMContentLoaded 确保所有资源加载完成后再触发动画'
        ]
    },
    {
        version: '3.6.5', date: '2026-3-20',
        changes: [
            '在设计语言界面添加了光斑的可交互元素及相应的 JS 以展示解释'
        ]
    },
    {
        version: '3.6.4', date: '2026-3-19',
        changes: [
            '解除了首页背景动画的帧率限制',
            '延长了光斑的触发时长，在除 index 外的其他网页修改了缓动函数'
        ]
    },
    {
        version: '3.6.3', date: '2026-3-17',
        changes: [
            '对背景光斑使用了 GPU 加速渲染（translate3d + will-change）',
            '将背景动画更新频率从 60fps 降至 30fps',
            '缓存了光斑位置差值计算，减少重复数学运算',
            '合并了部分 CSS 变量更新操作，减少 DOM 重排次数'
        ]
    },
    {
        version: '3.6.2', date: '2026-3-16',
        changes: [
            '移除了背景的 blur 效果以提高性能',
            '修改了 index 的 JS 逻辑'
        ]
    },
    {
        version: '3.6.1', date: '2026-3-15',
        changes: [
            '添加了 Frame Raw 字样的可交互元素（overlay-content）及相应的 JS 以展示解释'
        ]
    },
    {
        version: '3.6.0', date: '2026-3-14',
        changes: [
            '修改了网页背景，由可交互的动态元素构成。并且相应的调整了所有元素的透明度，布局和基础 CSS',
            '同时移除了原有的背景图片，切换按钮和结构',
            '（变化太大了所以直接跳五个版本）'
        ]
    },
    {
        version: '3.0.3', date: '2026-3-12',
        changes: [
            '对 Dock 栏布局进行了调整，并且修改了移动端的提示'
        ]
    },
    {
        version: '3.0.2', date: '2026-3-6',
        changes: [
            '增加了宽度上限以适配大屏设备，并且相应的对布局计算方式进行了调整，包括对移动端改变 dock 栏位置和调整一些元素的大小'
        ]
    },
    {
        version: '3.0.1', date: '2026-3-4',
        changes: [
            '修改了 card, main 两元素的 margin 和 padding 计算方式，优化了移动端适配',
            '为 index.html 的所有卡片标题添加了渐变下划线',
            '修改了 three-groups-merged 的移动端布局阈值',
            '移除了 card-shadow'
        ]
    },
    {
        version: '3.0.0', date: '2026-2-27',
        changes: [
            '这次更新断断续续的进行了一个月终于完成了',
            '新增了设计语言页面，详细介绍了此页面的设计语言并新增了很多交互',
            '对整个网页的代码进行了重新工程化，创建了 common 文件夹，将所有公共的 CSS 和 JS 代码都放到了里面，同时在 components 文件夹下创建了所有组件的数据文件',
            '创建了 core.css 来存放所有核心的 CSS 代码，如全局变量、基础样式、布局样式等',
            '优化了代表作部分的滚动逻辑，加强了触屏，鼠标横向滚轮和触控板支持',
            '做了全新的移动端适配，包括改变 dock 栏位置和调整一些元素的大小',
            '统一了 dock 栏入场动画',
            '【这是鸢第一次在开发中使用claude code~至此PhaswerWebSource的纯手搓历史结束啦（撒花】'
        ]
    },
    {
        version: '2.13.1', date: '2026-2-15',
        changes: [
            '修改了"回到顶部"功能的缓动函数',
            '新增了头像在 hover 时的旋转'
        ]
    },
    {
        version: '2.13.0', date: '2026-2-13',
        changes: [
            '修改了里程碑的计算规则',
            '为 history 页面添加了特殊的 card 函数',
            '移除了相册页面和毛玻璃控制功能'
        ]
    },
    {
        version: '2.12.1', date: '2026-1-28',
        changes: [
            '对 index.html 的所有 CSS 进行了彻底的重构',
            '修改了一些描述，阴影和圆角'
        ]
    },
    {
        version: '2.12.0', date: '2026-1-27',
        changes: [
            '修改了标题和网页描述',
            '重写了"成员"卡片并添加了一大堆 CSS（groupSection），可能是下一个设计方向？总之舒服多了',
            '提升了 member-card-large 的可读性',
            '修改了"合作组织"部分的 padding'
        ]
    },
    {
        version: '2.11.1', date: '2026-1-12',
        changes: [
            '在 index.html 下创建了数据配置 videoGalleries 和 function renderGalleries 以动态生成代表作内容（强迫症极度舒适啊啊啊啊啊！）'
        ]
    },
    {
        version: '2.11.0', date: '2025-12-21',
        changes: [
            '重写了历史页，为每个事件设置了独立的卡片并且用颜色区别',
            '创建了 function renderTable 以动态生成表格内容',
            '修复了 table-wrapper 背景透明度不统一的问题',
            '修复了 anime-in 及 .dock button 背景透明度不统一的问题'
        ]
    },
    {
        version: '2.10.2', date: '2025-12-21',
        changes: [
            '对首页卡片的设计（尤其是 org-desc）进行了权重的重新调整，重新设计了 .padding 和 .margin 的计算逻辑',
            '对通用的 pill-button 进行了重写，更大气了一点'
        ]
    },
    {
        version: '2.10.1', date: '2025-12-20',
        changes: [
            '对 org-card 进行了紧急修复',
            '修改了合作个人/组织卡片设计',
            '删除了一些 CSS',
            '在更新日志界面新增了版本分层定义'
        ]
    },
    {
        version: '2.10.0', date: '2025-12-19',
        changes: [
            '加入了新的"合作组织"卡片',
            '为"合作组织"卡片的元素加入了新的距离控制逻辑'
        ]
    },
    {
        version: '2.9.4', date: '2025-12-17',
        changes: [
            '修改了背景图片的样式和显示逻辑',
            '对网页进行了工程化处理，现在可以通过 .common.css 管理网页（此更新在12月18日被撤回）'
        ]
    },
    {
        version: '2.9.3', date: '2025-12-16',
        changes: [
            '对 member-card-large 的 hover 动画进行了修改，加入了加速和减速曲线',
            '修正了一些可能有歧义的描述',
            '修改了代表作卡片的顺序',
            '为所有系列加入了描述'
        ]
    },
    {
        version: '2.9.2', date: '2025-12-5',
        changes: [
            '修改了 horizontal-gallery 函数的兼容性问题',
            '将代表作卡片的作者名移出了标题'
        ]
    },
    {
        version: '2.9.1', date: '2025-11-27',
        changes: [
            '解决了 UPIO 界面的 Dock 栏显示问题',
            '将灰鸢和小白狼的成员档案卡片重新改为了竖版设计',
            '修改了 .style 的代码结构'
        ]
    },
    {
        version: '2.9.0', date: '2025-11-26',
        changes: [
            '重新设计了灰鸢和小白狼的成员档案卡片（耍大牌~~~~~~~）',
            '重新整理了通用成员档案，现在合作及成员的哔哩哔哩跳转按钮被合并了'
        ]
    },
    {
        version: '2.8.2', date: '2025-11-23',
        changes: [
            '一个修复性更新，重新整理了 Dock 栏的相关代码',
            '重新规划了视频展示卡片'
        ]
    },
    {
        version: '2.8.1', date: '2025-11-23',
        changes: [
            '修复了所有页面的打开和关闭逻辑，将 changelog.html 区分开来',
            '重新设计了返回页首按钮',
            '解决了部分入场动画的显示错误'
        ]
    },
    {
        version: '2.8.0', date: '2025-11-22',
        changes: [
            '重新整理并公开了更新日志',
            '对 Dock 提示窗进行了修改',
            '修改了所有页面的打开和关闭逻辑',
            '重新设计了返回页首按钮'
        ]
    },
    {
        version: '2.7.1', date: '2025-11-20',
        changes: [
            '将代表作改为按系列分类'
        ]
    },
    {
        version: '2.7.0', date: '2025-11-17',
        changes: [
            '彻底删除了 goToCard 和 CardID 函数和很多不实用的功能及卡片，简化了 Dock 栏'
        ]
    },
    {
        version: '2.6.3', date: '2025-9-10',
        changes: [
            '重新加入了子网页跳转链接',
            '对卡片进行了重新排序'
        ]
    },
    {
        version: '2.6.2', date: '2025-9-1',
        changes: [
            '修复了一些人名显示问题',
            '视频卡片槽现在真的（通过阴影）变成了一个"槽"',
            '解决了很多 BUG，实在懒得写了累死我了'
        ]
    },
    {
        version: '2.6.1', date: '2025-8-28',
        changes: [
            '停用默认文本大小，使得其在任何设备上都可以等比例显示'
        ]
    },
    {
        version: '2.6.0', date: '2025-8-26',
        changes: [
            '对代表作卡片进行了重写。现在所有的视频被横向排开，并设计了一个展示框'
        ]
    },
    {
        version: '2.5.4', date: '2025-8-25',
        changes: [
            '对代表作卡片进行了重新设计，删除了一些元素'
        ]
    },
    {
        version: '2.5.3', date: '2025-8-20',
        changes: [
            '更改了开始页的一些文案',
            '应 Cloudflare 要求，重新配置了网页'
        ]
    },
    {
        version: '2.5.2', date: '2025-7-25',
        changes: [
            '对代表作卡片进行了重新设计，显得更加宽阔，并且解决了在 Cloudflare 展示时造成的内容丢失的问题',
            '移除了下方子网页的跳转按钮'
        ]
    },
    {
        version: '2.5.1', date: '2025-7-25',
        changes: [
            '对代表作卡片进行了重新设计，并且解决了在 Cloudflare 展示时造成的内容丢失的问题'
        ]
    },
    {
        version: '2.5.0', date: '2025-7-24',
        changes: [
            '为首页增加了"代表作"卡片，用来展示 PhasWer 所产出的代表着最高质量的内容，并开发了独立接口'
        ]
    },
    {
        version: '2.4.0', date: '2025-6-27',
        changes: [
            '首次进行了移动端适配，包括调用原生代码，滚动框识别等',
            '修改了一些页间距的显示问题',
            '解决了很多 BUG'
        ]
    },
    {
        version: '2.3.0', date: '2025-6-14',
        changes: [
            '加入了新的缓动逻辑',
            '重新设计了主页的逻辑，包括主题色调，切换玻璃显示功能等【此功能在6月15日被撤回】',
            '解决了很多 BUG'
        ]
    },
    {
        version: '2.2.0', date: '2025-6-13',
        changes: [
            '创建了新的 Upers.io 子网页！Upers.io 是由灰鸢 Gledery 于2025年6月8日发起的一个 Florr.io 游戏社区和公会',
            'UI 又变得圆润一些了'
        ]
    },
    {
        version: '2.1.1', date: '2025-6-3',
        changes: [
            '为所有按钮添加了毛玻璃和阴影效果',
            'UI 又变得圆润一些了'
        ]
    },
    {
        version: '2.1.0', date: '2025-5-31',
        changes: [
            '修复了入场动画【这次没有被撤回】'
        ]
    },
    {
        version: '2.0.0', date: '2025-5-30',
        changes: [
            '首页的设计由卡片三维替换变为了滚动卡片。旨在提升全网页的可读性、逻辑性、可执行性和性能',
            '为新设计重新设计了 R 角',
            '为新设计重新设计了交互逻辑和底层代码',
            '修复了入场动画【此功能在5月17日被撤回】'
        ]
    },
    {
        version: '1.14.1', date: '2025-5-14',
        changes: [
            '触控延迟增加到了 350ms',
            '添加了入场动画【此功能在5月15日被撤回】'
        ]
    },
    {
        version: '1.14.0', date: '2025-4-19',
        changes: [
            '现在可以通过触控板和鼠标翻页了！系统会检测滑动篇幅以动态调整页面',
            '增加和调整了一些 R 角，强迫症福音'
        ]
    },
    {
        version: '1.13.2', date: '2025-4-14',
        changes: [
            '将版权等信息移到了公告页',
            '解决了很多 BUG'
        ]
    },
    {
        version: '1.13.1', date: '2025-4-13',
        changes: [
            '解决了一些文字显示的问题',
            '部分人名现在会动态启用缩略'
        ]
    }
];