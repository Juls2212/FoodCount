"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

const DIGITOS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const ALTO = "1.15em";

function Digito({ d }: { d: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.4 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      aria-hidden="true"
      className="relative inline-block overflow-hidden text-center"
      style={{ height: ALTO, width: "0.64em" }}
    >
      <motion.span
        initial={false}
        animate={{ y: `${-d * 10}%` }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="absolute left-0 top-0 flex w-full flex-col"
      >
        {DIGITOS.map((n) => (
          <span key={n} style={{ height: ALTO, lineHeight: ALTO }}>
            {n}
          </span>
        ))}
      </motion.span>
    </motion.span>
  );
}

/** Odometro: cada digito es una columna 0-9 que rueda verticalmente. */
export const AnimatedCounter = memo(function AnimatedCounter({
  valor,
  className,
}: {
  valor: number;
  className?: string;
}) {
  const digitos = String(Math.max(0, Math.floor(valor))).split("");
  return (
    <span
      role="img"
      aria-label={String(valor)}
      className={`inline-flex items-center justify-center ${className ?? ""}`}
    >
      <AnimatePresence initial={false}>
        {digitos.map((d, i) => (
          <Digito key={digitos.length - i} d={Number(d)} />
        ))}
      </AnimatePresence>
    </span>
  );
});
