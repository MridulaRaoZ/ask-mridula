import { createHash } from "node:crypto";
import { parseRole, parseRows, rate } from "./fit";
import { redis } from "./redis";

// Anonymous usage stats for the /stats page. Never stores IPs, questions, or job
// descriptions: only counts, topics, referrer sites, countries, and fit outcomes.
// Every function is a no-op without Redis and never throws into a visitor's request.

const KEEP_DAYS = 120;
const TTL = KEEP_DAYS * 24 * 60 * 60;
const day = (d = new Date()) => d.toISOString().slice(0, 10);

const TOPICS: [string, RegExp][] = [
  ["Availability and notice", /notice|join|start|availab|relocat|visa|remote|hybrid|on-?site/i],
  ["Salary and compensation", /salary|compensation|ctc|pay|package/i],
  ["Security and identity", /security|identity|access|iam|sso|rbac|cyber|provision|entitlement/i],
  ["AI and technical skills", /\bai\b|machine learning|llm|python|azure|cloud|technical|sql/i],
  ["Fintech and domain", /fintech|financ|bank|payment|telecom|telco|domain|industry/i],
  ["Leadership and stakeholders", /lead|stakeholder|team|manag|influenc|conflict|communicat/i],
  ["Projects and results", /project|built|launch|ship|0.?1|result|impact|metric|adoption|growth|case/i],
  ["Experience and background", /experience|background|years|career|role|worked|company|resume/i],
  ["Education and certifications", /educat|degree|mba|certif|course/i],
];

export function topicOf(question: string): string {
  return TOPICS.find(([, re]) => re.test(question))?.[0] ?? "Other";
}

function sourceOf(referrer: string): string {
  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "Direct or unknown";
  }
  if (/linkedin\.com|lnkd\.in/.test(host)) return "LinkedIn";
  if (/google\./.test(host)) return "Google";
  if (/mail|outlook|office\.com/.test(host)) return "Email";
  if (/whatsapp|wa\.me/.test(host)) return "WhatsApp";
  if (/vercel\.app$/.test(host)) return "Direct or unknown";
  return host;
}

async function safely(work: () => Promise<unknown>) {
  if (!redis) return;
  try {
    await work();
  } catch (error) {
    console.error("Stats write failed:", error);
  }
}

export function recordVisit(request: Request, referrer: string) {
  return safely(async () => {
    const d = day();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "";
    // Daily-salted hash counts unique visitors without keeping the IP.
    const visitor = createHash("sha256").update(`${d}|${ip}|${request.headers.get("user-agent")}`).digest("hex").slice(0, 16);
    const p = redis!.pipeline();
    p.incr(`views:${d}`).expire(`views:${d}`, TTL);
    p.pfadd(`visitors:${d}`, visitor).expire(`visitors:${d}`, TTL);
    p.zincrby("sources", 1, sourceOf(referrer));
    p.zincrby("countries", 1, request.headers.get("x-vercel-ip-country") ?? "Unknown");
    await p.exec();
  });
}

export function recordChat(question: string) {
  return safely(async () => {
    const d = day();
    const p = redis!.pipeline();
    p.incr(`chats:${d}`).expire(`chats:${d}`, TTL);
    p.zincrby("topics", 1, topicOf(question));
    await p.exec();
  });
}

export type FitRecord = {
  at: string;
  title: string;
  company: string;
  rating: string;
  met: number;
  total: number;
  via: "link" | "text";
};

export function recordFit(reply: string, via: FitRecord["via"]) {
  return safely(async () => {
    const rows = parseRows(reply);
    if (!rows.length) return;
    const role = parseRole(reply);
    const record: FitRecord = {
      at: new Date().toISOString(),
      title: role?.title ?? "Unknown role",
      company: role?.company ?? "unknown",
      rating: rate(rows),
      met: rows.filter((r) => r.mark === "✓").length,
      total: rows.length,
      via,
    };
    const d = day();
    const p = redis!.pipeline();
    p.incr(`fits:${d}`).expire(`fits:${d}`, TTL);
    p.lpush("fit-log", JSON.stringify(record)).ltrim("fit-log", 0, 199);
    await p.exec();
  });
}

export type Stats = {
  days: { date: string; views: number; visitors: number; chats: number; fits: number }[];
  sources: { name: string; count: number }[];
  countries: { name: string; count: number }[];
  topics: { name: string; count: number }[];
  fits: FitRecord[];
};

const ranked = (flat: (string | number)[]) =>
  Array.from({ length: flat.length / 2 }, (_, i) => ({ name: String(flat[2 * i]), count: Number(flat[2 * i + 1]) }));

export async function getStats(): Promise<Stats | null> {
  if (!redis) return null;
  const dates = Array.from({ length: 30 }, (_, i) => day(new Date(Date.now() - i * 864e5)));
  const p = redis.pipeline();
  for (const d of dates) {
    p.get(`views:${d}`);
    p.pfcount(`visitors:${d}`);
    p.get(`chats:${d}`);
    p.get(`fits:${d}`);
  }
  p.zrange("sources", 0, 9, { rev: true, withScores: true });
  p.zrange("countries", 0, 9, { rev: true, withScores: true });
  p.zrange("topics", 0, 19, { rev: true, withScores: true });
  p.lrange("fit-log", 0, 49);
  const r = (await p.exec()) as unknown[];
  const n = (v: unknown) => Number(v ?? 0);
  return {
    days: dates.map((date, i) => ({
      date,
      views: n(r[4 * i]),
      visitors: n(r[4 * i + 1]),
      chats: n(r[4 * i + 2]),
      fits: n(r[4 * i + 3]),
    })),
    sources: ranked(r[120] as (string | number)[]),
    countries: ranked(r[121] as (string | number)[]),
    topics: ranked(r[122] as (string | number)[]),
    // Upstash returns stored JSON strings already parsed.
    fits: (r[123] as (FitRecord | string)[]).map((f) => (typeof f === "string" ? JSON.parse(f) : f)),
  };
}
