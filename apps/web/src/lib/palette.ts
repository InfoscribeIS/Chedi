/**
 * Palette catégorielle des classes d'actifs — dérivée du logo, validée
 * (script dataviz : bande de luminosité, chroma, séparation daltonisme,
 * contraste ≥ 3:1) sur les surfaces claire (#ffffff) ET sombre (#060b18).
 * Une seule palette pour les deux thèmes : la couleur suit l'entité.
 * Le cash est un NEUTRE délibéré (non investi) : gris ardoise + hachures,
 * toujours accompagné d'une étiquette.
 */
export const CLASS_COLORS: Record<string, string> = {
  etf: "#059669",
  action: "#3b82f6",
  metal: "#d97706",
  crypto: "#0d9488",
  energie: "#ea580c",
  indice: "#8b5cf6",
  forex: "#8b5cf6",
  taux: "#8b5cf6",
};

export const CASH_COLOR = "#64748b";

export function classColor(assetClass: string): string {
  return CLASS_COLORS[assetClass] ?? "#8b5cf6";
}
