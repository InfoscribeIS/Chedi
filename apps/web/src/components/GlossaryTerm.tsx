"use client";

import { useState, type ReactNode } from "react";
import { TERME_PAR_ID } from "@/lib/glossaire";
import { IconX } from "./icons";

/** Tooltip pédagogique : tout terme du glossaire est cliquable partout. */
export function Terme({ id, children }: { id: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [quinze, setQuinze] = useState(false);
  const terme = TERME_PAR_ID[id];
  if (!terme) return <>{children}</>;

  return (
    <>
      <button type="button" className="term" onClick={() => setOpen(true)}>
        {children}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-6"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Définition : ${terme.terme}`}
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-line bg-panel p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold tracking-wide text-brand3 uppercase">
                  {terme.categorie}
                </span>
                <h3 className="text-lg font-bold text-ink">{terme.terme}</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="rounded-md p-1.5 text-ink3 hover:bg-panel2"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-[14px] leading-relaxed text-ink2">
              {quinze ? terme.quinze : terme.simple}
            </p>

            <button
              onClick={() => setQuinze((v) => !v)}
              className="mt-3 rounded-lg border border-brand3/40 bg-brand3/10 px-3 py-1.5 text-[12px] font-medium text-brand3"
            >
              {quinze ? "← Définition classique" : "🧒 Explique-moi comme si j'avais 15 ans"}
            </button>

            <div className="mt-4 rounded-lg bg-panel2 p-3">
              <p className="text-[12px] leading-relaxed text-ink2">
                <strong className="text-ink">Pourquoi c&apos;est important : </strong>
                {terme.important}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
