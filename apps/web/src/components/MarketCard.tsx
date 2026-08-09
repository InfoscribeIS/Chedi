"use client";

import Link from "next/link";
import { fmtPct, fmtPrice, pctColor, cls } from "@/lib/format";
import type { Quote } from "@/lib/types";
import { Sparkline } from "./Sparkline";
import { SourceStamp, TrafficLight } from "./ui";

export function MarketCard({ quote }: { quote: Quote }) {
  return (
    <Link
      href={`/actif/${encodeURIComponent(quote.symbol)}`}
      className="block rounded-xl border border-line bg-panel p-3.5 transition-colors hover:border-brand3/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink">{quote.name}</p>
          <p className="text-[15px] font-bold text-ink tabular-nums">
            {fmtPrice(quote.price, quote.currency, quote.unit)}
          </p>
        </div>
        <Sparkline points={quote.sparkline_7d} width={72} height={26} className="shrink-0" />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className={cls("text-[13px] font-semibold tabular-nums", pctColor(quote.change_24h_pct))}>
          {fmtPct(quote.change_24h_pct)}
          <span className="ml-1 text-[10px] font-normal text-ink3">24 h</span>
        </span>
        <TrafficLight color={quote.light.color} label={quote.light.label} reason={quote.light.reason} />
      </div>
      <SourceStamp source={quote.source} asOf={quote.as_of} stale={quote.stale} className="mt-1.5 block truncate" />
    </Link>
  );
}
