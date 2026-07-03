/**
 * CLI ingestion runner: `npm run ingest`.
 * Loads .env.local / .env (no dotenv dependency), then runs the same pipeline
 * the cron route uses. Works with zero config against the local JSON store.
 */
import fs from "node:fs";
import path from "node:path";

function loadEnv(file: string) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}

loadEnv(".env.local");
loadEnv(".env");

async function main() {
  const { runIngest } = await import("@/lib/ingest/pipeline");
  const limit = Number(process.env.INGEST_LIMIT ?? 15);

  console.log("▶ AEGIS ingestion starting…");
  const report = await runIngest({ limitPerFeed: limit });

  console.log("\n── Ingestion report ─────────────────────────");
  console.log(`  backend AI     : ${report.aiUsed ? "OpenAI" : "extractive"}`);
  console.log(`  feeds polled   : ${report.feeds}`);
  console.log(`  items fetched  : ${report.fetched}`);
  console.log(`  new candidates : ${report.candidates}`);
  console.log(`  inserted       : ${report.inserted}`);
  console.log(`  skipped (dupes): ${report.skipped}`);
  console.log(`  duration       : ${report.durationMs} ms`);
  console.log("  per source:");
  for (const s of report.perSource) {
    console.log(`    • ${s.source.padEnd(22)} fetched ${s.fetched}, new ${s.new}`);
  }
  console.log("─────────────────────────────────────────────");
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
