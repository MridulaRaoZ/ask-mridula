import { recordVisit } from "@/lib/stats";

// Visit beacon from VisitTracker. Counts the visit; stores no IP or cookie.
export async function POST(request: Request) {
  const { referrer } = (await request.json().catch(() => ({}))) as { referrer?: string };
  if (!/bot|crawl|spider|preview/i.test(request.headers.get("user-agent") ?? "")) {
    await recordVisit(request, typeof referrer === "string" ? referrer.slice(0, 500) : "");
  }
  return new Response(null, { status: 204 });
}
