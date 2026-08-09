import { useId } from "react";
import { cls } from "@/lib/format";

/** Chouette Invest Copilote — recréation vectorielle du logo. */
export function OwlMark({ className }: { className?: string }) {
  const uid = useId();
  const g = `g-${uid}`;
  const b = `b-${uid}`;
  const c = `c-${uid}`;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4ade80" />
          <stop offset="1" stopColor="#2dd4bf" />
        </linearGradient>
        <linearGradient id={b} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={c} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      <path d="M31 27 C22 20 20 11 26 6 C28 13 33 17 40 19 C36 21 33 23 31 27 Z" fill={`url(#${g})`} />
      <path d="M69 27 C78 20 80 11 74 6 C72 13 67 17 60 19 C64 21 67 23 69 27 Z" fill={`url(#${b})`} />
      <circle cx="36" cy="33" r="13" fill={`url(#${g})`} />
      <circle cx="64" cy="33" r="13" fill={`url(#${b})`} />
      <circle cx="36" cy="33" r="8.5" fill="#f4f7fb" />
      <circle cx="64" cy="33" r="8.5" fill="#f4f7fb" />
      <circle cx="37.5" cy="34" r="4.6" fill="#060b18" />
      <circle cx="62.5" cy="34" r="4.6" fill="#060b18" />
      <circle cx="35.6" cy="31.6" r="1.7" fill="#ffffff" />
      <circle cx="60.6" cy="31.6" r="1.7" fill="#ffffff" />
      <path d="M45 44 L55 44 L50 53 Z" fill="#2dd4bf" />
      <path d="M46 50 C24 56 18 74 28 88 C34 95 43 97 49 95 C42 82 42 64 46 50 Z" fill={`url(#${g})`} />
      <path
        d="M56 52 C74 58 80 72 72 86 C68 92 61 95 54 95"
        fill="none"
        stroke={`url(#${b})`}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <g stroke={`url(#${c})`} strokeWidth="2" strokeLinecap="round">
        <line x1="56" y1="62" x2="56" y2="88" />
        <line x1="65" y1="55" x2="65" y2="84" />
        <line x1="74" y1="47" x2="74" y2="78" />
      </g>
      <g fill={`url(#${c})`}>
        <rect x="52.5" y="68" width="7" height="15" rx="1.8" />
        <rect x="61.5" y="60" width="7" height="17" rx="1.8" />
        <rect x="70.5" y="52" width="7" height="19" rx="1.8" />
      </g>
    </svg>
  );
}

export function Logo({
  withTagline = false,
  compact = false,
  className,
}: {
  withTagline?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cls("flex items-center gap-2.5", className)}>
      <OwlMark className={compact ? "h-8 w-8" : "h-10 w-10"} />
      <span className="leading-none">
        <span className={cls("block font-bold tracking-[0.18em] text-ink", compact ? "text-[11px]" : "text-[13px]")}>
          INVEST
        </span>
        <span
          className={cls(
            "brand-gradient-text block font-bold tracking-[0.14em]",
            compact ? "text-[13px]" : "text-[16px]",
          )}
        >
          COPILOTE
        </span>
        {withTagline && (
          <span className="mt-1 block text-[9px] font-medium tracking-[0.13em] text-ink3 uppercase">
            Analyser · Comprendre · Investir
          </span>
        )}
      </span>
    </span>
  );
}
