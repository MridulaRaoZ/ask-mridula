import { FIT_SYSTEM, streamReply } from "@/lib/claude";

const MAX_JD_CHARS = 15000;
const MAX_URL_CHARS = 2000;

export async function POST(request: Request) {
  const { jd, url } = (await request.json()) as { jd?: string; url?: string };

  if (typeof url === "string") {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return new Response("That doesn't look like a valid link.", { status: 400 });
    }
    if (!/^https?:$/.test(parsed.protocol) || url.length > MAX_URL_CHARS) {
      return new Response("Use an http or https link to the job posting.", { status: 400 });
    }
    // Claude reads the posting itself with the web fetch tool, limited to this one URL.
    return streamReply(
      FIT_SYSTEM,
      [{ role: "user", content: `The job description is at this link. Fetch it, then assess the fit:\n${parsed.href}` }],
      "medium",
      [{ type: "web_fetch_20260209", name: "web_fetch", max_uses: 1, allowed_domains: [parsed.hostname] }],
    );
  }

  if (typeof jd !== "string" || jd.trim().length < 50 || jd.length > MAX_JD_CHARS) {
    return new Response("Paste a job description between 50 and 15,000 characters, or a link.", {
      status: 400,
    });
  }

  return streamReply(
    FIT_SYSTEM,
    [{ role: "user", content: `<job_description>\n${jd}\n</job_description>` }],
    "medium",
  );
}
