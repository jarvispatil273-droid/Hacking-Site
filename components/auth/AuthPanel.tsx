"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, Check, Terminal, ShieldCheck } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function AuthPanel() {
  const supabase = getBrowserClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  // Local/guest mode: no auth provider configured.
  if (!supabase) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-neon/40 bg-neon/10 text-neon">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold">Guest mode is active</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          No auth provider is configured, so you’re browsing as a local guest.
          Bookmarks and notifications are saved to the local store. Add Supabase
          credentials to <code className="text-neon">.env.local</code> to enable
          real accounts.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-neon/50 bg-neon/10 px-4 py-2 text-sm text-neon hover:shadow-neon"
        >
          <Terminal className="h-4 w-4" /> Enter the console
        </Link>
      </div>
    );
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const { error } = await supabase!.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="card p-8 text-center">
        <Check className="mx-auto h-10 w-10 text-neon" />
        <h2 className="mt-4 text-lg font-bold">Check your inbox</h2>
        <p className="mt-2 text-sm text-muted">
          We sent a magic sign-in link to{" "}
          <span className="text-fg">{email}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={sendLink} className="card p-8">
      <h2 className="text-lg font-bold">Sign in to AEGIS</h2>
      <p className="mt-1 text-sm text-muted">
        Passwordless magic link — no password to leak.
      </p>
      <div className="relative mt-6">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="analyst@domain.com"
          className="h-11 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-fg placeholder:text-muted focus:border-neon/60 focus:outline-none focus:ring-2 focus:ring-neon/40"
        />
      </div>
      {status === "error" && (
        <p className="mt-2 text-xs text-danger">{message}</p>
      )}
      <Button type="submit" className="mt-4 w-full" disabled={status === "loading"}>
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Send magic link"
        )}
      </Button>
    </form>
  );
}
