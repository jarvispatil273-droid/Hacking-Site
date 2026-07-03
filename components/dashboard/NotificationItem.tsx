"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import type { AppNotification } from "@/types";
import { timeAgo } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";

export function NotificationItem({ n }: { n: AppNotification }) {
  const [read, setRead] = useState(n.read);

  async function markRead() {
    setRead(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      });
    } catch {
      setRead(false);
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 transition-colors",
        read ? "border-border bg-surface/30" : "border-neon/30 bg-neon/5"
      )}
    >
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border text-neon">
        <Bell className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-fg">{n.title}</p>
          {!read && <span className="h-2 w-2 shrink-0 rounded-full bg-neon" />}
        </div>
        <p className="mt-0.5 text-sm text-muted">{n.body}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted">
          <span>{timeAgo(n.createdAt)}</span>
          {n.href && (
            <Link href={n.href} className="text-neon hover:underline">
              View
            </Link>
          )}
          {!read && (
            <button
              onClick={markRead}
              className="inline-flex items-center gap-1 text-muted hover:text-neon"
            >
              <Check className="h-3 w-3" /> Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
