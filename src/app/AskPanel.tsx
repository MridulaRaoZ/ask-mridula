"use client";

import { useState } from "react";
import ChatCard from "./ChatCard";
import FitCard from "./FitCard";

export default function AskPanel() {
  const [tab, setTab] = useState<"chat" | "fit">("chat");

  return (
    <section className="flex min-h-[600px] flex-col rounded-3xl border border-line bg-white">
      <div className="flex gap-1 border-b border-line p-2">
        {(["chat", "fit"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === t ? "bg-coral-soft text-coral-dark" : "text-muted hover:text-ink"
            }`}
          >
            {t === "chat" ? "Ask about Mridula" : "Check fit for a role"}
          </button>
        ))}
      </div>
      {tab === "chat" ? <ChatCard /> : <FitCard />}
    </section>
  );
}
