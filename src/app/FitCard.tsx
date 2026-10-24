"use client";

import { useState } from "react";
import { streamPost } from "@/lib/streamPost";

const BADGES = {
  Strong: { label: "Strong match", className: "bg-[#eaf3de] text-[#27500a]" },
  Good: { label: "Good match", className: "bg-teal-soft text-teal-ink" },
  Partial: { label: "Partial match", className: "bg-[#faeeda] text-[#633806]" },
  Weak: { label: "Weak match", className: "bg-[#f1efe8] text-[#444441]" },
} as const;

// Splits the streamed reply into the badge lines (see FIT_SYSTEM) and the body.
function parseFit(text: string) {
  const fit = text.match(/^Fit:\s*(Strong|Good|Partial|Weak)\b\s*[—–-]?\s*(.*)$/m);
  const evidence = text.match(/^Evidence:\s*(.*)$/m)?.[1];
  const body = text.replace(/^Fit:.*$/m, "").replace(/^Evidence:.*$/m, "").trim();
  return {
    badge: fit ? BADGES[fit[1] as keyof typeof BADGES] : null,
    verdict: fit?.[2],
    evidence,
    body: fit ? body : text,
  };
}

export default function FitCard() {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const fit = parseFit(result);

  async function check() {
    if (busy) return;
    setBusy(true);
    setResult("");
    await streamPost("/api/fit", { jd }, setResult);
    setBusy(false);
  }

  return (
    <section className="flex flex-col rounded-2xl border-2 border-coral bg-white p-5">
      <h2 className="font-display text-lg font-semibold">Hiring for a role?</h2>
      <p className="mt-1 text-sm text-muted">
        Paste your job description and see how well I match, with the evidence behind it.
      </p>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        maxLength={15000}
        rows={6}
        placeholder="Paste the job description here…"
        className="mt-4 w-full resize-y rounded-xl border border-line bg-paper p-4 text-[15px] outline-none placeholder:text-muted/70 focus:border-coral"
      />
      <button
        onClick={check}
        disabled={busy || jd.trim().length < 50}
        className="mt-3 self-start rounded-xl bg-coral px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-dark disabled:opacity-40"
      >
        {busy ? "Matching…" : "See the match"}
      </button>

      {(result || busy) && (
        <div className="mt-5 border-t border-line pt-5">
          {fit.badge ? (
            <div className="flex flex-col gap-2">
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-1.5 font-display text-lg font-semibold ${fit.badge.className}`}
              >
                <span aria-hidden="true">✓</span> {fit.badge.label}
              </span>
              {fit.evidence && <p className="text-sm font-medium text-ink">{fit.evidence}</p>}
              {fit.verdict && <p className="text-[15px] text-muted">{fit.verdict}</p>}
            </div>
          ) : null}
          <div className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
            {fit.body || <span className="animate-pulse text-muted">Reading the role…</span>}
          </div>
        </div>
      )}
    </section>
  );
}
