import Link from "next/link";
import { Bookmark, Bell, Newspaper, Terminal, Activity } from "lucide-react";
import type { Metadata } from "next";
import type { Article } from "@/types";
import { getRepository } from "@/lib/repo";
import { getCurrentUser } from "@/lib/auth/session";
import { NewsCard } from "@/components/news/NewsCard";
import { NotificationItem } from "@/components/dashboard/NotificationItem";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageMetadata } from "@/lib/seo/metadata";
import { backendMode } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Console",
  description: "Your saved intel, notifications and preferences.",
  path: "/dashboard",
  noindex: true,
});

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bookmark;
  label: string;
  value: string | number;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="grid h-11 w-11 place-items-center rounded-lg border border-neon/40 bg-neon/10 text-neon">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="font-mono text-2xl font-bold text-fg">{value}</div>
        <div className="text-xs uppercase tracking-widest text-muted">
          {label}
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const repo = getRepository();
  const user = await getCurrentUser();

  const [bookmarks, notifications, stats] = await Promise.all([
    repo.listBookmarks(user.id),
    repo.listNotifications(user.id),
    repo.stats(),
  ]);

  const savedArticles = (
    await Promise.all(bookmarks.map((b) => repo.getArticleById(b.articleId)))
  ).filter((a): a is Article => a !== null);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        eyebrow={`Signed in as ${user.name}${user.isGuest ? " (guest)" : ""}`}
        title="Operator Console"
        subtitle="Your saved intelligence, alerts, and digest preferences."
      />

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Bookmark} label="Saved" value={savedArticles.length} />
          <StatCard icon={Bell} label="Unread alerts" value={unread} />
          <StatCard icon={Newspaper} label="Articles in feed" value={stats.articles} />
          <StatCard icon={Activity} label="Backend" value={backendMode()} />
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Saved */}
          <section className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Bookmark className="h-5 w-5 text-neon" /> Saved articles
              </h2>
              <Link href="/news" className="text-sm text-muted hover:text-neon">
                Browse feed →
              </Link>
            </div>
            {savedArticles.length === 0 ? (
              <div className="card p-10 text-center text-sm text-muted">
                Nothing saved yet. Hit <span className="text-neon">Save</span> on
                any article to pin it here.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {savedArticles.map((a) => (
                  <NewsCard key={a.id} article={a} />
                ))}
              </div>
            )}
          </section>

          {/* Sidebar: notifications + preferences */}
          <aside className="space-y-8">
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Bell className="h-5 w-5 text-neon" /> Notifications
              </h2>
              {notifications.length === 0 ? (
                <div className="card p-6 text-center text-sm text-muted">
                  No alerts yet. Run{" "}
                  <code className="text-neon">npm run ingest</code> to generate
                  fresh-intel notifications.
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 8).map((n) => (
                    <NotificationItem key={n.id} n={n} />
                  ))}
                </div>
              )}
            </section>

            <section className="card p-6">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Terminal className="h-4 w-4 text-neon" /> Digest preferences
              </h2>
              <p className="mt-1 text-sm text-muted">
                Subscribe to the newsletter for critical alerts.
              </p>
              <div className="mt-4">
                <NewsletterForm />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
