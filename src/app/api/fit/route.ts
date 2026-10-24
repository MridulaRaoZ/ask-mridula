import { FIT_SYSTEM, streamReply } from "@/lib/ai";
import { guard } from "@/lib/guard";

const MAX_JD_CHARS = 15000;
const MAX_URL_CHARS = 2000;

export async function POST(request: Request) {
  const blocked = await guard(request);
  if (blocked) return blocked;

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
    // Gemini reads the posting itself with its URL context tool.
    return streamReply(
      FIT_SYSTEM,
      [{ role: "user", content: `The job description is at this link. Read it, then assess the fit:\n${parsed.href}` }],
      true,
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
  );
}
