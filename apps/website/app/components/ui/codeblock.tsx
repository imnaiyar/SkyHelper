"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

type CodeBlockProps = {
  text: string;
  inline?: boolean;
};

export default function CodeBlock({ text, inline = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (inline) {
    return (
      <div className="inline-flex max-w-64 items-center gap-1 rounded-md bg-slate-800/50 px-2 py-1 text-xs backdrop-blur-sm">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-slate-300 scrollbar-hide">{text}</code>

        <button
          type="button"
          onClick={copy}
          className="shrink-0 text-slate-400 transition-colors hover:text-slate-200"
          aria-label="Copy"
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-slate-700/50 px-3 py-2">
        <span className="text-xs text-slate-500">Code</span>

        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-200"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 text-sm">
        <code className="font-mono text-slate-300">{text}</code>
      </pre>
    </div>
  );
}
