"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function BookmarkButton({
  articleId,
  initial = false,
  className,
}: {
  articleId: string;
  initial?: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !saved;
    setSaved(next); // optimistic
    try {
      const res = await fetch("/api/bookmarks", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSaved(!next); // revert on failure
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all",
        saved
          ? "border-neon/60 bg-neon/15 text-neon shadow-neon"
          : "border-border text-muted hover:border-neon/50 hover:text-fg",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
