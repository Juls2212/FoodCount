"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAvisos } from "./AppProvider";
import { IconoCerrar } from "./Iconos";
import { Insignia } from "./Insignia";
import { LOGROS } from "@/lib/logros";

/** Aviso flotante de logro desbloqueado; atiende la cola de a uno. */
export function AvisoLogros() {
  const { avisos, cerrarAviso } = useAvisos();
  const id = avisos[0];
  const logro = LOGROS.find((l) => l.id === id);

  useEffect(() => {
    if (!id) return;
    const t = setTimeout(cerrarAviso, 4500);
    return () => clearTimeout(t);
  }, [id, cerrarAviso]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4"
    >
      <AnimatePresence mode="wait">
        {logro && (
          <motion.div
            key={logro.id}
            initial={{ y: -80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className="caja pointer-events-auto flex w-full max-w-sm items-center gap-3 p-3"
          >
            <Insignia id={logro.id} className="h-16 w-16" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-tinta-suave">Logro desbloqueado</p>
              <p className="font-display text-lg font-extrabold leading-tight">{logro.nombre}</p>
            </div>
            <button type="button" className="btn !min-h-11 !min-w-11 !px-3" onClick={cerrarAviso} aria-label="Cerrar aviso">
              <IconoCerrar className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
