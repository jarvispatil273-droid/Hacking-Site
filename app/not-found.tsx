import Link from "next/link";
import { Home, Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-7xl font-bold neon-text">404</p>
      <div className="mt-4 flex items-center gap-2 font-mono text-sm text-muted">
        <Terminal className="h-4 w-4" />
        <span className="terminal-prompt">segment not found — route unresolved</span>
      </div>
      <p className="mt-4 text-muted">
        The resource you requested doesn’t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg border border-neon/50 bg-neon/10 px-4 py-2 text-sm text-neon hover:shadow-neon"
      >
        <Home className="h-4 w-4" /> Return to base
      </Link>
    </div>
  );
}
