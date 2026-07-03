import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "CTF Arena",
  description: "Jeopardy-style capture-the-flag challenges with scoring and write-ups.",
  path: "/ctf",
});

export default function CtfPage() {
  return (
    <ComingSoon
      eyebrow="Capture the flag"
      title="CTF Arena"
      description="Sharpen your skills with jeopardy-style challenges across web, crypto, forensics, pwn and reversing."
      features={[
        "Categorized challenges with dynamic scoring",
        "Live scoreboard and team play",
        "Guided hints and post-solve write-ups",
        "Per-user progress tracked in your console",
      ]}
    />
  );
}
