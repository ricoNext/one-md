# Markdown to WeChat 实现方案

## 项目目标

构建一个 Markdown 渲染器，支持将渲染效果一键复制到微信公众号编辑器，保证项目预览与微信中的渲染完全一致。

## 核心难点：微信公众号编辑器限制

| 限制 | 影响 |
|------|------|
| 不支持 `<style>` 标签 | 所有样式必须写成 inline style |
| 不支持 CSS 变量 | 不能用 `var(--xxx)`，必须硬编码值 |
| 不支持外部字体 | 只能用系统字体 |
| 不支持 `<script>` | 纯静态 HTML |
| 不支持外部图片（有限） | 图片需上传到微信 CDN 或使用 base64 |
| 部分 CSS 属性被过滤 | 需逐一测试兼容性 |

**核心原则：预览区展示的 HTML = 复制到剪贴板的 HTML = 粘贴到微信后的 HTML。**

三者使用同一份带 inline style 的 HTML，保证所见即所得。

## 技术选型

| 类别 | 选型 | 理由 |
|------|------|------|
| 框架 | Next.js 16 + React 19 | 项目已有 |
| 样式 | Tailwind CSS v4 | 仅用于编辑器 UI，不影响渲染输出 |
| Markdown 解析 | unified + remark-parse | 生态完善，插件丰富 |
| GFM 扩展 | remark-gfm | 表格、删除线、任务列表 |
| HTML 转换 | remark-rehype + rehype-stringify | 标准 AST 转换链 |
| 代码高亮 | shiki | 原生输出 inline style，完美适配微信 |
| 编辑器 | textarea（初期） | 快速起步，后续可升级 CodeMirror |

## 功能需求

- [x] 左右分栏布局：左边 Markdown 编辑，右边实时预览
- [x] 代码高亮（Shiki，inline styles）
- [x] 单一默认主题（后续可扩展）
- [x] 一键复制按钮
- [x] GFM 扩展语法（表格、删除线、任务列表）
- [x] 脚注支持
- [ ] 数学公式（后续再处理）

## 文件结构

```text
app/
  page.tsx                  # 主页面（编辑器 + 预览）
  globals.css               # 全局样式（仅用于编辑器 UI）
  layout.tsx                # 根布局
components/
  editor.tsx                # Markdown 编辑器组件（Client Component）
  preview.tsx               # 预览组件
  toolbar.tsx               # 工具栏（复制按钮等）
lib/
  markdown.ts               # Markdown → inline-styled HTML 处理管线
  theme.ts                  # 主题定义（inline style 映射）
  rehype-inline-style.ts    # 自定义 rehype 插件：注入 inline style
  clipboard.ts              # 复制到剪贴板工具函数
```

## 分步实施计划

### 第 1 步：安装依赖

Markdown 解析链（unified 生态）：

- `unified` + `remark-parse` — Markdown 解析
- `remark-gfm` — GFM 扩展
- `remark-rehype` — Markdown AST → HTML AST
- `rehype-stringify` — 输出 HTML 字符串

代码高亮：

- `shiki` — 原生输出 inline style

### 第 2 步：构建 Markdown 处理管线

创建 `lib/markdown.ts`，实现核心渲染函数：

1. 解析 Markdown → AST
2. 应用 GFM 插件
3. 转换为 HTML AST
4. 应用代码高亮（Shiki，inline styles）
5. 输出 HTML 字符串
6. 后处理：注入 inline styles

### 第 3 步：实现主题系统 + inline style 注入

创建 `lib/theme.ts` 定义主题（元素 → inline style 映射）。

创建 `lib/rehype-inline-style.ts` 自定义 rehype 插件，在 AST 阶段为每个元素注入对应的 inline style。

需要覆盖的元素：

- 标题 h1-h6
- 段落 p
- 列表 ul/ol/li
- 引用 blockquote
- 代码块 pre/code
- 行内代码 code
- 表格 table/thead/tbody/tr/th/td
- 链接 a
- 图片 img
- 分割线 hr
- 粗体 strong / 斜体 em / 删除线 del

### 第 4 步：搭建编辑器 UI

左右分栏布局：

- 左侧：`<textarea>` 编辑区
- 右侧：`dangerouslySetInnerHTML` 渲染预览
- 顶部工具栏：复制按钮

### 第 5 步：实现一键复制功能

使用 Clipboard API 将带 inline style 的 HTML 写入剪贴板：

```typescript
const blob = new Blob([html], { type: 'text/html' })
await navigator.clipboard.write([
  new ClipboardItem({ 'text/html': blob })
])
```

### 第 6 步：集成 Shiki 代码高亮

Shiki 原生输出 inline style（每个 token 带 `style="color:xxx"`），直接适配微信。

### 第 7 步：脚注支持

使用 `remark-gfm` 或 `remark-footnotes` 处理脚注语法。

### 第 8 步：整体联调 + 微信兼容性测试

微信兼容性注意事项：

- 微信会给 `<p>` 添加默认 margin，需显式覆盖
- `line-height` 用具体数值（如 `1.75`）而非百分比
- 颜色用 hex 而非 `rgb()`
- `font-family` 只用系统字体栈
- 表格需要显式 `border` inline style
- 图片加 `max-width: 100%`
- 避免使用 flexbox 和 grid

## 实施优先级

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| 1 | 安装依赖 + Markdown 处理管线（基础语法） | P0 |
| 2 | inline style 注入系统 + 主题 | P0 |
| 3 | 编辑器 UI（左右分栏） | P0 |
| 4 | 一键复制功能 | P0 |
| 5 | Shiki 代码高亮 | P0 |
| 6 | 脚注支持 | P1 |
| 7 | 微信实际测试 + 兼容性修复 | P0 |
| 8 | 数学公式渲染（后续） | P2 |
