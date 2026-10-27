"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface Hito {
  id: number;
  texto: string;
}

export function esHito(n: number): boolean {
  return n === 10 || n === 25 || n === 50 || n === 100 || (n > 100 && n % 100 === 0);
}

export function textoHito(n: number): string {
  if (n === 10) return "Diez, ya calentó";
  if (n === 25) return "Veinticinco, buen ritmo";
  if (n === 50) return "Cincuenta, imparable";
  if (n === 100) return "Cien, nivel leyenda";
  return `${n}, no se detiene`;
}

/** Anillo que se expande y mensaje corto; el confeti lo emite Particulas. */
export function Celebracion({ hito }: { hito: Hito | null }) {
  const reducido = useReducedMotion();
  return (
    <AnimatePresence>
      {hito && (
        <div key={hito.id} className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
          {!reducido && (
            <motion.div
              aria-hidden="true"
              className="absolute h-1/2 w-1/2 rounded-full border-[8px]"
              style={{ borderColor: "var(--primario-texto)" }}
              initial={{ scale: 0.3, opacity: 0.95 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          )}
          <motion.p
            role="status"
            className="absolute top-2 whitespace-nowrap rounded-2xl border-[3px] border-borde bg-primario px-4 py-2 font-display text-lg font-extrabold text-sobre-primario shadow-duro"
            initial={reducido ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.8 }}
            animate={reducido ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 20 }}
          >
            {hito.texto}
          </motion.p>
        </div>
      )}
    </AnimatePresence>
  );
}
