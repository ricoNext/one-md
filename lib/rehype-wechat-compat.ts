import type { Element, Root, Text } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * WeChat 兼容性 rehype 插件：
 * 将微信不支持的 HTML 标签替换为安全的替代方案。
 *
 * 当前处理：
 * - <input type="checkbox"> → Unicode ✅ / ☐ 文字节点
 */
const rehypeWeChatCompat: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (!parent || index === undefined) {
        return;
      }

      if (node.tagName === "input") {
        replaceCheckbox(node, index, parent as Element);
      }
    });
  };
};

function replaceCheckbox(node: Element, index: number, parent: Element): void {
  const type = String(node.properties?.type ?? "");
  if (type !== "checkbox") {
    return;
  }

  const checked = Boolean(node.properties?.checked);
  const icon = checked ? "✅ " : "☐ ";

  const textNode: Text = { type: "text", value: icon };
  parent.children.splice(index, 1, textNode as never);
}

export default rehypeWeChatCompat;
