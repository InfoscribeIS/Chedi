"use client";

import {
  AreaSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { cls } from "@/lib/format";
import type { Candle } from "@/lib/types";

const RANGES = [
  { key: "1M", days: 31 },
  { key: "3M", days: 92 },
  { key: "1A", days: 366 },
] as const;

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function PriceChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("3M");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const applyTheme = () => {
      const line = cssVar("--brand3") || "#0d9488";
      const grid = cssVar("--line") || "#d9e2ee";
      const text = cssVar("--ink3") || "#5d7290";
      chartRef.current?.applyOptions({
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: text,
        },
        grid: {
          vertLines: { color: "transparent" },
          horzLines: { color: grid },
        },
        rightPriceScale: { borderColor: grid },
        timeScale: { borderColor: grid },
      });
      seriesRef.current?.applyOptions({
        lineColor: line,
        topColor: `${line}55`,
        bottomColor: `${line}00`,
      });
    };

    const chart = createChart(el, {
      autoSize: true,
      height: 280,
      localization: { locale: "fr-FR" },
      timeScale: { timeVisible: false },
      handleScroll: { pressedMouseMove: true, mouseWheel: false, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { mouseWheel: false, pinch: true, axisPressedMouseMove: true, axisDoubleClickReset: true },
    });
    const series = chart.addSeries(AreaSeries, { lineWidth: 2, priceLineVisible: false });
    chartRef.current = chart;
    seriesRef.current = series;
    applyTheme();

    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    const days = RANGES.find((r) => r.key === range)?.days ?? 92;
    const sliced = candles.slice(-days);
    series.setData(sliced.map((c) => ({ time: c.t, value: c.c })));
    chartRef.current?.timeScale().fitContent();
  }, [candles, range]);

  return (
    <div>
      <div className="mb-2 flex gap-1.5">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className={cls(
              "rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
              range === r.key ? "bg-panel2 text-ink" : "text-ink3 hover:text-ink",
            )}
          >
            {r.key}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="h-[280px] w-full" />
    </div>
  );
}
