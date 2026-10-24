import fs from "node:fs";
import path from "node:path";
import ChatCard from "./ChatCard";
import FitCard from "./FitCard";

// Drop a photo at public/mridula.jpg and it replaces the initials.
const HAS_PHOTO = fs.existsSync(path.join(process.cwd(), "public/mridula.jpg"));

const STATS = ["9+ yrs in product", "Helped scale to 1M MAU", "+30% platform adoption"];

const EXPERIENCE = [
  { role: "Sr. Product Manager", company: "Morgan Stanley", years: "2021 – now" },
  { role: "Product Owner", company: "Synchronoss Technologies", years: "2017 – 2021" },
  { role: "Product Manager", company: "Wooplr", years: "2015 – 2017" },
  { role: "Product Owner", company: "RSAB IT", years: "2013 – 2015" },
  { role: "Founder", company: "Jucicane", years: "2011 – 2013" },
];

const SKILLS = ["Customer discovery", "Roadmapping", "0→1 products", "A/B testing", "Stakeholder alignment", "Agile coach"];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:px-6 sm:py-12">
      <section className="grid items-center gap-6 rounded-3xl border border-line bg-white p-6 sm:grid-cols-[160px_minmax(0,1fr)] sm:p-8">
        {HAS_PHOTO ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/mridula.jpg" alt="Mridula Rao" className="size-32 rounded-2xl object-cover sm:size-40" />
        ) : (
          <div className="flex size-32 items-center justify-center rounded-2xl bg-coral-soft font-display text-4xl font-semibold text-coral-dark sm:size-40">
            MR
          </div>
        )}
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Mridula Rao</h1>
          <p className="mt-2 text-lg text-muted">Senior PM who ships in regulated, complex spaces.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {STATS.map((s) => (
              <span key={s} className="rounded-full bg-teal-soft px-3 py-1 text-sm font-medium text-teal-ink">
                {s}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            Bengaluru · Open to Senior PM roles in fintech and enterprise SaaS
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
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
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <FitCard />
        <ChatCard />
      </div>

      <section className="grid gap-6 rounded-2xl border border-line bg-white p-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <h2 className="font-display text-lg font-semibold">Experience at a glance</h2>
          <ul className="mt-3 divide-y divide-line">
            {EXPERIENCE.map((e) => (
              <li key={e.company} className="flex justify-between gap-4 py-2.5 text-[15px]">
                <span>
                  {e.role} · <span className="text-muted">{e.company}</span>
                </span>
                <span className="shrink-0 tabular-nums text-muted">{e.years}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Strengths</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <span key={s} className="rounded-full bg-paper px-3 py-1 text-sm ring-1 ring-line">
                {s}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">MBA (Finance), Mumbai University</p>
        </div>
      </section>
    </main>
  );
}
