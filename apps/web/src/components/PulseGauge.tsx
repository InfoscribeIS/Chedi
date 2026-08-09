"use client";

import { useState } from "react";
import { cls } from "@/lib/format";
import type { Pulse } from "@/lib/types";
import { Card } from "./ui";

function band(score: number): { text: string; bar: string } {
  if (score >= 65) return { text: "text-up", bar: "bg-up" };
  if (score >= 45) return { text: "text-warn", bar: "bg-warn" };
  return { text: "text-down", bar: "bg-down" };
}

/** Market Pulse : le score composite n'est JAMAIS montré sans ses sous-scores. */
export function PulseGauge({ pulse }: { pulse: Pulse }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const b = band(pulse.score);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-ink2 uppercase">Market Pulse</h2>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-ink tabular-nums">{pulse.score}</span>
            <span className="text-sm text-ink3">/100</span>
            <span className={cls("text-sm font-semibold", b.text)}>{pulse.label}</span>
          </div>
        </div>
        <p className="hidden max-w-[46%] text-right text-[11px] leading-snug text-ink3 sm:block">
          {pulse.disclaimer}
        </p>
      </div>

      {/* Jauge 0-100 */}
      <div className="relative mt-3 h-2 rounded-full bg-panel2" role="img" aria-label={`Score ${pulse.score} sur 100`}>
        <div
          className={cls("absolute inset-y-0 left-0 rounded-full", b.bar)}
          style={{ width: `${pulse.score}%` }}
        />
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-panel bg-ink"
          style={{ left: `${pulse.score}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-ink3">
        <span>0 · tendu</span>
        <span>50 · neutre</span>
        <span>100 · euphorie</span>
      </div>

      {/* Sous-scores transparents */}
      <div className="mt-4 space-y-2">
        {pulse.subscores.map((s) => {
          const sb = band(s.score);
          const open = openKey === s.key;
          return (
            <div key={s.key}>
              <button
                type="button"
                onClick={() => setOpenKey(open ? null : s.key)}
                className="flex w-full items-center gap-3 text-left"
                aria-expanded={open}
              >
                <span className="w-32 shrink-0 text-[12px] text-ink2">{s.name}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel2">
                  <span className={cls("block h-full rounded-full", sb.bar)} style={{ width: `${s.score}%` }} />
                </span>
                <span className={cls("w-8 text-right text-[12px] font-semibold tabular-nums", sb.text)}>
                  {s.score}
                </span>
                <span className="text-ink3 text-[10px]">{open ? "▲" : "▼"}</span>
              </button>
              {open && (
                <p className="mt-1.5 ml-32 rounded-lg bg-panel2 p-2.5 text-[12px] leading-relaxed text-ink2 max-sm:ml-0">
                  {s.explanation}
                  <span className="mt-1 block text-[10px] text-ink3">Source : {s.source}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-snug text-ink3 sm:hidden">{pulse.disclaimer}</p>
    </Card>
  );
}
