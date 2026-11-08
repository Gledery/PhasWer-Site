# AGENTS.md

给 AI Agent看的。人类请看 [README.md](./README.md)

---

## 1. 设计原则

- **令牌优先**：颜色、半透明底色、阴影、圆角、动效时长、渐变、布局尺寸，全部从 [core.css](./css/core.css) 顶部 `:root` 里取变量，禁止硬编码十六进制色值或魔法数字
- **交互反馈**：所有可交互元素都要有 hover 和 active 状态。**按压强度与元素大小成反比**——小按钮（tab-btn、close-btn、option-btn 等）active 用 `transform: scale(0.85)`，大卡片/大元素（shortcut-item、about-card 等）active 更接近 `scale(0.9)`。配合短时长 transition（0.15s 或 0.3s 左右）产生弹性、拟物的按压手感。**这是核心设计语言，不要改成 0.96 之类的"标准值"**——那种值在快 transition 下反而显得没反应。hover 不使用 `translateY`（大卡片除外）
- **入场动画走纯 CSS `@starting-style`**：header、hero、logo、dock、sidebar、page-hero 等「页面载入即出现」的元素，入场一律用 [core.css](./css/core.css) / [design.css](./css/design.css) 里的 `@starting-style` 实现——**默认状态 = 可见**，`@starting-style` 定义「首次渲染前」的隐藏态，浏览器自动过渡。**禁止**再用 JS `setTimeout` 加 `.animate-in`、禁止用全局 `.animate-in { ... !important }`（这套已废弃，会导致 hover/active 被迫叠 `!important` 级联）。dock 按钮因需要 stagger + hover 同属性，用 `@keyframes` + `animation-fill-mode: backwards`（动画结束后 transform 交还常规样式，hover 不受污染）。唯一例外是**卡片滚动揭示**仍由 [common.js](./js/common.js) 的 `IntersectionObserver` 加 `.animate-in`（因为要等滚入视口才触发，`@starting-style` 做不到）。角落颜文字也保留 JS `.animate-in`（动态插入需双 rAF 确保初始态渲染后再过渡）
- **不要给入场动画加全局启动延迟**：早期 JS 驱动方案下需要 0.4s 延迟作为人工缓冲窗口，但 `@starting-style` 由浏览器原生保证「首帧已布局完成」才触发过渡，不存在 JS 那种「类加上去但布局还没算好」的竞态，人工延迟多余。不要为了「防鬼畜」再加回 `--enter-delay` 或类似的全局延迟令牌。
- **不引入框架**：原生 HTML / CSS / JS，保持代码可直接阅读，第三方库一律按需懒加载
- **hover 必须触屏门控**：所有 `transform` 型 hover（scale / translateY）在触屏设备上 tap 后会粘连，必须能被 [core.css](./css/core.css) 末尾的 `@media (hover: none)` 重置掉。新增带位移的 hover 时，记得把选择器加进那个重置块
- **不要用 `transition: all`**：必须列出实际变化的属性（如 `transition: transform 0.15s ease, background-color 0.15s ease`）。`all` 会监听所有属性变化、性能差，还可能对 JS 动态改的属性产生意外动画
- **`html { zoom: 90% }` 是历史遗留**：由于历史原因全站布局、间距、字号都按 90% 缩放校准过，现在移除或改成 `font-size` 方案会导致所有尺寸失准，属于无法回滚的技术债，**不要尝试移除**

---

## 2. 控件优先级

遇到下面这些控件，**先用 [core.css](./css/core.css) 已有的 `pw-` 系列**：

| 场景 | 用这个 | 备注 |
| --- | --- | --- |
| 开关 | `.pw-switch` + `.pw-switch-track`，外层套 `.pw-switch-row` | 配 `<input type="checkbox">`，原生 input 被隐藏，靠 `:checked` 切换轨道 |
| 滑块 | `.pw-slider`，外层套 `.pw-slider-row` | 想配数值显示就接 `.pw-number` |
| 分段选择（替代原生 select） | `.pw-segmented` + `.pw-seg-btn`，选项多或容器窄时加 `.pw-segmented-wrap` | 选中态给 `.pw-seg-btn` 加 `.active` |
| 数字输入 | `.pw-number`，单位后缀用 `.pw-unit` | 已隐藏原生 spin button |
| 控件下方说明文字 | `.control-hint` | 别另起一套次要文字样式 |

只有当 `pw-` 系列确实满足不了需求时才新写控件，并且必须复用同一套设计令牌、沿用同一套 hover/active 范式，并且询问用户的意见

---

## 3. 文风

写给用户看的文案（changelog 条目、UI 文案、提示文字等）遵循以下风格：

- **句末不加句号**，列表条目也一样
- **不用 `「」` `『』` 这类符号**，需要引用就直接写或用引号
- 技术描述本身要准确严谨，但整体语气偏轻松、不端着、不官腔
- 参考现有 [changelog-data.js](./js/data/changelog-data.js) 和 [README.md](./README.md) 的写法，比如"修复了移动端画廊仍可向右滑过内容边界的问题"、"想抄哪段直接拿走就行"

---

## 4. 加密参数不能动

数据看板的加密参数是和已存历史数据绑死的，改任何一个都会导致旧密文解不开：

- 算法：**AES-256-GCM**
- 密钥派生：**PBKDF2 / SHA-256，100000 次迭代**
- salt：**16 字节随机**
- iv：**12 字节随机**
- 密文格式：`base64(salt) : base64(iv) : base64(ciphertext)`

需要动加密相关逻辑时，先确认是否兼容历史密文，不行就别动
