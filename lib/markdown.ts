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

const CODE_DEFAULT_COLOR = "#abb2bf";

const REFERENCE_SECTION_CLASS = "references-section";
const REFERENCE_TITLE_CLASS = "references-title";
const REFERENCE_LIST_CLASS = "references-list";
const REFERENCE_ITEM_CLASS = "references-item";
const REFERENCE_INDEX_CLASS = "reference-index";
const WWW_PREFIX_RE = /^www\./;
const MULTI_SPACE_RE = /\s+/g;
const TRAILING_SLASH_RE = /\/+$/;
const HTTP_PROTOCOL_RE = /^https?:\/\//i;
const DEFAULT_INTERNAL_HOSTS = ["one-md.vercel.app", "localhost", "127.0.0.1"];

/**
 * 将 token 转为 <span style="color:..."> 或裸文本。
 *
 * 采用 mdnice 方案：着色 token 用 <span style="color:...">, 默认色 token 不包裹
 * （<code> 已设 color 继承）。避免使用已废弃的 <font> 标签。
 */
function tokenToSpan(token: ThemedToken): string {
  const escaped = escapeHtmlForCode(token.content);
  const color = token.color ?? CODE_DEFAULT_COLOR;
  if (color.toLowerCase() === CODE_DEFAULT_COLOR) {
    return escaped;
  }
  return `<span style="${styleToString({ color, "line-height": "26px" })}">${escaped}</span>`;
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
 * <pre><code> 结构的代码高亮（mdnice 方案）。
 *
 * token 直接放在 <code> 内，不再用行级 <span> 包裹，行间以 <br> 分隔。
 * 片段之间不能写字面 \n —— <pre> 会保留标签间换行文本节点，与 <br> 叠在一起会行距异常。
 *
 * 横向滚动由 <code> 的 overflow-x:auto + display:-webkit-box 实现，
 * 语言条 header 保持固定宽度不参与滚动。
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

  // Shiki 会为末尾换行符生成一个空行，去掉以避免多余空行
  if (tokens.length > 1 && tokens.at(-1)?.length === 0) {
    tokens.pop();
  }

  const linesHtml = tokens
    .map((lineTokens) => {
      const line = lineTokens.map(tokenToSpan).join("");
      return line.length === 0 ? "&nbsp;" : line;
    })
    .join("<br>");

  const displayLang = LANG_DISPLAY[lang.toLowerCase()] ?? lang.toUpperCase();

  const preStyle = styleToString({
    "background-color": CODE_BG,
    margin: "0",
    padding: "0",
    ...(displayLang
      ? { "border-radius": "0 0 8px 8px" }
      : { "border-radius": "8px" }),
  });

  const codeStyle = styleToString({
    overflow: "auto",
    padding: "16px",
    color: CODE_DEFAULT_COLOR,
    "background-color": CODE_BG,
    "border-radius": displayLang ? "0 0 8px 8px" : "8px",
    display: "-webkit-box",
    "white-space": "nowrap",
    "word-break": "normal",
    "font-family": MONO_FONT,
    "font-size": "13px",
    "line-height": "26px",
  });

  const bodyHtml = `<pre style="${preStyle}"><code style="${codeStyle}">${linesHtml}</code></pre>`;

  const headerStyle = styleToString({
    padding: "8px 16px",
    "font-size": "12px",
    "line-height": "1",
    color: "#abb2bf",
    "background-color": CODE_BG,
    "border-bottom": "1px solid #3e4451",
    "font-family": MONO_FONT,
    "letter-spacing": "0.5px",
    ...(displayLang ? { "border-radius": "8px 8px 0 0" } : {}),
  });
  const headerHtml = displayLang
    ? `<section style="${headerStyle}">${displayLang}</section>`
    : "";

  const containerStyle = styleToString({
    "margin-top": "0",
    "margin-bottom": "16px",
    "max-width": "100%",
    "background-color": CODE_BG,
    "border-radius": "8px",
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

interface ExternalReference {
  href: string;
  label: string;
}

function normalizeHost(value: string): string {
  return value.trim().toLowerCase().replace(WWW_PREFIX_RE, "");
}

function getSiteHosts(): Set<string> {
  const hosts = new Set<string>();
  for (const host of DEFAULT_INTERNAL_HOSTS) {
    hosts.add(normalizeHost(host));
  }
  const envUrls = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
    process.env.VERCEL_URL,
  ].filter(Boolean) as string[];

  for (const raw of envUrls) {
    try {
      const input = raw.startsWith("http") ? raw : `https://${raw}`;
      const hostname = new URL(input).hostname;
      hosts.add(normalizeHost(hostname));
    } catch {
      // ignore invalid env value
    }
  }

  if (typeof window !== "undefined" && window.location.hostname) {
    hosts.add(normalizeHost(window.location.hostname));
  }

  return hosts;
}

function getNodeText(node: Element): string {
  let text = "";
  visit(node, "text", (textNode) => {
    text += String(textNode.value ?? "");
  });
  return text.replace(MULTI_SPACE_RE, " ").trim();
}

function isExternalHttpLink(href: string, siteHosts: Set<string>): boolean {
  try {
    const parsed = new URL(href);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    return !siteHosts.has(normalizeHost(parsed.hostname));
  } catch {
    return false;
  }
}

function normalizeUrlText(value: string): string {
  return value.trim().replace(TRAILING_SLASH_RE, "").toLowerCase();
}

function isBareUrlLabel(label: string, href: string): boolean {
  const labelText = label.trim();
  if (!HTTP_PROTOCOL_RE.test(labelText)) {
    return false;
  }
  return normalizeUrlText(labelText) === normalizeUrlText(href);
}

function createReferenceSection(references: ExternalReference[]): Element {
  const listItems: Element[] = references.map((ref, index) => ({
    type: "element",
    tagName: "li",
    properties: { className: [REFERENCE_ITEM_CLASS] },
    children: [
      {
        type: "text",
        value: `[${index + 1}] ${ref.label} - `,
      },
      {
        type: "element",
        tagName: "a",
        properties: { href: ref.href },
        children: [{ type: "text", value: ref.href }],
      },
    ],
  }));

  return {
    type: "element",
    tagName: "section",
    properties: { className: [REFERENCE_SECTION_CLASS] },
    children: [
      {
        type: "element",
        tagName: "p",
        properties: { className: [REFERENCE_TITLE_CLASS] },
        children: [{ type: "text", value: "参考链接" }],
      },
      {
        type: "element",
        tagName: "ul",
        properties: { className: [REFERENCE_LIST_CLASS] },
        children: listItems,
      },
    ],
  };
}

const rehypeExternalRefs: Plugin<[], Root> = () => (tree) => {
  const siteHosts = getSiteHosts();
  const seen = new Set<string>();
  const references: ExternalReference[] = [];
  const referenceIndexByHref = new Map<string, number>();

  visit(tree, "element", (node: Element) => {
    if (node.tagName !== "a") {
      return;
    }

    const href = String(node.properties?.href ?? "").trim();
    if (!(href && isExternalHttpLink(href, siteHosts)) || seen.has(href)) {
      return;
    }

    const label = getNodeText(node) || href;
    if (isBareUrlLabel(label, href)) {
      return;
    }

    seen.add(href);
    references.push({ href, label });
    referenceIndexByHref.set(href, references.length);
  });

  if (references.length === 0) {
    return;
  }

  visit(tree, "element", (node: Element) => {
    if (node.tagName !== "a") {
      return;
    }
    const href = String(node.properties?.href ?? "").trim();
    const index = referenceIndexByHref.get(href);
    if (!index) {
      return;
    }
    node.children.push({
      type: "element",
      tagName: "sup",
      properties: { className: [REFERENCE_INDEX_CLASS] },
      children: [{ type: "text", value: `[${index}]` }],
    } as never);
  });

  tree.children.push(createReferenceSection(references) as never);
};

// ── 主渲染函数 ───────────────────────────────────────────────
export async function renderMarkdown(markdown: string): Promise<string> {
  const hl = await getHighlighter();

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeExternalRefs)
    .use(rehypeShiki(hl))
    .use(rehypeWeChatCompat)
    .use(rehypeInlineStyle)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(file);
}
