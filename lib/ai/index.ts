import OpenAI from "openai";
import { CATEGORIES, type Category } from "@/types";
import { env, hasOpenAI } from "@/lib/env";
import { splitSentences, stripHtml } from "@/lib/utils/text";

export interface EnrichInput {
  title: string;
  excerpt: string;
  sourceName: string;
  defaultCategory?: Category;
}

export interface EnrichOutput {
  summary: string;
  summaryIsAI: boolean;
  category: Category;
  tags: string[];
}

let client: OpenAI | null = null;
function openai(): OpenAI | null {
  if (!hasOpenAI()) return null;
  if (!client) client = new OpenAI({ apiKey: env.openaiKey });
  return client;
}

// --------------------------------------------------------------------------
// Deterministic fallbacks (used when no OPENAI_API_KEY is set, or on API error)
// --------------------------------------------------------------------------

/** Rank sentences by overlap with the title; return the top 2 as a summary. */
export function extractiveSummary(title: string, excerpt: string): string {
  const sentences = splitSentences(excerpt);
  if (sentences.length === 0) return stripHtml(excerpt).slice(0, 240);
  const titleWords = new Set(
    title.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
  );
  const ranked = sentences
    .map((s, i) => {
      const words = s.toLowerCase().split(/\s+/);
      const overlap = words.filter((w) => titleWords.has(w)).length;
      // Prefer earlier sentences on ties.
      return { s, score: overlap * 2 + Math.max(0, 3 - i) };
    })
    .sort((a, b) => b.score - a.score);
  const top = ranked.slice(0, 2).map((r) => r.s);
  // Preserve original order of the chosen sentences.
  const chosen = sentences.filter((s) => top.includes(s)).slice(0, 2);
  return chosen.join(" ");
}

const CATEGORY_RULES: [Category, RegExp][] = [
  ["Malware", /ransomware|malware|trojan|botnet|loader|stealer|rootkit|worm|spyware/i],
  ["Data Breach", /breach|leak(ed)?|exposed|stolen data|exfiltrat|database exposed/i],
  ["Vulnerabilities", /cve-|vulnerabilit|zero-day|0-day|rce|patch|exploit|advisory|buffer overflow/i],
  ["Cloud", /\baws\b|azure|\bgcp\b|kubernetes|\bs3\b|cloud|container|serverless/i],
  ["AppSec", /xss|sql injection|sqli|ssrf|csrf|oauth|api security|web app|request smuggling|deserializ/i],
  ["Policy", /regulation|law|government|sanction|policy|compliance|gdpr|nis2|executive order/i],
  ["Tools", /open source|released|toolkit|framework|library|github\.com/i],
  ["Threats", /phishing|apt|threat actor|campaign|espionage|nation-state|social engineering/i],
  ["Research", /research|analysis|write-up|deep dive|paper|study|technique/i],
];

const TAG_KEYWORDS = [
  "ransomware", "phishing", "zero-day", "rce", "supply-chain", "malware",
  "data-breach", "oauth", "mfa", "cloud", "kubernetes", "vpn", "ai",
  "cryptography", "iot", "apt", "exploit", "vulnerability", "identity",
];

export function keywordCategorize(
  title: string,
  excerpt: string,
  fallback: Category = "Threats"
): { category: Category; tags: string[] } {
  const text = `${title} ${excerpt}`.toLowerCase();
  let category = fallback;
  for (const [cat, re] of CATEGORY_RULES) {
    if (re.test(text)) {
      category = cat;
      break;
    }
  }
  const tags = TAG_KEYWORDS.filter((k) => text.includes(k.replace("-", " ")) || text.includes(k)).slice(0, 5);
  return { category, tags };
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

/**
 * Produce a neutral 2-3 sentence summary + category + tags. Uses OpenAI when a
 * key is configured; otherwise (or on any API failure) falls back to the
 * deterministic extractive summarizer + keyword categorizer. We only ever pass
 * the short excerpt — never full article bodies.
 */
export async function enrich(input: EnrichInput): Promise<EnrichOutput> {
  const fallback = (): EnrichOutput => {
    const { category, tags } = keywordCategorize(
      input.title,
      input.excerpt,
      input.defaultCategory
    );
    return {
      summary: extractiveSummary(input.title, input.excerpt),
      summaryIsAI: false,
      category,
      tags,
    };
  };

  const ai = openai();
  if (!ai) return fallback();

  try {
    const completion = await ai.chat.completions.create({
      model: env.openaiModel,
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a cybersecurity news editor. Given a headline and a short excerpt, write an ORIGINAL neutral 2-3 sentence summary (do not copy the excerpt verbatim, do not invent facts not implied by the input). Then classify it. Respond ONLY as JSON: " +
            `{"summary": string, "category": one of ${JSON.stringify(CATEGORIES)}, "tags": string[] (max 5, lowercase, kebab-case)}.`,
        },
        {
          role: "user",
          content: `Source: ${input.sourceName}\nHeadline: ${input.title}\nExcerpt: ${input.excerpt}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as {
      summary?: string;
      category?: string;
      tags?: string[];
    };

    const category = (CATEGORIES as readonly string[]).includes(parsed.category ?? "")
      ? (parsed.category as Category)
      : input.defaultCategory ?? "Threats";

    const summary = parsed.summary?.trim();
    if (!summary) return fallback();

    return {
      summary,
      summaryIsAI: true,
      category,
      tags: (parsed.tags ?? []).slice(0, 5).map((t) => t.toLowerCase()),
    };
  } catch {
    // Network / quota / parse failure → deterministic path keeps ingest working.
    return fallback();
  }
}
