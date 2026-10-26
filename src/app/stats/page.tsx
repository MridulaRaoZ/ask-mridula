import type { Metadata } from "next";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Site stats", robots: { index: false, follow: false } };

const RATING_STYLES: Record<string, string> = {
  Strong: "bg-[#eaf3de] text-[#27500a]",
  Good: "bg-teal-soft text-teal-ink",
  Partial: "bg-[#faeeda] text-[#633806]",
  Weak: "bg-[#f1efe8] text-[#444441]",
};

function Ranked({ title, items, empty }: { title: string; items: { name: string; count: number }[]; empty: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((i) => (
            <li key={i.name} className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="truncate">{i.name}</span>
                <span className="tabular-nums text-muted">{i.count}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-paper">
                <div className="h-1.5 rounded-full bg-coral" style={{ width: `${(i.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function StatsPage() {
  const stats = await getStats();

  if (!stats) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-semibold">Site stats</h1>
        <p className="mt-3 text-muted">
          Stats storage isn&apos;t connected yet. Add Upstash Redis to the Vercel project, then redeploy.
        </p>
      </main>
    );
  }

  const sum = (k: "views" | "visitors" | "chats" | "fits", n: number) =>
    stats.days.slice(0, n).reduce((t, d) => t + d[k], 0);
  const peak = Math.max(1, ...stats.days.map((d) => d.views));
  const totals = [
    { label: "Page views", week: sum("views", 7), month: sum("views", 30) },
    { label: "Visitors", week: sum("visitors", 7), month: sum("visitors", 30) },
    { label: "Chat questions", week: sum("chats", 7), month: sum("chats", 30) },
    { label: "Fit checks", week: sum("fits", 7), month: sum("fits", 30) },
  ];

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 lg:py-12">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Site stats</h1>
        <p className="mt-1 text-sm text-muted">
          Anonymous counts only: no IP addresses, questions, or job descriptions are stored. Visitors are counted once per day.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {totals.map((t) => (
          <div key={t.label} className="rounded-2xl border border-line bg-white p-5">
            <div className="text-sm text-muted">{t.label}</div>
            <div className="mt-1 font-display text-3xl font-semibold tabular-nums">{t.week}</div>
            <div className="text-sm text-muted">last 7 days · {t.month} in 30</div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Page views, last 30 days</h2>
        <div className="mt-4 flex h-32 items-end gap-1">
          {[...stats.days].reverse().map((d) => (
            <div key={d.date} className="flex h-full flex-1 flex-col justify-end" title={`${d.date}: ${d.views} views, ${d.visitors} visitors`}>
              <div className="rounded-t bg-coral" style={{ height: `${(d.views / peak) * 100}%`, minHeight: d.views ? 3 : 0 }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>{stats.days[29].date}</span>
          <span>today</span>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Ranked title="Where visitors came from" items={stats.sources} empty="No visits yet." />
        <Ranked title="Countries" items={stats.countries} empty="No visits yet." />
        <Ranked title="What the chat is asked about" items={stats.topics} empty="No chat questions yet." />
      </div>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-lg font-semibold">Recent fit checks</h2>
        {stats.fits.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No fit checks yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted">
                <tr>
                  <th className="py-2 pr-4 font-medium">When</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Company</th>
                  <th className="py-2 pr-4 font-medium">Match</th>
                  <th className="py-2 font-medium">Via</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {stats.fits.map((f) => (
                  <tr key={f.at}>
                    <td className="whitespace-nowrap py-2 pr-4 tabular-nums text-muted">
                      {new Date(f.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
                    </td>
                    <td className="py-2 pr-4">{f.title}</td>
                    <td className="py-2 pr-4">{f.company === "unknown" ? <span className="text-muted">Not named</span> : f.company}</td>
                    <td className="whitespace-nowrap py-2 pr-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${RATING_STYLES[f.rating] ?? ""}`}>{f.rating}</span>
                      <span className="ml-2 text-muted tabular-nums">{f.met}/{f.total}</span>
                    </td>
                    <td className="py-2 text-muted">{f.via === "link" ? "Link" : "Pasted"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
