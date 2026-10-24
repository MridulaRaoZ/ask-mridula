"use client";

import { useEffect, useRef, useState } from "react";
import { streamPost } from "@/lib/streamPost";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What's Mridula's fintech experience?",
  "Tell me about a 0→1 product she built",
  "How has she driven adoption?",
  "Is she more enterprise or consumer?",
];

export default function ChatCard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="text-muted">
              Hi! I&apos;m an AI that knows Mridula&apos;s career. Ask me anything about her
              experience, or try one of these:
            </p>
            <p className="text-xs text-muted">This site doesn&apos;t store your questions.</p>
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
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                m.role === "user" ? "bg-coral-soft text-coral-dark" : "bg-paper text-ink"
              }`}
            >
              {m.content || <span className="animate-pulse text-muted">Thinking…</span>}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-line p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={2000}
          placeholder="Ask about her experience…"
          className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-4 py-2.5 text-[15px] outline-none placeholder:text-muted/70 focus:border-coral"
        />
        <button
          disabled={busy || !input.trim()}
          className="rounded-xl bg-coral px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-dark disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
