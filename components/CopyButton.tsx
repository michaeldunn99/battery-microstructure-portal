"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = "Copy code" }: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "error">("idle");
  const [message, setMessage] = useState("");

  async function copy() {
    setStatus("copying");
    setMessage("");

    try {
      if (!navigator.clipboard?.writeText) {
        setStatus("error");
        setMessage("Clipboard access is unavailable. Select and copy the code below.");
        return;
      }

      await navigator.clipboard.writeText(text);
      setStatus("copied");
      setMessage("Code copied to the clipboard.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "The browser blocked clipboard access. Select and copy the code below."
          : "Copy failed. Select and copy the code below.",
      );
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={copy}
        disabled={status === "copying"}
        aria-busy={status === "copying"}
        className="rounded-md border border-zinc-300 bg-paper px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-100 disabled:cursor-wait disabled:opacity-60"
      >
        {status === "copying" ? "Copying…" : status === "copied" ? "Copied" : label}
      </button>
      <span role="status" aria-live="polite" aria-atomic="true" className="text-xs leading-5 text-zinc-600">
        {message}
      </span>
    </div>
  );
}
