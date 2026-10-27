"use client";

import { memo, useEffect, useRef, useState, type RefObject } from "react";
import { useAnimate, useReducedMotion } from "framer-motion";
import type { Comida } from "@/types";
import { catalogo } from "@/lib/comidas";
import type { Dibujo } from "./tipos";
import { alitas, empanadas, nuggets } from "./fritos";
import { gyozas, ramen, sushi } from "./orientales";
import { pasta, pizza } from "./italiana";
import { hamburguesa, hotdog, tacos } from "./rapida";
import { donas, generico, helado } from "./postres";

const registro: { [id: string]: Dibujo } = {
  sushi,
  gyozas,
  ramen,
  alitas,
  empanadas,
  nuggets,
  pizza,
  pasta,
  hamburguesa,
  tacos,
  hotdog,
  donas,
  helado,
};

/** Activo solo si el elemento esta en pantalla y la pestana es visible. */
function useActivo(ref: RefObject<Element | null>): boolean {
  const [enPantalla, setEnPantalla] = useState(true);
  const [pestanaVisible, setPestanaVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observador = new IntersectionObserver(
      ([entrada]) => setEnPantalla(entrada.isIntersecting),
      { threshold: 0.01 },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [ref]);

  useEffect(() => {
    const alCambiar = () => setPestanaVisible(document.visibilityState === "visible");
    alCambiar();
    document.addEventListener("visibilitychange", alCambiar);
    return () => document.removeEventListener("visibilitychange", alCambiar);
  }, []);

  return enPantalla && pestanaVisible;
}

interface Props {
  id: string;
  /** Solo hace falta para comidas personalizadas (leen nombre y paleta). */
  comida?: Comida;
  /** Contador de pulsaciones: cada cambio dispara la animacion de comer. */
  disparo?: number;
  className?: string;
}

export const FoodIllustration = memo(function FoodIllustration({
  id,
  comida,
  disparo = 0,
  className,
}: Props) {
  const [scope, animar] = useAnimate();
  const reducido = useReducedMotion();
  const activo = useActivo(scope);
  const previo = useRef(disparo);
  const def = registro[id] ?? generico;
  const nombre = comida?.nombre ?? catalogo.comidas.find((c) => c.id === id)?.nombre ?? "Comida";

  useEffect(() => {
    if (disparo === previo.current) return;
    previo.current = disparo;
    const raiz = scope.current as HTMLElement | null;
    if (!raiz) return;
    if (reducido) {
      animar(raiz, { opacity: [1, 0.55, 1] }, { duration: 0.25 });
      return;
    }
    animar(raiz, { scaleX: 1.12, scaleY: 0.86 }, { duration: 0.07 }).then(() =>
      animar(raiz, { scaleX: 1, scaleY: 1 }, { type: "spring", stiffness: 420, damping: 9 }),
    );
    def.comer(animar, disparo);
  }, [disparo, reducido, animar, scope, def]);

  return (
    <div
      ref={scope}
      data-pausa={!activo}
      className={`origin-bottom ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 200 200"
        className="ilus h-full w-full overflow-visible"
        role="img"
        aria-label={`Dibujo de ${nombre}`}
        focusable="false"
      >
        <def.Dibujo comida={comida} />
      </svg>
    </div>
  );
});
