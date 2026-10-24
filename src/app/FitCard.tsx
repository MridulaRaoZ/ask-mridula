"use client";

import { useState } from "react";
import { streamPost } from "@/lib/streamPost";

const BADGES = {
  Strong: { label: "Strong match", className: "bg-[#eaf3de] text-[#27500a]" },
  Good: { label: "Good match", className: "bg-teal-soft text-teal-ink" },
  Partial: { label: "Partial match", className: "bg-[#faeeda] text-[#633806]" },
  Weak: { label: "Weak match", className: "bg-[#f1efe8] text-[#444441]" },
} as const;

const isLink = (s: string) => /^https?:\/\/\S+$/i.test(s.trim());

const MARKS = {
  "✓": { label: "Met", className: "bg-[#eaf3de] text-[#27500a]" },
  "~": { label: "Partly met", className: "bg-[#faeeda] text-[#633806]" },
  "✗": { label: "Not shown", className: "bg-[#f1efe8] text-[#5f5e5a]" },
} as const;

type Mark = keyof typeof MARKS;

// Parses the line format in FIT_FORMAT (src/lib/claude.ts); works on a partial stream.
function parseFit(text: string) {
  const fit = text.match(/^Fit:\s*(Strong|Good|Partial|Weak)\b\s*[—–-]?\s*(.*)$/m);
  const rows = [...text.matchAll(/^([✓~✗])\s*([^|\n]+?)\s*(?:\|\s*(.*))?$/gm)].map((m) => ({
    mark: m[1] as Mark,
    label: m[2],
    proof: m[3] ?? "",
  }));
  return {
    badge: fit ? BADGES[fit[1] as keyof typeof BADGES] : null,
    verdict: fit?.[2],
    rows,
    met: rows.filter((r) => r.mark === "✓").length,
    ask: text.match(/^Ask:\s*(.*)$/m)?.[1],
    other: fit ? "" : text,
  };
}

export default function FitCard() {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const fit = parseFit(result);
  const link = isLink(jd);

  async function check() {
    if (busy) return;
    setBusy(true);
    setResult("");
    await streamPost("/api/fit", link ? { url: jd.trim() } : { jd }, setResult);
    setBusy(false);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-5">
      <p className="text-muted">
        Hiring for a role? Paste a link to the job posting, or the description itself, and see how
        well Mridula matches, with the evidence behind it.
      </p>
      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        maxLength={15000}
        rows={link ? 2 : 7}
        placeholder="https://jobs.example.com/senior-pm, or paste the full description"
        className="w-full resize-y rounded-xl border border-line bg-paper p-4 text-[15px] outline-none placeholder:text-muted/70 focus:border-coral"
      />
      <button
        onClick={check}
        disabled={busy || !(link || jd.trim().length >= 50)}
        className="self-start rounded-xl bg-coral px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-dark disabled:opacity-40"
      >
        {busy ? (link ? "Reading the posting…" : "Matching…") : "See the match"}
      </button>

      {(result || busy) && (
        <div className="border-t border-line pt-5">
          {fit.badge ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-display text-lg font-semibold ${fit.badge.className}`}
                >
                  <span aria-hidden="true">✓</span> {fit.badge.label}
                </span>
                {fit.rows.length > 0 && (
                  <span className="text-sm font-semibold text-ink">
                    {fit.met} of {fit.rows.length} requirements met
                  </span>
                )}
              </div>
              {fit.verdict && <p className="text-[15px] text-muted">{fit.verdict}</p>}
              <ul className="mt-1 flex flex-col gap-2">
                {fit.rows.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      title={MARKS[r.mark].label}
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${MARKS[r.mark].className}`}
                    >
                      {r.mark}
                    </span>
                    <span className="text-[15px] leading-snug">
                      <span className="font-semibold">{r.label}</span>
                      {r.proof && <span className="text-muted"> · {r.proof}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              {fit.ask && (
                <p className="mt-1 rounded-xl bg-paper px-4 py-3 text-sm">
                  <span className="font-semibold">Worth asking: </span>
                  {fit.ask}
                </p>
              )}
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
              {fit.other || <span className="animate-pulse text-muted">Reading the role…</span>}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
