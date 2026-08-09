"use client";

import { useMemo, useState } from "react";
import { IconSearch } from "@/components/icons";
import { Card } from "@/components/ui";
import { cls } from "@/lib/format";
import { GLOSSAIRE } from "@/lib/glossaire";

export default function ApprendrePage() {
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [quinzeIds, setQuinzeIds] = useState<Set<string>>(new Set());

  const termes = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return GLOSSAIRE;
    return GLOSSAIRE.filter(
      (t) =>
        t.terme.toLowerCase().includes(needle) ||
        t.categorie.toLowerCase().includes(needle) ||
        t.simple.toLowerCase().includes(needle),
    );
  }, [q]);

  const categories = useMemo(() => {
    const map = new Map<string, typeof GLOSSAIRE>();
    for (const t of termes) {
      map.set(t.categorie, [...(map.get(t.categorie) ?? []), t]);
    }
    return [...map.entries()];
  }, [termes]);

  function toggleQuinze(id: string) {
    setQuinzeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-ink">Apprendre</h1>
      <p className="mb-4 text-[13px] text-ink2">
        Le vocabulaire indispensable, en français simple. Chaque terme existe aussi en version
        « comme si j&apos;avais 15 ans ». Ces définitions apparaissent partout dans l&apos;app via
        les mots <span className="term">soulignés en pointillés</span>.
      </p>

      <label className="relative block">
        <IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Chercher un terme (ETF, volatilité, DCA…)"
          className="w-full rounded-lg border border-line bg-panel py-2.5 pr-3 pl-9 text-[14px] text-ink placeholder:text-ink3"
        />
      </label>

      {categories.map(([categorie, list]) => (
        <section key={categorie} className="mt-6">
          <h2 className="mb-2.5 text-sm font-semibold tracking-wide text-brand3 uppercase">{categorie}</h2>
          <div className="space-y-2.5">
            {list.map((t) => {
              const open = openId === t.id;
              const quinze = quinzeIds.has(t.id);
              return (
                <Card key={t.id} className="p-0">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : t.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    aria-expanded={open}
                  >
                    <span className="text-[15px] font-semibold text-ink">{t.terme}</span>
                    <span className="text-[11px] text-ink3">{open ? "replier ▲" : "lire ▼"}</span>
                  </button>
                  {open && (
                    <div className="border-t border-line px-4 py-3.5">
                      <p className="text-[14px] leading-relaxed text-ink2">
                        {quinze ? t.quinze : t.simple}
                      </p>
                      <button
                        onClick={() => toggleQuinze(t.id)}
                        className={cls(
                          "mt-2.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium",
                          quinze
                            ? "border-line bg-panel2 text-ink2"
                            : "border-brand3/40 bg-brand3/10 text-brand3",
                        )}
                      >
                        {quinze ? "← Définition classique" : "🧒 Explique-moi comme si j'avais 15 ans"}
                      </button>
                      <div className="mt-3 rounded-lg bg-panel2 p-3">
                        <p className="text-[12px] leading-relaxed text-ink2">
                          <strong className="text-ink">Pourquoi c&apos;est important : </strong>
                          {t.important}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      ))}
      {termes.length === 0 && (
        <p className="mt-6 text-sm text-ink3">Aucun terme ne correspond à « {q} ».</p>
      )}
    </div>
  );
}
