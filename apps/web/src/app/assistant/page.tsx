"use client";

import { useEffect, useRef, useState } from "react";
import { OwlMark } from "@/components/Logo";
import { Card, ErrorBox, Spinner } from "@/components/ui";
import { api, useApi } from "@/lib/api";
import { cls } from "@/lib/format";
import type { ChatMessage, CopilotAnswer, CopilotStatus } from "@/lib/types";

const SUGGESTIONS = [
  "Pourquoi Bitcoin bouge aujourd'hui ?",
  "Quels sont les principaux risques de mon portefeuille ?",
  "Explique-moi ce que dit le Market Pulse en ce moment.",
  "C'est quoi la différence entre un ETF et une action ?",
];

interface Bubble extends ChatMessage {
  sources?: string[];
}

export default function AssistantPage() {
  const { data: status, loading } = useApi<CopilotStatus>("/api/copilot/status");
  const [messages, setMessages] = useState<Bubble[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setError(null);
    setBusy(true);
    setInput("");
    const history: ChatMessage[] = messages.slice(-8).map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: "user", content: message }]);
    try {
      const r = await api<CopilotAnswer>("/api/copilot", {
        method: "POST",
        body: JSON.stringify({ message, history }),
      });
      setMessages((m) => [...m, { role: "assistant", content: r.answer, sources: r.sources }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setMessages((m) => m.slice(0, -1));
      setInput(message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner label="Vérification du copilote…" />;

  return (
    <div className="flex min-h-[70vh] flex-col">
      <h1 className="mb-1 text-xl font-bold text-ink">Copilote IA</h1>
      <p className="mb-3 text-[13px] text-ink2">
        Il commente <strong>uniquement</strong> les données mesurées par l&apos;app (cours du
        moment, ton portefeuille) et cite ses sources. Il explique — il ne recommande jamais
        d&apos;acheter ou de vendre.
      </p>

      {!status?.available && (
        <Card className="border-warn/40 bg-warn/10">
          <p className="text-[13px] text-ink">
            <strong className="text-warn">Copilote désactivé.</strong> {status?.reason}
          </p>
          <p className="mt-1.5 text-[12px] text-ink2">
            Pour l&apos;activer : ajoute <code className="rounded bg-panel2 px-1">ANTHROPIC_API_KEY=…</code> dans{" "}
            <code className="rounded bg-panel2 px-1">apps/api/.env</code> puis relance l&apos;API. Tout le
            reste de l&apos;app fonctionne sans.
          </p>
        </Card>
      )}

      <div className="mt-3 flex-1 space-y-3">
        {messages.length === 0 && status?.available && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-line bg-panel px-3.5 py-2 text-[12px] text-ink2 hover:border-brand3/50 hover:text-ink"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={cls("flex gap-2.5", m.role === "user" ? "justify-end" : "")}>
            {m.role === "assistant" && <OwlMark className="mt-1 h-6 w-6 shrink-0" />}
            <div
              className={cls(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap",
                m.role === "user"
                  ? "rounded-br-md bg-brand2/15 text-ink"
                  : "rounded-bl-md border border-line bg-panel text-ink",
              )}
            >
              {m.content}
              {m.sources && m.sources.length > 0 && (
                <p className="mt-2 border-t border-line pt-1.5 text-[11px] text-ink3">
                  Données injectées : {m.sources.join(", ")}
                </p>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2.5">
            <OwlMark className="h-6 w-6 animate-pulse" />
            <span className="text-[13px] text-ink3">analyse des données du moment…</span>
          </div>
        )}
        {error && <ErrorBox message={error} />}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-16 mt-4 flex gap-2 md:bottom-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!status?.available || busy}
          placeholder={status?.available ? "Pose ta question…" : "Copilote désactivé (clé API manquante)"}
          className="flex-1 rounded-xl border border-line bg-panel px-4 py-3 text-[14px] text-ink placeholder:text-ink3 disabled:opacity-60"
        />
        <button
          disabled={!status?.available || busy || !input.trim()}
          className="brand-gradient rounded-xl px-5 text-[14px] font-semibold text-[#04121f] disabled:opacity-50"
        >
          Envoyer
        </button>
      </form>
      <p className="mt-2 text-[11px] text-ink3">
        Le copilote explique, il ne recommande pas. Il peut se tromper : vérifie toute information
        importante.
      </p>
    </div>
  );
}
