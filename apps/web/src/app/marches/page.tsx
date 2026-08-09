"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconSearch } from "@/components/icons";
import { Sparkline } from "@/components/Sparkline";
import { ErrorBox, Spinner, TrafficLight } from "@/components/ui";
import { useApi } from "@/lib/api";
import { classLabel, cls, fmtPct, fmtPrice, pctColor } from "@/lib/format";
import type { Overview, Quote } from "@/lib/types";

export default function MarchesPage() {
  const { data, error, loading } = useApi<Overview>("/api/market/overview", { refreshMs: 120_000 });
  const [q, setQ] = useState("");

  const quotes = useMemo(() => {
    const all = (data?.groups ?? []).flatMap((g) => g.quotes);
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    return all.filter(
      (quote) =>
        quote.name.toLowerCase().includes(needle) ||
        quote.symbol.toLowerCase().includes(needle) ||
        classLabel(quote.asset_class).toLowerCase().includes(needle),
    );
  }, [data, q]);

  if (loading && !data) return <Spinner label="Chargement des marchés…" />;
  if (error && !data) return <ErrorBox message={error} />;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-ink">Marchés</h1>

      <label className="relative block">
        <IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un actif, un symbole, une classe…"
          className="w-full rounded-lg border border-line bg-panel py-2.5 pr-3 pl-9 text-[14px] text-ink placeholder:text-ink3"
        />
      </label>

      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
        {quotes.map((quote) => (
          <Row key={quote.symbol} quote={quote} />
        ))}
        {quotes.length === 0 && (
          <li className="p-6 text-center text-sm text-ink3">Aucun actif ne correspond à « {q} ».</li>
        )}
      </ul>
      <p className="mt-3 text-[12px] text-ink3">
        L&apos;univers du MVP couvre ~35 actifs représentatifs. Il s&apos;élargit dans les versions
        suivantes (fichier <code>universe.json</code> côté API).
      </p>
    </div>
  );
}

function Row({ quote }: { quote: Quote }) {
  return (
    <li>
      <Link
        href={`/actif/${encodeURIComponent(quote.symbol)}`}
        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-panel2/60"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-ink">{quote.name}</p>
          <p className="text-[11px] text-ink3">
            {quote.symbol} · {classLabel(quote.asset_class)}
          </p>
        </div>
        <Sparkline points={quote.sparkline_7d} width={64} height={24} className="max-sm:hidden" />
        <div className="w-24 text-right">
          <p className="text-[13px] font-semibold text-ink tabular-nums">
            {fmtPrice(quote.price, quote.currency, quote.unit)}
          </p>
          <p className={cls("text-[12px] font-medium tabular-nums", pctColor(quote.change_24h_pct))}>
            {fmtPct(quote.change_24h_pct)}
          </p>
        </div>
        <div className="w-24 text-right max-sm:hidden">
          <TrafficLight color={quote.light.color} label={quote.light.label} reason={quote.light.reason} />
        </div>
      </Link>
    </li>
  );
}
