export function cls(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const nf = (digits: number, min = 0) =>
  new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: min,
  });

export function fmtNum(v: number, digits = 2): string {
  return nf(digits).format(v);
}

/** Prix avec devise/unité, précision adaptée à l'ordre de grandeur. */
export function fmtPrice(
  price: number | null,
  currency: string,
  unit?: string,
): string {
  if (price === null || price === undefined) return "—";
  const digits = Math.abs(price) < 2 ? 4 : Math.abs(price) < 100 ? 2 : Math.abs(price) < 10000 ? 2 : 0;
  const n = nf(digits).format(price);
  if (unit === "pts") return `${n} pts`;
  if (unit === "%") return `${n} %`;
  const symbols: Record<string, string> = { USD: "$", EUR: "€", JPY: "¥", HKD: "HK$" };
  const sym = symbols[currency] ?? currency;
  return currency === "USD" ? `${sym}${n}` : `${n} ${sym}`;
}

export function fmtEur(v: number | null, digits = 0): string {
  if (v === null || v === undefined) return "—";
  return `${nf(digits).format(v)} €`;
}

export function fmtPct(v: number | null, digits = 1): string {
  if (v === null || v === undefined) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${nf(digits, 0).format(v)} %`;
}

export function pctColor(v: number | null): string {
  if (v === null || v === undefined || Math.abs(v) < 0.005) return "text-ink3";
  return v > 0 ? "text-up" : "text-down";
}

export function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 90) return "à l'instant";
  if (seconds < 3600) return `il y a ${Math.round(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.round(seconds / 3600)} h`;
  return `il y a ${Math.round(seconds / 86400)} j`;
}

export const CLASS_LABELS: Record<string, string> = {
  action: "Actions",
  etf: "ETF",
  indice: "Indices",
  crypto: "Crypto",
  metal: "Métaux",
  energie: "Énergie",
  forex: "Devises",
  taux: "Taux",
  volatilite: "Volatilité",
  cash: "Cash",
};

export function classLabel(assetClass: string): string {
  return CLASS_LABELS[assetClass] ?? assetClass;
}
