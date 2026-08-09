"use client";

/** Mini-courbe 7 jours — trait 2px, colorée par le sens de la période,
 *  toujours accompagnée du % en texte (jamais la couleur seule). */
export function Sparkline({
  points,
  className,
  width = 96,
  height = 30,
}: {
  points: number[];
  className?: string;
  width?: number;
  height?: number;
}) {
  if (!points || points.length < 2) {
    return <span className={className} style={{ width, height, display: "inline-block" }} />;
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const pad = 3;
  const step = (width - pad * 2) / (points.length - 1);
  const y = (v: number) => pad + (height - pad * 2) * (1 - (v - min) / span);
  const path = points
    .map((v, i) => `${i === 0 ? "M" : "L"}${(pad + i * step).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");
  const up = points[points.length - 1] >= points[0];
  const color = up ? "var(--up)" : "var(--down)";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width, height }}
      className={className}
      aria-hidden="true"
    >
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
