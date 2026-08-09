"use client";

import Link from "next/link";
import { useState } from "react";
import { AssetSelect } from "@/components/AssetSelect";
import { IconTrash } from "@/components/icons";
import { Sparkline } from "@/components/Sparkline";
import { Card, ErrorBox, SourceStamp, Spinner, TrafficLight } from "@/components/ui";
import { api, useApi } from "@/lib/api";
import { cls, fmtPct, fmtPrice, pctColor } from "@/lib/format";
import type { WatchlistItem } from "@/lib/types";

export default function WatchlistPage() {
  const { data, error, loading, reload } = useApi<WatchlistItem[]>("/api/watchlist", {
    refreshMs: 120_000,
  });
  const [symbol, setSymbol] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await api("/api/watchlist", {
        method: "POST",
        body: JSON.stringify({ symbol, reason }),
      });
      setReason("");
      reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-ink">Watchlist</h1>
      <p className="mb-4 text-[13px] text-ink2">
        Les actifs que tu surveilles — avec, à chaque fois, <em>pourquoi</em> tu les surveilles.
        Une raison écrite aujourd&apos;hui vaut mieux qu&apos;une intuition oubliée demain.
      </p>

      <Card>
        <form onSubmit={add} className="flex flex-wrap items-end gap-3">
          <label className="min-w-52 flex-1">
            <span className="text-[11px] text-ink3">Actif</span>
            <AssetSelect value={symbol} onChange={setSymbol} className="mt-0.5" />
          </label>
          <label className="min-w-56 flex-[2]">
            <span className="text-[11px] text-ink3">Pourquoi je le surveille</span>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex : attendre un repli avant d'entrer en DCA"
              className="mt-0.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-[14px] text-ink placeholder:text-ink3"
            />
          </label>
          <button
            disabled={!symbol}
            className="brand-gradient rounded-lg px-4 py-2 text-[13px] font-semibold text-[#04121f] disabled:opacity-50"
          >
            Suivre
          </button>
        </form>
        {msg && <p className="mt-2 text-[12px] text-down">{msg}</p>}
      </Card>

      {loading && !data && <Spinner />}
      {error && !data && <ErrorBox message={error} />}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(data ?? []).map((item) => (
          <Card key={item.id} className="relative">
            <button
              onClick={async () => {
                await api(`/api/watchlist/${item.id}`, { method: "DELETE" });
                reload();
              }}
              className="absolute top-3 right-3 p-1 text-ink3 hover:text-down"
              aria-label={`Ne plus suivre ${item.symbol}`}
            >
              <IconTrash className="h-4 w-4" />
            </button>
            {item.quote ? (
              <Link href={`/actif/${encodeURIComponent(item.symbol)}`} className="block">
                <p className="pr-8 text-[14px] font-semibold text-ink">{item.quote.name}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-[15px] font-bold text-ink tabular-nums">
                    {fmtPrice(item.quote.price, item.quote.currency, item.quote.unit)}
                  </span>
                  <span
                    className={cls(
                      "text-[13px] font-semibold tabular-nums",
                      pctColor(item.quote.change_24h_pct),
                    )}
                  >
                    {fmtPct(item.quote.change_24h_pct)} <span className="text-[10px] text-ink3">24 h</span>
                  </span>
                  <Sparkline points={item.quote.sparkline_7d} width={64} height={22} />
                </div>
                <div className="mt-1.5">
                  <TrafficLight
                    color={item.quote.light.color}
                    label={item.quote.light.label}
                    reason={item.quote.light.reason}
                  />
                </div>
                <SourceStamp source={item.quote.source} asOf={item.quote.as_of} className="mt-1 block" />
              </Link>
            ) : (
              <p className="text-[14px] font-semibold text-ink">{item.symbol}</p>
            )}
            <p className="mt-2 rounded-lg bg-panel2 px-2.5 py-1.5 text-[12px] text-ink2">
              📌 {item.reason || "(aucune raison notée)"}
            </p>
          </Card>
        ))}
        {data && data.length === 0 && (
          <p className="text-sm text-ink3">Ta watchlist est vide — ajoute un premier actif ci-dessus.</p>
        )}
      </div>
    </div>
  );
}
