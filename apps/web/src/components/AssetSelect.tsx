"use client";

import { useApi } from "@/lib/api";
import { classLabel } from "@/lib/format";
import type { AssetRef } from "@/lib/types";

export function AssetSelect({
  value,
  onChange,
  id,
  className,
}: {
  value: string;
  onChange: (symbol: string) => void;
  id?: string;
  className?: string;
}) {
  const { data: assets } = useApi<AssetRef[]>("/api/market/assets");

  const byClass = new Map<string, AssetRef[]>();
  for (const a of assets ?? []) {
    const list = byClass.get(a.asset_class) ?? [];
    list.push(a);
    byClass.set(a.asset_class, list);
  }

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        "w-full rounded-lg border border-line bg-panel px-3 py-2 text-[14px] text-ink " +
        (className ?? "")
      }
    >
      <option value="" disabled>
        Choisis un actif…
      </option>
      {[...byClass.entries()].map(([assetClass, list]) => (
        <optgroup key={assetClass} label={classLabel(assetClass)}>
          {list.map((a) => (
            <option key={a.symbol} value={a.symbol}>
              {a.name} ({a.symbol})
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
