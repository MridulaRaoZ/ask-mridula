"use client";

import { useEffect, useRef, useState } from "react";
import { streamPost } from "@/lib/streamPost";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Why should we hire her?",
  "How deep is her fintech experience?",
  "Tell me a 0→1 story",
  "Enterprise or consumer?",
];

export default function ChatCard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    // Odd length keeps the window starting on a user turn, as the API requires.
    const history = ([...messages, { role: "user", content: q }] as Message[]).slice(-19);
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    await streamPost("/api/chat", { messages: history }, (text) =>
      setMessages([...history, { role: "assistant", content: text }]),
    );
    setBusy(false);
  }

  return (
    <section className="flex min-h-[420px] flex-col rounded-2xl border border-line bg-white p-5">
      <h2 className="font-display text-lg font-semibold">Ask anything</h2>
      <p className="mt-1 text-sm text-muted">An AI that only answers from my real career history.</p>

      <div ref={logRef} className="mt-4 flex max-h-[420px] flex-1 flex-col gap-3 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full bg-paper px-3 py-1.5 text-sm text-ink ring-1 ring-line transition hover:ring-coral"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                m.role === "user" ? "self-end bg-coral-soft text-coral-dark" : "self-start bg-paper text-ink"
              }`}
            >
              {m.content || <span className="animate-pulse text-muted">Thinking…</span>}
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={2000}
          placeholder="What did she ship at Morgan Stanley?"
          className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-4 py-2.5 text-[15px] outline-none placeholder:text-muted/70 focus:border-coral"
        />
        <button
          disabled={busy || !input.trim()}
          className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-40"
        >
          Ask
        </button>
      </form>
    </section>
  );
}
