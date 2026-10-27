"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const PASOS = ["3", "2", "1", "Ya"];

/** Cuenta regresiva 3, 2, 1 a pantalla completa. */
export function Cuenta({ onTerminar }: { onTerminar: () => void }) {
  const [paso, setPaso] = useState(0);
  const reducido = useReducedMotion();
  const alTerminar = useRef(onTerminar);
  useEffect(() => {
    alTerminar.current = onTerminar;
  });

  useEffect(() => {
    const t = setTimeout(
      () => (paso < PASOS.length - 1 ? setPaso(paso + 1) : alTerminar.current()),
      paso === PASOS.length - 1 ? 600 : 1000,
    );
    return () => clearTimeout(t);
  }, [paso]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-0 z-40 grid place-items-center bg-fondo"
    >
      <AnimatePresence mode="popLayout">
        <motion.p
          key={paso}
          initial={reducido ? { opacity: 0 } : { scale: 0.3, opacity: 0, rotate: -10 }}
          animate={reducido ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: 0 }}
          exit={reducido ? { opacity: 0 } : { scale: 2.2, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          className="font-display text-[10rem] font-extrabold leading-none text-tinta-fondo"
        >
          {PASOS[paso]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
