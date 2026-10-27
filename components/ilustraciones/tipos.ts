import type { ComponentType } from "react";
import type { useAnimate } from "framer-motion";
import type { Comida } from "@/types";

export type Animar = ReturnType<typeof useAnimate>[1];

export interface PropsDibujo {
  comida?: Comida;
}

export interface Dibujo {
  /** Dibujo en viewBox 200x200. */
  Dibujo: ComponentType<PropsDibujo>;
  /** Animacion de comer; `n` es el numero de pulsaciones acumuladas. */
  comer: (animar: Animar, n: number) => void;
}
