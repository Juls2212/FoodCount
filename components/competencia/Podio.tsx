"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Avatar } from "../Avatar";
import { Corona } from "../Corona";
import { Particulas, type ApiParticulas } from "../Particulas";
import { COLORES_AVATAR } from "@/lib/competencia";
import type { ResultadoParticipante } from "@/types";

const ALTURAS: { [pos: number]: number } = { 1: 150, 2: 110, 3: 80 };
// Las columnas crecen en orden: tercero, segundo y primero.
const RETRASO: { [pos: number]: number } = { 3: 0.2, 2: 0.8, 1: 1.4 };

export default function Podio({ top }: { top: ResultadoParticipante[] }) {
  const reducido = useReducedMotion();
  const particulas = useRef<ApiParticulas>(null);

  useEffect(() => {
    const colores = top.flatMap((p) => COLORES_AVATAR[p.avatar.color % COLORES_AVATAR.length]);
    const t1 = setTimeout(() => particulas.current?.emitir({ cantidad: 24, colores, fuerza: 1.6, confeti: true }), 2000);
    const t2 = setTimeout(() => particulas.current?.emitir({ cantidad: 24, colores, fuerza: 1.3, confeti: true }), 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [top]);

  // Orden visual: segundo, primero, tercero.
  const orden = [2, 1, 3]
    .map((pos) => top.find((p) => p.posicion === pos))
    .filter((p): p is ResultadoParticipante => !!p);

  return (
    <div className="relative">
      <Particulas ref={particulas} />
      <ol aria-label="Podio" className="flex items-end justify-center gap-2 pt-10 sm:gap-4">
        {orden.map((p) => (
          <li key={p.id} className="flex w-1/3 max-w-40 flex-col items-center gap-1">
            <motion.div
              initial={{ opacity: 0, y: reducido ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: RETRASO[p.posicion] + 0.35, type: "spring", stiffness: 300, damping: 20 }}
              className="flex w-full flex-col items-center text-center"
            >
              <div className="relative">
                <Avatar avatar={p.avatar} className="h-14 w-14 sm:h-16 sm:w-16" />
                {p.posicion === 1 && <Corona className="absolute -right-3 -top-5 h-8 w-8 -rotate-12" />}
              </div>
              <p className="w-full truncate font-display text-lg font-extrabold">{p.nombre}</p>
              <p className="text-sm font-bold">{p.puntos} puntos</p>
            </motion.div>
            <motion.div
              initial={{ scaleY: reducido ? 1 : 0, opacity: reducido ? 0 : 1 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: RETRASO[p.posicion], type: "spring", stiffness: 220, damping: 18 }}
              className="grid w-full place-items-center rounded-t-2xl border-[3px] border-borde font-display text-4xl font-extrabold shadow-duro"
              style={{
                height: ALTURAS[p.posicion],
                transformOrigin: "50% 100%",
                backgroundColor: p.posicion === 1 ? "var(--acento)" : "var(--superficie-2)",
                color: p.posicion === 1 ? "var(--sobre-acento)" : "var(--tinta)",
              }}
            >
              {p.posicion}
            </motion.div>
          </li>
        ))}
      </ol>
    </div>
  );
}
