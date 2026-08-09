"use client";

import Link from "next/link";
import { use, useState } from "react";
import { IconArrowLeft } from "@/components/icons";
import { PriceChart } from "@/components/PriceChart";
import { Terme } from "@/components/GlossaryTerm";
import { Card, ErrorBox, SourceStamp, Spinner, TrafficLight } from "@/components/ui";
import { api, useApi } from "@/lib/api";
import { classLabel, cls, fmtPct, fmtPrice, pctColor } from "@/lib/format";
import type { AssetDetail } from "@/lib/types";

export default function AssetPage({ params }: PageProps<"/actif/[symbol]">) {
  const { symbol } = use(params);
  const decoded = decodeURIComponent(symbol);
  const { data, error, loading } = useApi<AssetDetail>(
    `/api/assets/${encodeURIComponent(decoded)}`,
    { refreshMs: 120_000 },
  );
  const [watchMsg, setWatchMsg] = useState<string | null>(null);

  if (loading && !data) return <Spinner label={`Chargement de ${decoded}…`} />;
  if (error && !data) return <ErrorBox message={error} />;
  if (!data) return null;

  const { quote, stats, why } = data;

  async function addToWatchlist() {
    const reason = window.prompt("Pourquoi surveilles-tu cet actif ? (visible dans ta watchlist)") ?? "";
    try {
      await api(`/api/watchlist`, {
        method: "POST",
        body: JSON.stringify({ symbol: decoded, reason }),
      });
      setWatchMsg("Ajouté à ta watchlist ✓");
    } catch (e) {
      setWatchMsg(e instanceof Error ? e.message : String(e));
    }
  }

  const periods: Array<[string, number | null]> = [
    ["24 h", quote.change_24h_pct],
    ["7 j", quote.change_7d_pct],
    ["1 mois", quote.change_30d_pct],
    ["1 an", quote.change_1y_pct],
  ];

  return (
    <div>
      <Link href="/marches" className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-ink3 hover:text-ink">
        <IconArrowLeft className="h-4 w-4" /> Marchés
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">{quote.name}</h1>
          <p className="text-[12px] text-ink3">
            {quote.symbol} · {classLabel(quote.asset_class)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-ink tabular-nums">
            {fmtPrice(quote.price, quote.currency, quote.unit)}
          </p>
          <TrafficLight color={quote.light.color} label={quote.light.label} reason={quote.light.reason} />
        </div>
      </div>
      <SourceStamp source={quote.source} asOf={quote.as_of} stale={quote.stale} className="mt-1 block" />
      <p className="mt-1 text-[12px] text-ink2">{quote.light.reason}</p>

      {/* Variations par période */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {periods.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line bg-panel px-2 py-2 text-center">
            <p className="text-[10px] text-ink3 uppercase">{label}</p>
            <p className={cls("text-[14px] font-semibold tabular-nums", pctColor(value))}>{fmtPct(value)}</p>
          </div>
        ))}
      </div>

      <Card className="mt-4">
        <PriceChart candles={data.candles} />
        <p className="mt-1 text-[11px] text-ink3">Historique : {data.history_source}</p>
      </Card>

      {/* Pourquoi ça bouge */}
      <Card className="mt-4">
        <h2 className="text-sm font-semibold tracking-wide text-ink2 uppercase">
          Pourquoi ça monte / baisse ?
        </h2>
        <div className="mt-2">
          <p className="text-[11px] font-semibold text-up uppercase">Faits mesurés</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[13px] text-ink2">
            {why.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        {why.interpretation && (
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-warn uppercase">Interprétation (hypothèse)</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink2">{why.interpretation}</p>
          </div>
        )}
        <p className="mt-3 text-[11px] text-ink3">{why.note}</p>
      </Card>

      {/* Chiffres clés pédagogiques */}
      <Card className="mt-4">
        <h2 className="text-sm font-semibold tracking-wide text-ink2 uppercase">Chiffres clés</h2>
        <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
          <div className="flex justify-between gap-3">
            <dt className="text-ink2">
              <Terme id="volatilite">Volatilité</Terme> (30 j, annualisée)
            </dt>
            <dd className="font-semibold text-ink tabular-nums">
              {stats.volatility_30d_annualized_pct !== null ? `≈ ${stats.volatility_30d_annualized_pct} %` : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink2">
              <Terme id="drawdown">Distance au plus haut 1 an</Terme>
            </dt>
            <dd className={cls("font-semibold tabular-nums", pctColor(stats.drawdown_from_1y_high_pct))}>
              {fmtPct(stats.drawdown_from_1y_high_pct)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink2">Plus haut / plus bas 1 an</dt>
            <dd className="font-semibold text-ink tabular-nums">
              {stats.high_1y !== null && stats.low_1y !== null
                ? `${fmtPrice(stats.high_1y, quote.currency, quote.unit)} / ${fmtPrice(stats.low_1y, quote.currency, quote.unit)}`
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink2">
              <Terme id="moyenne-mobile">Tendance (moyenne 50 j)</Terme>
            </dt>
            <dd className="text-right font-medium text-ink">{stats.trend_label || "—"}</dd>
          </div>
        </dl>
      </Card>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <Link
          href={`/simulateur?symbol=${encodeURIComponent(decoded)}`}
          className="brand-gradient rounded-lg px-4 py-2 text-[13px] font-semibold text-[#04121f]"
        >
          🧮 Simuler un achat
        </Link>
        <button
          type="button"
          onClick={addToWatchlist}
          className="rounded-lg border border-line bg-panel px-4 py-2 text-[13px] font-medium text-ink hover:bg-panel2"
        >
          👁 Ajouter à ma watchlist
        </button>
        {watchMsg && <span className="text-[12px] text-ink3">{watchMsg}</span>}
      </div>
    </div>
  );
}
