"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "./editor";
import Preview from "./preview";
import Toolbar from "./toolbar";

const DEFAULT_CONTENT = `# 欢迎使用 One MD

这是一个 **Markdown 渲染器**，支持将渲染效果一键复制到微信公众号编辑器。

## 基本语法

### 文字样式

支持 **粗体**、*斜体*、~~删除线~~ 和 \`行内代码\`。

### 列表

无序列表：

- 第一项
- 第二项
  - 嵌套项目
  - 嵌套项目
- 第三项

有序列表：

1. 步骤一
2. 步骤二
3. 步骤三

### 引用

> 引用内容支持多行，
> 在微信中会渲染为左边带竖线的样式。

### 代码块

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

### 表格

| 功能 | 支持情况 | 备注 |
|------|----------|------|
| 粗体/斜体 | ✅ | GFM 标准 |
| 代码高亮 | ✅ | Shiki |
| 表格 | ✅ | GFM 扩展 |
| 脚注 | ✅ | 支持 |
| 数学公式 | ⏳ | 后续支持 |

### 链接与图片

[访问 GitHub](https://github.com)

### 任务列表

- [x] 完成 Markdown 解析
- [x] 实现 inline style 注入
- [x] 集成 Shiki 代码高亮
- [ ] 支持数学公式

### 脚注

这是一段带脚注的文字[^1]，点击脚注标记可以跳转。

[^1]: 这是脚注内容，会渲染在文章底部。

---

*复制前请先点击右上角「复制到微信」按钮。*
`;

const STORAGE_KEY = "md-editor-content";

function getInitialContent(): string {
  if (typeof window === "undefined") {
    return DEFAULT_CONTENT;
  }
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    return cached ?? DEFAULT_CONTENT;
  } catch {
    return DEFAULT_CONTENT;
  }
}

export default function MdEditor() {
  const [markdown, setMarkdown] = useState(getInitialContent);
  const [html, setHtml] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, markdown);
    } catch {
      // ignore storage error
    }
  }, [markdown]);

  useEffect(() => {
    if (renderTimerRef.current) {
      clearTimeout(renderTimerRef.current);
    }

    renderTimerRef.current = setTimeout(async () => {
      const { renderMarkdown } = await import("@/lib/markdown");
      const result = await renderMarkdown(markdown);
      setHtml(result);
    }, 300);

    return () => {
      if (renderTimerRef.current) {
        clearTimeout(renderTimerRef.current);
      }
    };
  }, [markdown]);

  return (
    <div className="flex h-screen flex-col">
      <Toolbar html={html} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2">
          <Editor
            onChange={setMarkdown}
            onScrollProgress={setScrollProgress}
            value={markdown}
          />
        </div>
        <div className="flex w-1/2 min-w-0 flex-col">
          <div className="border-gray-100 border-b bg-gray-50 px-4 py-2">
            <span className="font-medium text-gray-500 text-xs">预览</span>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <Preview html={html} scrollProgress={scrollProgress} />
          </div>
        </div>
      </div>
    </div>
  );
}
