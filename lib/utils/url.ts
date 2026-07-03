/** URL canonicalization for de-duplication. */

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "mc_cid",
  "mc_eid",
  "ref",
  "source",
  "cmpid",
  "__twitter_impression",
];

/**
 * Strip tracking params, trailing slashes, fragments and lowercase the host so
 * two links to the same article collapse to one canonical key.
 */
export function canonicalizeUrl(raw: string): string {
  try {
    const u = new URL(raw.trim());
    u.hash = "";
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
    for (const p of TRACKING_PARAMS) u.searchParams.delete(p);
    // Sort remaining params for stability.
    u.searchParams.sort();
    let out = u.toString();
    out = out.replace(/\/$/, "");
    return out;
  } catch {
    return raw.trim();
  }
}

export function hostnameOf(raw: string): string {
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
