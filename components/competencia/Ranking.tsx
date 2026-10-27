"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "../Avatar";
import { Corona } from "../Corona";
import type { Puntaje } from "@/lib/competencia";
import type { Participante } from "@/types";

export interface Adelanto {
  key: number;
  pid: string;
  texto: string;
}

interface Props {
  ranking: Puntaje[];
  participantes: Participante[];
  adelanto: Adelanto | null;
}

/** Posiciones en vivo; las filas intercambian lugar con una animacion de layout. */
export const Ranking = memo(function Ranking({ ranking, participantes, adelanto }: Props) {
  const lider = ranking[0]?.puntos > 0 ? ranking[0] : null;
  const nombreLider = participantes.find((p) => p.id === lider?.id)?.nombre;

  return (
    <section aria-labelledby="titulo-ranking" className="caja flex flex-col gap-3 p-4">
      <h2 id="titulo-ranking" className="text-xl font-extrabold">
        Ranking en vivo
      </h2>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {lider ? `Líder: ${nombreLider} con ${lider.puntos} puntos.` : "Nadie ha sumado todavía."}
        {adelanto ? ` ${adelanto.texto}.` : ""}
      </p>

      <div className="min-h-9" aria-hidden="true">
        <AnimatePresence mode="wait">
          {adelanto && (
            <motion.p
              key={adelanto.key}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="inline-block rounded-lg border-[3px] border-borde bg-acento px-3 py-1 font-display font-extrabold text-sobre-acento"
            >
              {adelanto.texto}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <ol aria-label="Posiciones" className="flex flex-col gap-2">
        {ranking.map((puntaje, i) => {
          const p = participantes.find((x) => x.id === puntaje.id)!;
          const esLider = i === 0 && puntaje.puntos > 0;
          return (
            <motion.li
              key={p.id}
              layout
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="relative flex items-center gap-3 rounded-xl border-[3px] border-borde px-3 py-2"
              style={{ backgroundColor: esLider ? "var(--acento)" : "var(--superficie-2)", color: esLider ? "var(--sobre-acento)" : "var(--tinta)" }}
            >
              <span className="w-6 text-center font-display text-xl font-extrabold">{i + 1}</span>
              <div className="relative">
                <Avatar avatar={p.avatar} className="h-9 w-9" />
                {esLider && <Corona className="absolute -right-2 -top-3 h-5 w-5 -rotate-12" />}
              </div>
              <span className="min-w-0 flex-1 truncate font-bold">{p.nombre}</span>
              <span className="text-right">
                <span className="block font-display text-xl font-extrabold leading-none">{puntaje.puntos}</span>
                <span className="text-xs font-medium">{puntaje.unidades} u.</span>
              </span>
              {adelanto?.pid === p.id && (
                <motion.span
                  key={adelanto.key}
                  aria-hidden="true"
                  initial={{ opacity: 0.9, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.08 }}
                  transition={{ duration: 0.7 }}
                  className="pointer-events-none absolute -inset-[3px] rounded-xl border-[4px]"
                  style={{ borderColor: "var(--primario-texto)" }}
                />
              )}
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
});
