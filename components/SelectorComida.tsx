"use client";

import { memo, useCallback, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useComidas } from "./AppProvider";
import { CategoriaTabs, TODAS } from "./CategoriaTabs";
import { IconoMas } from "./Iconos";
import { FoodIllustration } from "./ilustraciones/FoodIllustration";
import { categoriaPorId, nombreUnidad } from "@/lib/comidas";
import type { Comida } from "@/types";

interface PropsTarjeta {
  comida: Comida;
  seleccionada: boolean;
  indice: number;
  onElegir: (id: string) => void;
}

const TarjetaComida = memo(function TarjetaComida({
  comida,
  seleccionada,
  indice,
  onElegir,
}: PropsTarjeta) {
  const cat = categoriaPorId(comida.categoria);
  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 26, delay: indice * 0.035 }}
    >
      <button
        type="button"
        aria-pressed={seleccionada}
        onClick={() => onElegir(comida.id)}
        className={`btn h-full w-full flex-col items-start gap-1.5 text-left ${
          seleccionada ? "btn-primario" : ""
        }`}
        style={{ borderRadius: "1.25rem", padding: "0.75rem" }}
      >
        <span className="mx-auto block h-24 w-24">
          <FoodIllustration
            id={comida.id}
            comida={comida}
            className="h-full w-full"
          />
        </span>
        <span className="text-lg leading-tight">{comida.nombre}</span>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full border-2 border-current"
            style={{ backgroundColor: cat?.color }}
          />
          {cat?.nombre ?? "Otra"}
        </span>
        <span className="text-sm font-medium">
          {comida.puntos} {comida.puntos === 1 ? "punto" : "puntos"} por{" "}
          {nombreUnidad(comida, 1)}
        </span>
      </button>
    </motion.li>
  );
});

export function SelectorComida() {
  const { comidas, comida: activa, seleccionarComida } = useComidas();
  const [categoria, setCategoria] = useState(TODAS);
  const elegir = useCallback((id: string) => seleccionarComida(id), [seleccionarComida]);

  const visibles =
    categoria === TODAS ? comidas : comidas.filter((c) => c.categoria === categoria);

  return (
    <section aria-labelledby="titulo-selector" className="flex flex-col gap-4">
      <h2 id="titulo-selector" className="text-2xl font-extrabold text-tinta-fondo">
        Elige tu comida
      </h2>
      <CategoriaTabs activa={categoria} onCambiar={setCategoria} />

      <ul key={categoria} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visibles.map((comida, i) => (
          <TarjetaComida
            key={comida.id}
            comida={comida}
            seleccionada={comida.id === activa.id}
            indice={i}
            onElegir={elegir}
          />
        ))}
        <li>
          <Link
            href="/comidas/nueva"
            className="flex h-full min-h-40 flex-col items-center justify-center gap-2 rounded-[1.25rem] border-[3px] border-dashed border-tinta-fondo p-3 text-center font-display text-lg font-bold text-tinta-fondo"
          >
            <IconoMas className="h-8 w-8" />
            Nueva comida
          </Link>
        </li>
      </ul>
    </section>
  );
}
