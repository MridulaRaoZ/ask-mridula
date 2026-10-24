import fs from "node:fs";
import path from "node:path";
import AskPanel from "./AskPanel";

// Drop a photo at public/mridula.jpg and it replaces the initials.
const HAS_PHOTO = fs.existsSync(path.join(process.cwd(), "public/mridula.jpg"));

const HIGHLIGHTS = [
  { value: "9+ yrs", label: "Product across fintech, SaaS & consumer" },
  { value: "1M MAU", label: "Helped scale Wooplr's social commerce app" },
  { value: "+30%", label: "Platform adoption at Morgan Stanley" },
  { value: "10 outlets", label: "Bootstrapped franchise as a founder" },
];

const COMPANIES = ["Morgan Stanley", "Synchronoss", "Wooplr", "Jucicane"];

export default function Home() {
  return (
    <main className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:py-14">
      <div className="flex flex-col gap-4">
        <section className="rounded-3xl border border-line bg-white p-6">
          <div className="flex items-center gap-4">
            {HAS_PHOTO ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/mridula.jpg"
                alt="Mridula Rao"
                className="size-20 shrink-0 rounded-2xl object-cover object-[50%_18%]"
              />
            ) : (
              <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-coral-soft font-display text-2xl font-semibold text-coral-dark">
                MR
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-coral">Senior Product Manager · Bengaluru</p>
              <h1 className="font-display text-4xl font-semibold tracking-tight">Mridula Rao</h1>
            </div>
          </div>
          <p className="mt-4 leading-relaxed text-muted">
            I build products in regulated, complex spaces, from enterprise document workflows at
            Morgan Stanley to 0→1 consumer growth at Wooplr. This site&apos;s AI knows my career;
            ask it anything.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <a
              href="mailto:aludrim@gmail.com"
              className="rounded-xl bg-ink px-4 py-2 font-semibold text-white transition hover:bg-black"
            >
              Email me
            </a>
            <a
              href="https://linkedin.com/in/mridularao5"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl px-4 py-2 font-semibold text-ink ring-1 ring-line transition hover:ring-ink"
            >
              LinkedIn
            </a>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} className="rounded-2xl border border-line bg-white p-5">
              <div className="font-display text-3xl font-semibold tracking-tight">{h.value}</div>
              <div className="mt-1 text-sm leading-snug text-muted">{h.label}</div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-sm font-medium text-muted">Where I&apos;ve worked</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {COMPANIES.map((c) => (
              <span key={c} className="rounded-full bg-teal-soft px-3 py-1 text-sm font-medium text-teal-ink">
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
