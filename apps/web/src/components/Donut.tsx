"use client";

import { useState } from "react";
import { classLabel, cls, fmtEur } from "@/lib/format";
import { CASH_COLOR, classColor } from "@/lib/palette";
import type { AllocationSlice } from "@/lib/types";

/** Donut de répartition — palette catégorielle validée (les deux thèmes),
 *  espaces de 2px entre segments, cash = neutre hachuré, légende étiquetée. */
export function AllocationDonut({ slices }: { slices: AllocationSlice[] }) {
  const [active, setActive] = useState<string | null>(null);
  if (!slices.length) return null;

  const R = 40;
  const C = 2 * Math.PI * R;
  const gapPct = slices.length > 1 ? 1.2 : 0;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg viewBox="0 0 100 100" className="h-36 w-36 shrink-0" role="img" aria-label="Répartition du portefeuille">
        <defs>
          <pattern id="hatch-cash" width="5" height="5" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="5" height="5" fill={CASH_COLOR} opacity="0.35" />
            <line x1="0" y1="0" x2="0" y2="5" stroke={CASH_COLOR} strokeWidth="2" />
          </pattern>
        </defs>
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--panel2)" strokeWidth="13" />
        {slices.map((s) => {
          const len = Math.max(0, (s.pct - gapPct) / 100) * C;
          const dashOffset = (-offset / 100) * C;
          offset += s.pct;
          const color = s.asset_class === "cash" ? "url(#hatch-cash)" : classColor(s.asset_class);
          return (
            <circle
              key={s.asset_class}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={color}
              strokeWidth={active === s.asset_class ? 15 : 13}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 50 50)"
              opacity={active && active !== s.asset_class ? 0.4 : 1}
              onMouseEnter={() => setActive(s.asset_class)}
              onMouseLeave={() => setActive(null)}
            />
          );
        })}
        <text
          x="50"
          y="47"
          textAnchor="middle"
          className="fill-[var(--ink)]"
          style={{ fontSize: 13, fontWeight: 700 }}
        >
          {active ? `${slices.find((s) => s.asset_class === active)?.pct ?? 0} %` : `${slices.length}`}
        </text>
        <text x="50" y="60" textAnchor="middle" className="fill-[var(--ink3)]" style={{ fontSize: 7 }}>
          {active ? classLabel(active) : slices.length > 1 ? "classes d'actifs" : "classe d'actif"}
        </text>
      </svg>

      <ul className="min-w-44 flex-1 space-y-1.5">
        {slices.map((s) => (
          <li
            key={s.asset_class}
            className={cls(
              "flex items-center gap-2.5 rounded-md px-1.5 py-0.5 text-[13px]",
              active === s.asset_class && "bg-panel2",
            )}
            onMouseEnter={() => setActive(s.asset_class)}
            onMouseLeave={() => setActive(null)}
          >
            <span
              className="h-3 w-3 shrink-0 rounded-[3px]"
              style={
                s.asset_class === "cash"
                  ? {
                      background: `repeating-linear-gradient(45deg, ${CASH_COLOR} 0 2px, transparent 2px 4px)`,
                      border: `1px solid ${CASH_COLOR}`,
                    }
                  : { background: classColor(s.asset_class) }
              }
              aria-hidden
            />
            <span className="flex-1 text-ink2">{classLabel(s.asset_class)}</span>
            <span className="font-semibold text-ink tabular-nums">{s.pct} %</span>
            <span className="w-20 text-right text-ink3 tabular-nums">{fmtEur(s.value_eur)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
