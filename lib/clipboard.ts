/**
 * 将 HTML 字符串写入剪贴板（text/html 类型）。
 *
 * 微信公众号编辑器粘贴时会识别 text/html，保留 inline style，
 * 因此必须用 ClipboardItem 写入，而不是 writeText。
 */
export async function copyHtmlToClipboard(html: string): Promise<void> {
  if (!navigator.clipboard?.write) {
    throw new Error("当前浏览器不支持 Clipboard API");
  }

  const blob = new Blob([html], { type: "text/html" });
  await navigator.clipboard.write([new ClipboardItem({ "text/html": blob })]);
}
