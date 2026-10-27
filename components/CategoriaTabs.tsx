"use client";

import { motion } from "framer-motion";
import { categorias } from "@/lib/comidas";

export const TODAS = "todas";

interface Props {
  activa: string;
  onCambiar: (id: string) => void;
}

export function CategoriaTabs({ activa, onCambiar }: Props) {
  const tabs = [{ id: TODAS, nombre: "Todas", color: "" }, ...categorias];

  return (
    <div
      role="tablist"
      aria-label="Categorías de comida"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2"
    >
      {tabs.map((tab) => {
        const seleccionada = tab.id === activa;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={seleccionada}
            onClick={() => onCambiar(tab.id)}
            className={`relative flex min-h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl border-[3px] px-4 font-display font-bold ${
              seleccionada
                ? "border-borde text-sobre-primario"
                : "border-borde bg-superficie text-tinta"
            }`}
            style={{ touchAction: "manipulation" }}
          >
            {seleccionada && (
              <motion.span
                layoutId="tab-indicador"
                aria-hidden="true"
                className="absolute -inset-[3px] rounded-xl border-[3px] border-borde bg-primario"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            {tab.color && (
              <span
                aria-hidden="true"
                className="relative h-3 w-3 rounded-full border-2 border-borde"
                style={{ backgroundColor: tab.color }}
              />
            )}
            <span className="relative">{tab.nombre}</span>
          </button>
        );
      })}
    </div>
  );
}
