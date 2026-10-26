// Parsing and scoring for the fit checker's line format (FIT_FORMAT in src/lib/ai.ts).
// Shared by the page, which shows the badge, and the server, which records it in stats.

export type Mark = "✓" | "~" | "✗";
export type Row = { mark: Mark; must: boolean; label: string; proof: string };
export type Rating = "Strong" | "Good" | "Partial" | "Weak";

const SCORES: Record<Mark, number> = { "✓": 1, "~": 0.5, "✗": 0 };

// Works on a partial stream: returns whichever rows have arrived so far.
export function parseRows(text: string): Row[] {
  return [...text.matchAll(/^([✓~✗])\s*(?:(must|plus)\s*\|\s*)?([^|\n]+?)\s*(?:\|\s*(.*))?$/gm)].map((m) => ({
    mark: m[1] as Mark,
    must: m[2] !== "plus",
    label: m[3],
    proof: m[4] ?? "",
  }));
}

// "Role: Senior PM, Payments at Acme" → { title, company }; company may be "unknown".
export function parseRole(text: string): { title: string; company: string } | null {
  const line = text.match(/^Role:\s*(.+)$/m)?.[1]?.trim();
  if (!line) return null;
  const at = line.lastIndexOf(" at ");
  return at > 0 ? { title: line.slice(0, at).trim(), company: line.slice(at + 4).trim() } : { title: line, company: "unknown" };
}

// The site, not the model, decides the badge: must-haves weigh double, and a
// missing must-have caps the result at Partial (two or more make it Weak).
export function rate(rows: Row[]): Rating {
  const weight = (r: Row) => (r.must ? 2 : 1);
  const total = rows.reduce((sum, r) => sum + weight(r), 0);
  const got = rows.reduce((sum, r) => sum + weight(r) * SCORES[r.mark], 0);
  const ratio = got / total;
  const mustMissing = rows.filter((r) => r.must && r.mark === "✗").length;
  if (mustMissing >= 2 || ratio < 0.4) return "Weak";
  if (mustMissing === 1 || ratio < 0.65) return "Partial";
  return ratio < 0.85 ? "Good" : "Strong";
}
