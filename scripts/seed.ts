/**
 * Materialize the local JSON store from seed data and print stats.
 * `npm run seed`. Useful to reset/verify the local backend.
 */
async function main() {
  const { getRepository } = await import("@/lib/repo");
  const repo = getRepository();
  const stats = await repo.stats();
  console.log("AEGIS local store seeded from data/seed/*");
  console.log(`  backend  : ${stats.backend}`);
  console.log(`  articles : ${stats.articles}`);
  console.log(`  sources  : ${stats.sources}`);
  console.log(`  cves     : ${stats.cves}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
