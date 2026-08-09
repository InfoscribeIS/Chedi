"use client";

import { useState } from "react";
import { AssetSelect } from "@/components/AssetSelect";
import { AllocationDonut } from "@/components/Donut";
import { Terme } from "@/components/GlossaryTerm";
import { IconTrash } from "@/components/icons";
import { Card, ErrorBox, Section, SourceStamp, Spinner, LIGHT_TEXT } from "@/components/ui";
import { api, useApi } from "@/lib/api";
import { cls, fmtEur, fmtPct, fmtPrice, pctColor } from "@/lib/format";
import type { Portfolio, Settings } from "@/lib/types";

export default function PortefeuillePage() {
  const portfolio = useApi<Portfolio>("/api/portfolio", { refreshMs: 120_000 });
  const settings = useApi<Settings>("/api/portfolio/settings");

  if (portfolio.loading && !portfolio.data) return <Spinner label="Valorisation du portefeuille…" />;
  if (portfolio.error && !portfolio.data) return <ErrorBox message={portfolio.error} />;
  const p = portfolio.data;
  if (!p) return null;

  const reload = () => {
    portfolio.reload();
    settings.reload();
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-ink">Mon portefeuille</h1>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <p className="text-[11px] text-ink3 uppercase">Valeur totale</p>
          <p className="text-xl font-bold text-ink tabular-nums">{fmtEur(p.total_value_eur)}</p>
        </Card>
        <Card>
          <p className="text-[11px] text-ink3 uppercase">
            <Terme id="plus-value">+/- value</Terme>
          </p>
          <p className={cls("text-xl font-bold tabular-nums", pctColor(p.pnl_eur))}>
            {fmtEur(p.pnl_eur)}
            <span className="ml-1.5 text-[13px] font-semibold">({fmtPct(p.pnl_pct)})</span>
          </p>
        </Card>
        <Card>
          <p className="text-[11px] text-ink3 uppercase">Investi</p>
          <p className="text-xl font-bold text-ink tabular-nums">{fmtEur(p.invested_eur)}</p>
        </Card>
        <Card>
          <p className="text-[11px] text-ink3 uppercase">Cash disponible</p>
          <p className="text-xl font-bold text-ink tabular-nums">{fmtEur(p.cash_eur)}</p>
        </Card>
      </div>

      {/* Répartition */}
      {p.allocation.length > 0 && (
        <Section title="Répartition">
          <Card>
            <AllocationDonut slices={p.allocation} />
          </Card>
        </Section>
      )}

      {/* Carte des risques */}
      <Section title="Carte des risques">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {p.risk_cards.map((c) => (
            <Card key={c.key} className="border-l-4" >
              <div className="flex items-center gap-2">
                <span className={cls("h-2.5 w-2.5 rounded-full", {
                  green: "bg-up", orange: "bg-warn", red: "bg-down", neutral: "bg-ink3",
                }[c.level])} aria-hidden />
                <p className="text-[12px] font-semibold text-ink2 uppercase">{c.title}</p>
              </div>
              <p className={cls("mt-1.5 text-[15px] font-bold", LIGHT_TEXT[c.level])}>{c.headline}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink2">{c.detail}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Règles personnelles */}
      {p.rule_checks.length > 0 && (
        <Section title="Tes règles personnelles">
          <Card>
            <ul className="space-y-2">
              {p.rule_checks.map((r) => (
                <li key={r.rule} className="flex items-start gap-2.5 text-[13px]">
                  <span className={r.ok ? "text-up" : "text-down"}>{r.ok ? "✓" : "✗"}</span>
                  <span className="flex-1 text-ink2">
                    <strong className="text-ink">{r.rule}</strong> — {r.comment}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-ink3">
              Modifie tes règles dans le formulaire « Cash & règles » ci-dessous : elles sont
              vérifiées ici et dans chaque simulation.
            </p>
          </Card>
        </Section>
      )}

      {/* Positions */}
      <Section title={`Positions (${p.positions.length})`}>
        {p.positions.length === 0 ? (
          <Card>
            <p className="text-sm text-ink2">
              Aucune position. Ajoute ta première ligne ci-dessous — ou commence par le{" "}
              <a href="/simulateur" className="text-brand3 underline">
                simulateur
              </a>{" "}
              sans risquer un euro.
            </p>
          </Card>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
            {p.positions.map((pos) => (
              <li key={pos.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-ink">{pos.name}</p>
                  <p className="text-[11px] text-ink3">
                    {pos.quantity} × acheté {fmtPrice(pos.buy_price, pos.buy_currency)}
                    {pos.note ? ` · ${pos.note}` : ""}
                  </p>
                  <SourceStamp source={pos.source} asOf={pos.as_of} />
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-bold text-ink tabular-nums">{fmtEur(pos.value_eur)}</p>
                  <p className={cls("text-[12px] font-semibold tabular-nums", pctColor(pos.pnl_eur))}>
                    {fmtEur(pos.pnl_eur)} ({fmtPct(pos.pnl_pct)})
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (window.confirm(`Supprimer la position ${pos.name} ?`)) {
                      await api(`/api/portfolio/positions/${pos.id}`, { method: "DELETE" });
                      reload();
                    }
                  }}
                  className="p-1.5 text-ink3 hover:text-down"
                  aria-label={`Supprimer ${pos.name}`}
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AddPositionForm onDone={reload} />
        <SettingsForm current={settings.data} onDone={reload} />
      </div>
    </div>
  );
}

function AddPositionForm({ onDone }: { onDone: () => void }) {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/portfolio/positions", {
        method: "POST",
        body: JSON.stringify({
          symbol,
          quantity: Number(quantity.replace(",", ".")),
          buy_price: Number(price.replace(",", ".")),
          buy_currency: currency,
        }),
      });
      setMsg("Position ajoutée ✓");
      setQuantity("");
      setPrice("");
      onDone();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold tracking-wide text-ink2 uppercase">Ajouter une position</h3>
      <form onSubmit={submit} className="mt-3 space-y-2.5">
        <AssetSelect value={symbol} onChange={setSymbol} />
        <div className="grid grid-cols-3 gap-2.5">
          <label className="block">
            <span className="text-[11px] text-ink3">Quantité</span>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              inputMode="decimal"
              required
              placeholder="0,05"
              className="mt-0.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-[14px] text-ink"
            />
          </label>
          <label className="block">
            <span className="text-[11px] text-ink3">Prix d&apos;achat unitaire</span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              required
              placeholder="60 000"
              className="mt-0.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-[14px] text-ink"
            />
          </label>
          <label className="block">
            <span className="text-[11px] text-ink3">Devise</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-0.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-[14px] text-ink"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
        </div>
        <button
          disabled={busy || !symbol}
          className="brand-gradient rounded-lg px-4 py-2 text-[13px] font-semibold text-[#04121f] disabled:opacity-50"
        >
          Ajouter
        </button>
        {msg && <p className="text-[12px] text-ink3">{msg}</p>}
      </form>
    </Card>
  );
}

function SettingsForm({ current, onDone }: { current: Settings | null; onDone: () => void }) {
  const [cash, setCash] = useState<string | null>(null);
  const [maxCrypto, setMaxCrypto] = useState<string | null>(null);
  const [maxPos, setMaxPos] = useState<string | null>(null);
  const [reserve, setReserve] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const val = (local: string | null, remote: number | undefined) =>
    local !== null ? local : remote !== undefined ? String(remote) : "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const num = (s: string | null) => (s === null || s === "" ? null : Number(s.replace(",", ".")));
    try {
      await api("/api/portfolio/settings", {
        method: "PUT",
        body: JSON.stringify({
          cash_eur: num(cash),
          rule_max_crypto_pct: num(maxCrypto),
          rule_max_position_pct: num(maxPos),
          rule_reserve_eur: num(reserve),
        }),
      });
      setMsg("Enregistré ✓");
      onDone();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    }
  }

  const fields: Array<[string, string | null, (v: string) => void, number | undefined, string]> = [
    ["Cash disponible (€)", cash, setCash, current?.cash_eur, "500"],
    ["Crypto max (% du portefeuille)", maxCrypto, setMaxCrypto, current?.rule_max_crypto_pct, "20"],
    ["Position max (%)", maxPos, setMaxPos, current?.rule_max_position_pct, "25"],
    ["Réserve intouchable (€)", reserve, setReserve, current?.rule_reserve_eur, "200"],
  ];

  return (
    <Card>
      <h3 className="text-sm font-semibold tracking-wide text-ink2 uppercase">Cash & règles personnelles</h3>
      <p className="mt-1 text-[12px] text-ink2">
        Ton contrat avec toi-même : l&apos;app compare chaque décision à TES limites.
      </p>
      <form onSubmit={submit} className="mt-3 space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          {fields.map(([label, local, set, remote, placeholder]) => (
            <label key={label} className="block">
              <span className="text-[11px] text-ink3">{label}</span>
              <input
                value={val(local, remote)}
                onChange={(e) => set(e.target.value)}
                inputMode="decimal"
                placeholder={placeholder}
                className="mt-0.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-[14px] text-ink"
              />
            </label>
          ))}
        </div>
        <button className="rounded-lg border border-line bg-panel2 px-4 py-2 text-[13px] font-semibold text-ink">
          Enregistrer
        </button>
        {msg && <p className="text-[12px] text-ink3">{msg}</p>}
      </form>
    </Card>
  );
}
