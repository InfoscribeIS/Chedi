"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Vide par défaut : les appels partent vers la même origine que la page et
// Next les relaie au backend (voir next.config.ts). NEXT_PUBLIC_API_URL ne
// sert qu'en production, quand l'API vit sur un autre domaine.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    // Une nouvelle tentative absorbe les micro-coupures (redémarrage du serveur…)
    await sleep(1200);
    try {
      res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...init?.headers },
      });
    } catch {
      throw new ApiError(
        0,
        "Moteur de l'app injoignable. Vérifie que la fenêtre « Invest Copilote - API » est ouverte, ou relance « Lancer Invest Copilote.bat ».",
      );
    }
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      /* corps non-JSON */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function useApi<T>(
  path: string | null,
  opts?: { refreshMs?: number },
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const alive = useRef(true);

  const load = useCallback(async () => {
    if (!path) return;
    try {
      const result = await api<T>(path);
      if (alive.current) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (alive.current) setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    alive.current = true;
    if (path) {
      setLoading(true);
      load();
    }
    const ms = opts?.refreshMs;
    const timer = ms && path ? setInterval(load, ms) : undefined;
    return () => {
      alive.current = false;
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, load]);

  return { data, error, loading, reload: load };
}
