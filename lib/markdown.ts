import type { Element, Root } from "hast";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import {
  type BundledLanguage,
  createHighlighter,
  type Highlighter,
  type ThemedToken,
} from "shiki";
import type { Plugin } from "unified";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import rehypeInlineStyle from "./rehype-inline-style";
import rehypeWeChatCompat from "./rehype-wechat-compat";
import { styleToString, theme } from "./theme";

const CODE_THEME = "one-dark-pro";

// ── Shiki 高亮器（单例，延迟初始化）───────────────────────────
let highlighter: Highlighter | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: [CODE_THEME],
      langs: [
        "javascript",
        "typescript",
        "jsx",
        "tsx",
        "python",
        "bash",
        "shell",
        "json",
        "yaml",
        "markdown",
        "html",
        "css",
        "sql",
        "go",
        "rust",
        "java",
        "cpp",
        "c",
        "php",
        "ruby",
        "swift",
        "kotlin",
        "text",
      ],
    });
  }
  return highlighter;
}

/** 语言名称展示映射 */
const LANG_DISPLAY: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  py: "Python",
  python: "Python",
  bash: "Bash",
  shell: "Shell",
  sh: "Shell",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  md: "Markdown",
  markdown: "Markdown",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  sql: "SQL",
  go: "Go",
  rust: "Rust",
  java: "Java",
  cpp: "C++",
  c: "C",
  php: "PHP",
  ruby: "Ruby",
  swift: "Swift",
  kotlin: "Kotlin",
  text: "",
};

const MONO_FONT = theme.pre["font-family"];
const CODE_BG = "#282c34";

/** 将单个 token 转为 <font color="#hex"> 标签（微信安全） */
function tokenToFont(token: ThemedToken): string {
  const escaped = escapeHtmlForCode(token.content);
  const color = token.color ?? "#abb2bf";
  return `<font color="${color}">${escaped}</font>`;
}

/** HTML 转义 + 空格保护（微信会折叠 <pre> 内空格，用 &nbsp; 兜底） */
function escapeHtmlForCode(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
    .replace(/ /g, "&nbsp;");
}

/**
 * <pre><code> 结构的代码高亮。
 *
 * 结构：
 *   <section>                          外层容器，圆角
 *     <section>LangName</section>      语言标签头
 *     <pre overflow-x:auto>            代码体，项目预览可横滑
 *       <code>
 *         <font color>token</font>\n   用 \n 换行，空格用 &nbsp;
 *       </code>
 *     </pre>
 *   </section>
 *
 * 注意：微信会剥离 overflow-x，长行在微信中会溢出或折行。
 * 项目预览中可横向滚动查看完整代码。
 */
function buildWeChatCodeHtml(
  hl: Highlighter,
  code: string,
  lang: string
): string {
  let tokens: ThemedToken[][];
  try {
    tokens = hl.codeToTokens(code, {
      lang: lang as BundledLanguage,
      theme: CODE_THEME,
    }).tokens;
  } catch {
    tokens = hl.codeToTokens(code, { lang: "text", theme: CODE_THEME }).tokens;
  }

  const linesHtml = tokens
    .map((lineTokens) => lineTokens.map(tokenToFont).join(""))
    .join("\n");

  const preStyle = styleToString({
    "background-color": CODE_BG,
    color: "#abb2bf",
    padding: "16px",
    margin: "0",
    "font-size": "13px",
    "line-height": "1.65",
    "font-family": MONO_FONT,
    "overflow-x": "auto",
  });

  const codeStyle = styleToString({
    "font-family": MONO_FONT,
    "font-size": "13px",
  });

  const bodyHtml = `<pre style="${preStyle}"><code style="${codeStyle}">${linesHtml}</code></pre>`;

  const displayLang = LANG_DISPLAY[lang.toLowerCase()] ?? lang.toUpperCase();
  const headerStyle = styleToString({
    padding: "8px 16px",
    "font-size": "12px",
    "line-height": "1",
    color: "#abb2bf",
    "background-color": CODE_BG,
    "border-bottom": "1px solid #3e4451",
    "font-family": MONO_FONT,
    "letter-spacing": "0.5px",
  });
  const headerHtml = displayLang
    ? `<section style="${headerStyle}">${displayLang}</section>`
    : "";

  const containerStyle = styleToString({
    "margin-top": "0",
    "margin-bottom": "16px",
    "border-radius": "8px",
    overflow: "hidden",
  });

  return `<section style="${containerStyle}">${headerHtml}${bodyHtml}</section>`;
}

// ── Shiki rehype 插件 ────────────────────────────────────────
function rehypeShiki(hl: Highlighter): Plugin<[], Root> {
  return () => (tree) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === undefined) {
        return;
      }

      const codeEl = node.children.find(
        (c): c is Element => c.type === "element" && c.tagName === "code"
      );
      if (!codeEl) {
        return;
      }

      const classNames = (codeEl.properties?.className as string[]) ?? [];
      const langClass = classNames.find((c) => c.startsWith("language-"));
      const lang = langClass?.replace("language-", "") ?? "text";

      const code = codeEl.children
        .map((c) => (c.type === "text" ? c.value : ""))
        .join("");

      const styledHtml = buildWeChatCodeHtml(hl, code, lang);

      (parent as Element).children.splice(index, 1, {
        type: "raw",
        value: styledHtml,
      } as never);
    });
  };
}

// ── 主渲染函数 ───────────────────────────────────────────────
export async function renderMarkdown(markdown: string): Promise<string> {
  const hl = await getHighlighter();

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeShiki(hl))
    .use(rehypeWeChatCompat)
    .use(rehypeInlineStyle)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(file);
}
