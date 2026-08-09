"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AssetSelect } from "@/components/AssetSelect";
import { AllocationDonut } from "@/components/Donut";
import { Card, ErrorBox, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { cls, fmtEur, fmtPct } from "@/lib/format";
import type { SimResult } from "@/lib/types";

export default function SimulateurPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Simulateur />
    </Suspense>
  );
}

function Simulateur() {
  const searchParams = useSearchParams();
  const [symbol, setSymbol] = useState(searchParams.get("symbol") ?? "");
  const [amount, setAmount] = useState("200");
  const [result, setResult] = useState<SimResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<SimResult>("/api/simulator", {
        method: "POST",
        body: JSON.stringify({ symbol, amount_eur: Number(amount.replace(",", ".")) }),
      });
      setResult(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-ink">Simulateur avant investissement</h1>
      <p className="mb-4 text-[13px] text-ink2">
        « Si j&apos;investis X € sur cet actif, que devient mon portefeuille ? » — teste AVANT de
        décider, sans risquer un euro.
      </p>

      <Card>
        <form onSubmit={run} className="flex flex-wrap items-end gap-3">
          <label className="min-w-56 flex-1">
            <span className="text-[11px] text-ink3">Actif</span>
            <AssetSelect value={symbol} onChange={setSymbol} className="mt-0.5" />
          </label>
          <label className="w-36">
            <span className="text-[11px] text-ink3">Montant (€)</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              required
              className="mt-0.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-[14px] text-ink"
            />
          </label>
          <button
            disabled={busy || !symbol}
            className="brand-gradient rounded-lg px-5 py-2.5 text-[13px] font-semibold text-[#04121f] disabled:opacity-50"
          >
            {busy ? "Calcul…" : "Simuler"}
          </button>
        </form>
      </Card>

      {error && <ErrorBox message={error} />}

      {result && (
        <div className="mt-4 space-y-4">
          {result.warnings.length > 0 && (
            <div className="rounded-lg border border-warn/40 bg-warn/10 p-3.5">
              <p className="text-[12px] font-semibold text-warn uppercase">⚠ Points d&apos;attention</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[13px] text-ink">
                {result.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Avant / Après */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["Avant", result.before],
              [`Après (+${fmtEur(result.amount_eur)} sur ${result.name})`, result.after],
            ].map(([title, snap]) => {
              const s = snap as SimResult["before"];
              return (
                <Card key={title as string}>
                  <h3 className="text-[12px] font-semibold text-ink2 uppercase">{title as string}</h3>
                  <dl className="mt-2 space-y-1.5 text-[13px]">
                    <Row label="Valeur totale" value={fmtEur(s.total_value_eur)} />
                    <Row label="Cash restant" value={fmtEur(s.cash_eur)} warn={s.cash_eur < 0} />
                    <Row label="Plus grosse position" value={`${s.top_position_pct} %`} />
                    <Row label="Part crypto" value={`${s.crypto_pct} %`} />
                    <Row label="Volatilité estimée" value={`≈ ${s.est_volatility_pct} %/an`} />
                  </dl>
                  {s.allocation.length > 0 && (
                    <div className="mt-3">
                      <AllocationDonut slices={s.allocation} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Scénarios de baisse */}
          <Card>
            <h3 className="text-[12px] font-semibold text-ink2 uppercase">
              Et si {result.name} chutait ? (scénarios, pas des prédictions)
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {result.scenarios.map((sc) => (
                <div key={sc.shock_pct} className="rounded-lg border border-line bg-panel2/60 p-3 text-center">
                  <p className="text-[15px] font-bold text-down">{sc.shock_pct} %</p>
                  <p className="mt-1 text-[13px] font-semibold text-ink tabular-nums">
                    {fmtEur(sc.asset_loss_eur)}
                  </p>
                  <p className="text-[11px] text-ink3">
                    Portefeuille : {fmtEur(sc.portfolio_value_eur)} ({fmtPct(sc.portfolio_change_pct)})
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[11px] text-ink3">
              {result.note} Question utile : pourrais-tu encaisser le scénario -30 % sans vendre en
              panique ?
            </p>
          </Card>

          {/* Règles après achat */}
          <Card>
            <h3 className="text-[12px] font-semibold text-ink2 uppercase">Tes règles, après cet achat</h3>
            <ul className="mt-2 space-y-1.5">
              {result.rule_checks.map((r) => (
                <li key={r.rule} className="flex items-start gap-2.5 text-[13px]">
                  <span className={r.ok ? "text-up" : "text-down"}>{r.ok ? "✓" : "✗"}</span>
                  <span className="flex-1 text-ink2">
                    <strong className="text-ink">{r.rule}</strong> — {r.comment}
                  </span>
                </li>
              ))}
              {result.rule_checks.length === 0 && (
                <li className="text-[13px] text-ink3">
                  Renseigne ton cash et tes règles dans l&apos;onglet Portefeuille pour activer ces
                  vérifications.
                </li>
              )}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink2">{label}</dt>
      <dd className={cls("font-semibold tabular-nums", warn ? "text-down" : "text-ink")}>{value}</dd>
    </div>
  );
}
