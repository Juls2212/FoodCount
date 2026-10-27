"use client";

import { useDatos } from "./AppProvider";
import { Interruptor } from "./Interruptor";
import { pop, vibrar } from "@/lib/sonido";

export function Preferencias() {
  const { datos, actualizar } = useDatos();
  const { sonido, vibracion } = datos.ajustes;

  const fijar = (parcial: { sonido?: boolean; vibracion?: boolean }) =>
    actualizar((d) => ({ ...d, ajustes: { ...d.ajustes, ...parcial } }));

  return (
    <section aria-labelledby="titulo-pref" className="caja flex flex-col gap-5 p-5">
      <h2 id="titulo-pref" className="text-xl font-extrabold">
        Sensaciones
      </h2>
      <Interruptor
        etiqueta="Sonido"
        descripcion="Pequeños pops que suben de tono con el ritmo."
        activo={sonido}
        onCambiar={(v) => {
          fijar({ sonido: v });
          if (v) pop(0);
        }}
      />
      <Interruptor
        etiqueta="Vibración"
        descripcion="Un toque háptico al sumar, si tu celular lo permite."
        activo={vibracion}
        onCambiar={(v) => {
          fijar({ vibracion: v });
          if (v) vibrar(20);
        }}
      />
    </section>
  );
}
