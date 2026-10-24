import AskPanel from "./AskPanel";

const HIGHLIGHTS = [
  { value: "9+ yrs", label: "Product across fintech, SaaS & consumer" },
  { value: "1M MAU", label: "Helped scale Wooplr's social commerce app" },
  { value: "+30%", label: "Platform adoption at Morgan Stanley" },
  { value: "10 outlets", label: "Bootstrapped franchise as a founder" },
];

const COMPANIES = ["Morgan Stanley", "Synchronoss", "Wooplr", "Jucicane"];

export default function Home() {
  return (
    <main className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:py-16">
      <div className="flex flex-col gap-4">
        <section className="rounded-2xl border border-white/10 bg-[#11151c] p-6">
          <p className="text-sm font-medium text-emerald-400">Senior Product Manager · Bengaluru</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Mridula Rao</h1>
          <p className="mt-3 leading-relaxed text-zinc-400">
            I build products in regulated, complex spaces, from enterprise document workflows at
            Morgan Stanley to 0→1 consumer growth at Wooplr. This site&apos;s AI knows my career;
            ask it anything.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <a
              href="mailto:aludrim@gmail.com"
              className="rounded-lg bg-white px-4 py-2 font-medium text-black transition hover:bg-zinc-200"
            >
              Email me
            </a>
            <a
              href="https://linkedin.com/in/mridularao5"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/15 px-4 py-2 font-medium text-zinc-200 transition hover:border-white/40"
            >
              LinkedIn
            </a>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} className="rounded-2xl border border-white/10 bg-[#11151c] p-5">
              <div className="text-2xl font-semibold text-white">{h.value}</div>
              <div className="mt-1 text-sm leading-snug text-zinc-400">{h.label}</div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#11151c] p-6">
          <h2 className="text-sm font-medium text-zinc-400">Where I&apos;ve worked</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {COMPANIES.map((c) => (
              <span key={c} className="rounded-full bg-white/5 px-3 py-1 text-sm text-zinc-200">
                {c}
              </span>
            ))}
          </div>
        </section>
      </div>

      <AskPanel />
    </main>
  );
}
