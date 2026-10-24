import type Anthropic from "@anthropic-ai/sdk";
import { CHAT_SYSTEM, streamReply } from "@/lib/claude";
import { guard } from "@/lib/guard";

const MAX_TURNS = 20;
const MAX_CHARS = 2000;

export async function POST(request: Request) {
  const blocked = await guard(request);
  if (blocked) return blocked;

  const { messages } = (await request.json()) as {
    messages?: { role: "user" | "assistant"; content: string }[];
  };

  const valid =
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.length <= MAX_TURNS &&
    messages.every(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length > 0 &&
        m.content.length <= MAX_CHARS,
    ) &&
    messages[0].role === "user" &&
    messages[messages.length - 1].role === "user";

  if (!valid) {
    return new Response("Invalid conversation.", { status: 400 });
  }

  return streamReply(CHAT_SYSTEM, messages as Anthropic.Beta.BetaMessageParam[], "low");
}
