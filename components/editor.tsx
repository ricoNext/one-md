"use client";

interface EditorProps {
  onChange: (value: string) => void;
  value: string;
}

export default function Editor({ value, onChange }: EditorProps) {
  return (
    <div className="flex h-full flex-col border-gray-200 border-r">
      <div className="border-gray-100 border-b bg-gray-50 px-4 py-2">
        <span className="font-medium text-gray-500 text-xs">Markdown</span>
      </div>
      <textarea
        className="flex-1 resize-none bg-white p-4 font-mono text-gray-800 text-sm outline-none placeholder:text-gray-400"
        onChange={(e) => onChange(e.target.value)}
        placeholder="在此输入 Markdown 内容…"
        spellCheck={false}
        value={value}
      />
    </div>
  );
}
