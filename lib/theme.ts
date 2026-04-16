/**
 * 微信公众号兼容的 inline style 主题定义
 *
 * ═══════════════════════════════════════════════════════
 * WeChat-first：只使用微信编辑器白名单中的 CSS 属性。
 * ═══════════════════════════════════════════════════════
 *
 * 安全属性：
 *   color, background-color, background, font-size, font-weight,
 *   font-style, font-family, line-height, text-align, text-decoration,
 *   letter-spacing, border, border-left/top/bottom/right,
 *   border-collapse, border-radius, padding, margin, width, max-width,
 *   height, display(block/inline/inline-block), white-space,
 *   word-break, vertical-align, box-sizing, overflow(hidden),
 *   list-style-type, list-style
 *
 * 不安全（禁用）：
 *   var(), calc(), flex/grid, position, box-shadow, opacity,
 *   overflow-x, transform, transition, animation
 *
 * 其他规则：
 *   - 不用 CSS 变量
 *   - 颜色只用 hex
 *   - line-height 用纯数字
 *   - font-family 只用系统字体
 */

export type StyleMap = Record<string, string>;

const FONT_FAMILY =
  '-apple-system, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
const FONT_FAMILY_MONO =
  '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace';

const BASE_COLOR = "#333333";
const SECONDARY_COLOR = "#666666";
const LINK_COLOR = "#576b95";
const CODE_BG = "#f6f8fa";
const BORDER_COLOR = "#dfe2e5";
const BLOCKQUOTE_BORDER = "#b5b5b5";
const TABLE_BORDER = "#d0d7de";
const TABLE_HEADER_BG = "#24292f";
const TABLE_HEADER_COLOR = "#ffffff";
const TABLE_EVEN_BG = "#f6f8fa";
const TABLE_ODD_BG = "#ffffff";

export const theme: Record<string, StyleMap> = {
  // ── 段落 ─────────────────────────────────────────────
  p: {
    "font-size": "15px",
    "line-height": "1.75",
    color: BASE_COLOR,
    "margin-top": "0",
    "margin-bottom": "16px",
    "font-family": FONT_FAMILY,
    "word-break": "break-word",
  },

  // ── 标题 ─────────────────────────────────────────────
  h1: {
    "font-size": "24px",
    "font-weight": "bold",
    "line-height": "1.4",
    color: "#1a1a1a",
    "margin-top": "0",
    "margin-bottom": "16px",
    "padding-bottom": "8px",
    "border-bottom": `2px solid ${BORDER_COLOR}`,
    "font-family": FONT_FAMILY,
  },
  h2: {
    "font-size": "20px",
    "font-weight": "bold",
    "line-height": "1.4",
    color: "#1a1a1a",
    "margin-top": "24px",
    "margin-bottom": "12px",
    "padding-bottom": "6px",
    "border-bottom": `1px solid ${BORDER_COLOR}`,
    "font-family": FONT_FAMILY,
  },
  h3: {
    "font-size": "17px",
    "font-weight": "bold",
    "line-height": "1.4",
    color: "#1a1a1a",
    "margin-top": "20px",
    "margin-bottom": "10px",
    "font-family": FONT_FAMILY,
  },
  h4: {
    "font-size": "15px",
    "font-weight": "bold",
    "line-height": "1.4",
    color: "#1a1a1a",
    "margin-top": "16px",
    "margin-bottom": "8px",
    "font-family": FONT_FAMILY,
  },
  h5: {
    "font-size": "14px",
    "font-weight": "bold",
    "line-height": "1.4",
    color: BASE_COLOR,
    "margin-top": "16px",
    "margin-bottom": "8px",
    "font-family": FONT_FAMILY,
  },
  h6: {
    "font-size": "13px",
    "font-weight": "bold",
    "line-height": "1.4",
    color: SECONDARY_COLOR,
    "margin-top": "16px",
    "margin-bottom": "8px",
    "font-family": FONT_FAMILY,
  },

  // ── 引用 ─────────────────────────────────────────────
  blockquote: {
    "border-left": `4px solid ${BLOCKQUOTE_BORDER}`,
    "padding-left": "16px",
    "padding-right": "8px",
    "padding-top": "4px",
    "padding-bottom": "4px",
    "margin-left": "0",
    "margin-right": "0",
    "margin-top": "0",
    "margin-bottom": "16px",
    color: SECONDARY_COLOR,
    "background-color": "#fafafa",
    "font-family": FONT_FAMILY,
  },

  // ── 列表 ─────────────────────────────────────────────
  ul: {
    "padding-left": "24px",
    "margin-top": "0",
    "margin-bottom": "16px",
    "list-style-type": "disc",
    color: BASE_COLOR,
    "font-family": FONT_FAMILY,
  },
  ol: {
    "padding-left": "24px",
    "margin-top": "0",
    "margin-bottom": "16px",
    "list-style-type": "decimal",
    color: BASE_COLOR,
    "font-family": FONT_FAMILY,
  },
  li: {
    "font-size": "15px",
    "line-height": "1.75",
    "margin-bottom": "4px",
    color: BASE_COLOR,
    "font-family": FONT_FAMILY,
  },

  // ── 代码 ─────────────────────────────────────────────
  // 代码块由 buildWeChatCodeHtml 直接构造 <pre><code> 样式
  // 此处保留 font-family 供 markdown.ts 引用
  pre: {
    "font-family": FONT_FAMILY_MONO,
  },
  // 行内代码
  "inline-code": {
    "font-family": FONT_FAMILY_MONO,
    "font-size": "13px",
    "background-color": CODE_BG,
    color: "#d63200",
    "border-radius": "3px",
    padding: "2px 5px",
    border: `1px solid ${BORDER_COLOR}`,
  },

  // ── 表格 ─────────────────────────────────────────────
  table: {
    "border-collapse": "collapse",
    width: "100%",
    "margin-top": "0",
    "margin-bottom": "20px",
    "font-size": "14px",
    "font-family": FONT_FAMILY,
    color: BASE_COLOR,
    border: `1px solid ${TABLE_BORDER}`,
  },
  thead: {},
  tbody: {},
  tr: {},
  "tr-odd": {
    "background-color": TABLE_ODD_BG,
  },
  "tr-even": {
    "background-color": TABLE_EVEN_BG,
  },
  th: {
    border: `1px solid ${TABLE_BORDER}`,
    padding: "10px 16px",
    "font-weight": "600",
    "background-color": TABLE_HEADER_BG,
    color: TABLE_HEADER_COLOR,
    "text-align": "left",
    "font-size": "13px",
    "font-family": FONT_FAMILY,
    "white-space": "nowrap",
  },
  td: {
    border: `1px solid ${TABLE_BORDER}`,
    padding: "10px 16px",
    "text-align": "left",
    "font-size": "14px",
    "line-height": "1.6",
    "font-family": FONT_FAMILY,
    color: BASE_COLOR,
  },

  // ── 链接 ─────────────────────────────────────────────
  a: {
    color: LINK_COLOR,
    "text-decoration": "none",
    "word-break": "break-all",
    "font-family": FONT_FAMILY,
  },

  // ── 图片 ─────────────────────────────────────────────
  img: {
    "max-width": "100%",
    height: "auto",
    display: "block",
    "margin-top": "8px",
    "margin-bottom": "8px",
  },

  // ── 分割线 ────────────────────────────────────────────
  hr: {
    border: "none",
    "border-top": `1px solid ${BORDER_COLOR}`,
    "margin-top": "24px",
    "margin-bottom": "24px",
  },

  // ── 强调 ─────────────────────────────────────────────
  strong: {
    "font-weight": "bold",
    color: "#1a1a1a",
  },
  em: {
    "font-style": "italic",
    color: BASE_COLOR,
  },
  del: {
    "text-decoration": "line-through",
    color: SECONDARY_COLOR,
  },

  // ── 脚注 ─────────────────────────────────────────────
  "footnotes-section": {
    "border-top": `1px solid ${BORDER_COLOR}`,
    "margin-top": "32px",
    "padding-top": "16px",
    "font-size": "13px",
    color: SECONDARY_COLOR,
    "font-family": FONT_FAMILY,
  },
  "footnote-ref": {
    color: LINK_COLOR,
    "font-size": "12px",
    "vertical-align": "super",
    "text-decoration": "none",
  },
  "footnote-back": {
    color: LINK_COLOR,
    "text-decoration": "none",
  },

  // ── 任务列表 ──────────────────────────────────────────
  "task-list-item": {
    "list-style": "none",
    "padding-left": "0",
    "font-size": "15px",
    "line-height": "1.75",
    "margin-bottom": "4px",
    color: BASE_COLOR,
    "font-family": FONT_FAMILY,
  },
};

/** 将 StyleMap 对象转为 inline style 字符串 */
export function styleToString(styles: StyleMap): string {
  return Object.entries(styles)
    .map(([k, v]) => `${k}:${v.replace(/"/g, "'")}`)
    .join(";");
}
