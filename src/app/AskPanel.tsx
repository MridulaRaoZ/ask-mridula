"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What's Mridula's fintech experience?",
  "Tell me about a 0→1 product she built",
  "How has she driven adoption?",
  "Is she more enterprise or consumer?",
];

// POSTs JSON and calls onChunk with the accumulated streamed text.
async function streamPost(url: string, body: unknown, onChunk: (text: string) => void) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    onChunk(await res.text());
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onChunk(text);
  }
}

export default function AskPanel() {
  const [tab, setTab] = useState<"chat" | "fit">("chat");

  return (
    <section className="flex min-h-[560px] flex-col rounded-2xl border border-white/10 bg-[#11151c]">
      <div className="flex gap-1 border-b border-white/10 p-2">
        {(["chat", "fit"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t === "chat" ? "Ask about Mridula" : "Check fit for a role"}
          </button>
        ))}
      </div>
      {tab === "chat" ? <Chat /> : <FitCheck />}
    </section>
  );
}

function Chat() {
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
            <p className="text-zinc-400">
              Hi! I&apos;m an AI that knows Mridula&apos;s career. Ask me anything about her
              experience, or try one of these:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-emerald-400/50 hover:text-white"
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
                m.role === "user" ? "bg-emerald-500/15 text-emerald-50" : "bg-white/5 text-zinc-200"
              }`}
            >
              {m.content || <span className="animate-pulse text-zinc-500">Thinking…</span>}
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
        className="flex gap-2 border-t border-white/10 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={2000}
          placeholder="Ask about her experience…"
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-[15px] text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400/50"
        />
        <button
          disabled={busy || !input.trim()}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function FitCheck() {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);

  async function check() {
    if (busy) return;
    setBusy(true);
    setResult("");
    await streamPost("/api/fit", { jd }, setResult);
    setBusy(false);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-5">
      <p className="text-zinc-400">
        Hiring for a role? Paste the job description and get a candid read on where Mridula fits
        and what to probe in an interview.
      </p>
      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        maxLength={15000}
        rows={8}
        placeholder="Paste the job description here…"
        className="w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 text-[15px] text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400/50"
      />
      <button
        onClick={check}
        disabled={busy || jd.trim().length < 50}
        className="self-start rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-40"
      >
        {busy ? "Analyzing…" : "Check fit"}
      </button>
      {(result || busy) && (
        <div className="whitespace-pre-wrap rounded-xl bg-white/5 p-4 text-[15px] leading-relaxed text-zinc-200">
          {result || <span className="animate-pulse text-zinc-500">Reading the role…</span>}
        </div>
      )}
    </div>
  );
}
