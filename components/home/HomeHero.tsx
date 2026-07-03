"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Terminal } from "lucide-react";
import { HeroScene } from "@/components/fx/HeroScene";
import { buttonVariants } from "@/components/ui/Button";

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i, duration: 0.6, ease: "easeOut" },
  }),
};

export function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Three.js scene */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-70 lg:block">
        <HeroScene />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg via-bg/60 to-transparent" />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 sm:py-32">
        <motion.div
          custom={0}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-neon/40 bg-neon/10 px-3 py-1 text-xs text-neon"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Ethical · Attributed · AI-summarized
        </motion.div>

        <motion.h1
          custom={1}
          variants={fade}
          initial="hidden"
          animate="show"
          className="max-w-3xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl"
        >
          The pulse of{" "}
          <span className="neon-text">cybersecurity</span>, distilled by AI.
        </motion.h1>

        <motion.p
          custom={2}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-6 max-w-xl text-base text-muted sm:text-lg"
        >
          AEGIS aggregates trusted security sources hourly, writes original neutral
          summaries, and links you straight to the source — plus a live CVE
          explorer and unified threat search.
        </motion.p>

        <motion.div
          custom={3}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Link href="/news" className={buttonVariants("primary", "lg")}>
            Explore the feed <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/cve" className={buttonVariants("outline", "lg")}>
            <Terminal className="h-4 w-4" /> CVE Explorer
          </Link>
        </motion.div>

        <motion.div
          custom={4}
          variants={fade}
          initial="hidden"
          animate="show"
          className="mt-10 max-w-md rounded-xl border border-border bg-black/40 p-4 font-mono text-xs text-muted"
        >
          <span className="text-neon">aegis@intel</span>:~$ ingest --sources 10
          --dedup --summarize
          <br />
          <span className="text-fg/80">
            ✓ feeds polled · ✓ duplicates dropped · ✓ AI summaries written
          </span>
        </motion.div>
      </div>
    </section>
  );
}
