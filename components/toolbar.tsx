"use client";

import { useState } from "react";
import { copyHtmlToClipboard } from "@/lib/clipboard";

interface ToolbarProps {
  html: string;
}

export default function Toolbar({ html }: ToolbarProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleCopy = async () => {
    try {
      await copyHtmlToClipboard(html);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const buttonLabel = {
    idle: "复制到微信",
    success: "✓ 已复制",
    error: "复制失败，请重试",
  }[status];

  const buttonClass = {
    idle: "bg-[#07c160] hover:bg-[#06ad56] text-white",
    success: "bg-[#4caf50] text-white",
    error: "bg-red-500 text-white",
  }[status];

  return (
    <header className="flex items-center justify-between border-gray-200 border-b bg-white px-6 py-3">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-base text-gray-800">
          MD to WeChat
        </span>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-500 text-xs">
          Markdown 渲染器
        </span>
      </div>
      <button
        className={`rounded-md px-4 py-2 font-medium text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${buttonClass}`}
        disabled={status !== "idle" || !html}
        onClick={handleCopy}
        type="button"
      >
        {buttonLabel}
      </button>
    </header>
  );
}
