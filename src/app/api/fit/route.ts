import { FIT_SYSTEM, streamReply } from "@/lib/claude";

const MAX_JD_CHARS = 15000;

export async function POST(request: Request) {
  const { jd } = (await request.json()) as { jd?: string };

  if (typeof jd !== "string" || jd.trim().length < 50 || jd.length > MAX_JD_CHARS) {
    return new Response("Paste a job description between 50 and 15,000 characters.", {
      status: 400,
    });
  }

  return streamReply(
    FIT_SYSTEM,
    [{ role: "user", content: `<job_description>\n${jd}\n</job_description>` }],
    "medium",
  );
}
