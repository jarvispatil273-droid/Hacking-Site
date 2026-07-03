import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, ShieldAlert, Calendar } from "lucide-react";
import { getCveDetail } from "@/lib/cve/nvd";
import { SeverityBadge, CvssMeter } from "@/components/ui/Severity";
import { pageMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/utils/dates";
import { hostnameOf } from "@/lib/utils/url";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return pageMetadata({
    title: id.toUpperCase(),
    description: `Details, CVSS score, CWE mapping, and references for ${id.toUpperCase()}.`,
    path: `/cve/${id}`,
  });
}

export default async function CveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cve = await getCveDetail(id);
  if (!cve) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href="/cve"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon"
      >
        <ArrowLeft className="h-4 w-4" /> Back to CVE Explorer
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg border border-neon/40 bg-neon/10 text-neon">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-mono text-2xl font-bold sm:text-3xl">{cve.id}</h1>
            <p className="mt-1 flex items-center gap-2 text-xs text-muted">
              <Calendar className="h-3 w-3" /> Published{" "}
              {formatDate(cve.published)} · Updated {formatDate(cve.lastModified)}
            </p>
          </div>
        </div>
        <SeverityBadge severity={cve.severity} className="text-sm" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
              Description
            </h2>
            <p className="mt-3 leading-relaxed text-fg/90">{cve.description}</p>
          </div>

          {cve.references.length > 0 && (
            <div className="card mt-6 p-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                References
              </h2>
              <ul className="mt-3 space-y-2">
                {cve.references.map((r, i) => (
                  <li key={i}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-2 break-all text-sm text-muted hover:text-neon"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      <span>{r.source || hostnameOf(r.url)}</span>
                      <span className="text-xs text-muted/60">{r.url}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <CvssMeter score={cve.cvssScore} severity={cve.severity} />
            {cve.cvssVector && (
              <p className="mt-4 break-all font-mono text-[11px] text-muted">
                {cve.cvssVector}
              </p>
            )}
          </div>

          {cve.cwe.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                Weaknesses (CWE)
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {cve.cwe.map((w) => (
                  <a
                    key={w}
                    href={`https://cwe.mitre.org/data/definitions/${w.replace(
                      "CWE-",
                      ""
                    )}.html`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="chip hover:text-neon"
                  >
                    {w}
                  </a>
                ))}
              </div>
            </div>
          )}

          <a
            href={`https://nvd.nist.gov/vuln/detail/${cve.id}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center justify-center gap-2 rounded-lg border border-neon/50 bg-neon/10 px-4 py-3 text-sm text-neon transition-all hover:shadow-neon"
          >
            View on NVD <ExternalLink className="h-4 w-4" />
          </a>
        </aside>
      </div>
    </div>
  );
}
