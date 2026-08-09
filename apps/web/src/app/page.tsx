"use client";

import { PulseGauge } from "@/components/PulseGauge";
import { MarketCard } from "@/components/MarketCard";
import { Card, DegradedBanner, ErrorBox, Section, Spinner } from "@/components/ui";
import { useApi } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import type { Overview } from "@/lib/types";

export default function DashboardPage() {
  const { data, error, loading } = useApi<Overview>("/api/market/overview", {
    refreshMs: 60_000,
  });

  if (loading && !data) return <Spinner label="Lecture des marchés…" />;
  if (error && !data) return <ErrorBox message={error} />;
  if (!data) return null;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-ink">
        Que se passe-t-il sur les marchés ?
      </h1>

      <DegradedBanner mode={data.data_mode} />

      {/* Résumé du jour */}
      <Card className="border-l-4 border-l-brand3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-ink2 uppercase">
            Résumé du jour
          </h2>
          <span className="rounded-full bg-panel2 px-2 py-0.5 text-[10px] font-medium text-ink3">
            {data.summary.is_ai ? `généré par IA (${data.summary.generated_by})` : "généré par règles, sans IA"}
          </span>
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">{data.summary.text}</p>
        <p className="mt-2 text-[11px] text-ink3">
          {data.summary.note} · Sources : {data.summary.sources.join(", ")} ·{" "}
          {timeAgo(data.summary.as_of)}
        </p>
      </Card>

      <div className="mt-4">
        <PulseGauge pulse={data.pulse} />
      </div>

      {data.groups.map((group) => (
        <Section key={group.title} title={group.title}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.quotes.map((q) => (
              <MarketCard key={q.symbol} quote={q} />
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}
