"use client";

import { useEffect, useRef } from "react";

interface PreviewProps {
  html: string;
}

/**
 * 预览区通过 Shadow DOM 隔离外部样式（Tailwind 等），
 * 确保预览区只受 inline style 影响——与微信公众号粘贴后的环境一致。
 */
export default function Preview({ html }: PreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (hostRef.current && !shadowRef.current) {
      shadowRef.current = hostRef.current.attachShadow({ mode: "open" });
    }
  }, []);

  useEffect(() => {
    if (!shadowRef.current) {
      return;
    }
    // Shadow DOM 内部不继承外部样式，只有 inline style 生效
    shadowRef.current.innerHTML = `
      <div style="max-width:680px;margin:0 auto;padding:32px;font-family:-apple-system,'Helvetica Neue',Arial,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;color:#333333;line-height:1.75;font-size:15px;word-break:break-word;">
        ${html}
      </div>
    `;
  }, [html]);

  return (
    <div className="flex-1 overflow-auto bg-white">
      <div id="preview-content" ref={hostRef} />
    </div>
  );
}
