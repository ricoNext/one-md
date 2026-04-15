import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { styleToString, theme } from "./theme";

/**
 * 自定义 rehype 插件：将主题 inline style 注入每个 HTML 元素。
 *
 * 为了与微信公众号兼容，所有样式必须以 inline style 形式存在，
 * 不能依赖外部 CSS 或 <style> 标签。
 */
const rehypeInlineStyle: Plugin<[], Root> = () => {
  return (tree) => {
    let rowIndex = 0;

    visit(tree, "element", (node: Element, _index, parent) => {
      if (node.tagName === "table") {
        rowIndex = 0;
        applyStyle(node, "table");
      }
      handleElement(node, parent as Element | undefined, rowIndex, (n) => {
        rowIndex = n;
      });
    });
  };
};

function handleElement(
  node: Element,
  parent: Element | undefined,
  rowIndex: number,
  setRowIndex: (n: number) => void
) {
  const tag = node.tagName;

  if (tag === "code") {
    handleCode(node, parent);
    return;
  }
  if (tag === "tr") {
    // thead 内的行由 th 自行控制背景，不套用奇偶色
    if (parent?.tagName === "thead") {
      return;
    }
    const next = rowIndex + 1;
    setRowIndex(next);
    mergeStyle(node, next % 2 === 0 ? theme["tr-even"] : theme["tr-odd"]);
    return;
  }
  if (tag === "section") {
    handleSection(node);
    return;
  }
  if (tag === "a") {
    handleAnchor(node);
    return;
  }
  if (tag === "li") {
    handleListItem(node);
    return;
  }
  if (tag in theme) {
    applyStyle(node, tag);
  }
}

function handleCode(node: Element, parent: Element | undefined) {
  if (parent?.tagName === "pre") {
    return;
  }
  applyStyle(node, "inline-code");
}

function handleSection(node: Element) {
  const classes = (node.properties?.className as string[]) ?? [];
  if (classes.includes("footnotes")) {
    mergeStyle(node, theme["footnotes-section"]);
  }
}

function handleAnchor(node: Element) {
  const id = String(node.properties?.id ?? "");
  const href = String(node.properties?.href ?? "");

  if (
    id.startsWith("user-content-fnref") ||
    href.startsWith("#user-content-fn")
  ) {
    applyStyle(node, "footnote-ref");
    return;
  }
  if (
    id.startsWith("user-content-fn") ||
    href.startsWith("#user-content-fnref")
  ) {
    applyStyle(node, "footnote-back");
    return;
  }
  applyStyle(node, "a");
}

function handleListItem(node: Element) {
  const classes = (node.properties?.className as string[]) ?? [];
  if (classes.includes("task-list-item")) {
    applyStyle(node, "task-list-item");
    return;
  }
  applyStyle(node, "li");
}

function applyStyle(node: Element, key: string) {
  const styles = theme[key];
  if (!styles) {
    return;
  }
  mergeStyle(node, styles);
}

function mergeStyle(node: Element, incoming: Record<string, string>) {
  const existing = String(node.properties?.style ?? "");
  const merged = existing
    ? `${styleToString(incoming)};${existing}`
    : styleToString(incoming);
  node.properties = { ...node.properties, style: merged };
}

export default rehypeInlineStyle;
