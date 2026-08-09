import type { ReactNode } from "react";
import { cls, timeAgo } from "@/lib/format";
import type { LightColor } from "@/lib/types";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cls("rounded-xl border border-line bg-panel p-4", className)}>
      {children}
    </div>
  );
}

export function Section({
  title,
  children,
  aside,
  className,
}: {
  title: string;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cls("mt-6", className)}>
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-ink2 uppercase">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Traçabilité : source + fraîcheur, affichées partout où il y a une donnée. */
export function SourceStamp({
  source,
  asOf,
  stale,
  className,
}: {
  source: string;
  asOf?: string | null;
  stale?: boolean;
  className?: string;
}) {
  return (
    <span className={cls("text-[11px] text-ink3", className)}>
      {source}
      {asOf ? ` · ${timeAgo(asOf)}` : ""}
      {stale ? " · ⚠ non rafraîchi" : ""}
    </span>
  );
}

export const LIGHT_DOT: Record<LightColor, string> = {
  green: "bg-up",
  orange: "bg-warn",
  red: "bg-down",
  neutral: "bg-ink3",
};

export const LIGHT_TEXT: Record<LightColor, string> = {
  green: "text-up",
  orange: "text-warn",
  red: "text-down",
  neutral: "text-ink3",
};

/** Feu de couleur : jamais la couleur seule — toujours un libellé, et la raison en title. */
export function TrafficLight({
  color,
  label,
  reason,
  className,
}: {
  color: LightColor;
  label: string;
  reason?: string;
  className?: string;
}) {
  return (
    <span
      className={cls("inline-flex items-center gap-1.5 text-[12px] font-medium", LIGHT_TEXT[color], className)}
      title={reason}
    >
      <span className={cls("h-2 w-2 rounded-full", LIGHT_DOT[color])} aria-hidden />
      {label}
    </span>
  );
}

export function Spinner({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-ink3">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand3" aria-hidden />
      {label}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="my-4 rounded-lg border border-down/40 bg-down/10 px-4 py-3 text-sm text-ink">
      <strong className="text-down">Erreur : </strong>
      {message}
    </div>
  );
}

export function DegradedBanner({ mode }: { mode: string }) {
  if (mode === "live") return null;
  const demo = mode === "demo";
  return (
    <div className="mb-4 rounded-lg border border-warn/40 bg-warn/10 px-4 py-2.5 text-[13px] text-ink">
      <strong className="text-warn">{demo ? "Mode démo" : "Mode dégradé"} : </strong>
      {demo
        ? "les cours affichés sont des données fictives (aucune source réelle configurée ou joignable). Parfait pour explorer l'app, inutilisable pour décider."
        : "certaines sources réelles sont indisponibles — une partie des données est ancienne ou simulée. Chaque tuile indique sa source."}
    </div>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={cls("text-[11px] leading-relaxed text-ink3", className)}>
      Invest Copilote est un outil d&apos;information et d&apos;apprentissage. Ceci n&apos;est pas un
      conseil en investissement. Les performances passées ne préjugent pas des performances
      futures ; les scénarios affichés sont illustratifs, pas des prédictions. Investir comporte
      un risque de perte en capital.
    </p>
  );
}
