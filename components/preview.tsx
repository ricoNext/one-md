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
      <div style="box-sizing:border-box;width:100%;max-width:680px;min-width:0;margin:0 auto;padding:32px;min-height:100vh;background-color:#ffffff;font-family:-apple-system,'Helvetica Neue',Arial,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;color:#333333;line-height:1.75;font-size:15px;word-break:break-word;">
        ${html}
      </div>
    `;
  }, [html]);

  return (
    <div className="min-w-0 flex-1 overflow-auto bg-white">
      <div className="w-full min-w-0" id="preview-content" ref={hostRef} />
    </div>
  );
}
