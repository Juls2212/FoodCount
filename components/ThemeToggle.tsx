"use client";

import { useTema } from "./AppProvider";
import { IconoLuna, IconoSol } from "./Iconos";

/** Interruptor claro/oscuro. La animacion vive en CSS y depende de data-theme. */
export function ThemeToggle() {
  const { modo, alternarModo } = useTema();
  const oscuro = modo === "oscuro";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={oscuro}
      aria-label="Modo oscuro"
      onClick={alternarModo}
      className="relative flex h-12 w-[4.5rem] shrink-0 cursor-pointer items-center rounded-full border-[3px] border-borde bg-superficie-2 p-0.5 shadow-duro-sm"
      style={{ touchAction: "manipulation" }}
    >
      <span className="tema-perilla relative grid h-9 w-9 place-items-center rounded-full border-[3px] border-borde bg-primario text-sobre-primario">
        <IconoSol className="tema-sol absolute h-5 w-5" />
        <IconoLuna className="tema-luna absolute h-5 w-5" />
      </span>
    </button>
  );
}
