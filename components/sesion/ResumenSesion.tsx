"use client";

import { motion } from "framer-motion";
import { Dialogo } from "../Dialogo";
import { IconoLogros } from "../Iconos";
import type { Sesion, TipoRecord } from "@/types";
import { duracionLegible, formatoRitmo } from "@/lib/tiempo";

const ETIQUETA_RECORD: { [t in TipoRecord]: string } = {
  unidades: "Más unidades",
  ritmo: "Mejor ritmo",
  duracion: "Sesión más larga",
};

interface Props {
  resumen: { sesion: Sesion; rotos: TipoRecord[] } | null;
  onGuardar: () => void;
  onSeguir: () => void;
}

export function ResumenSesion({ resumen, onGuardar, onSeguir }: Props) {
  const s = resumen?.sesion;
  return (
    <Dialogo
      abierto={!!resumen}
      titulo="Resumen de la sesión"
      onCerrar={onSeguir}
      acciones={
        <>
          <button type="button" className="btn" onClick={onSeguir}>
            Seguir comiendo
          </button>
          <button type="button" className="btn btn-primario" onClick={onGuardar} autoFocus>
            Guardar en el historial
          </button>
        </>
      }
    >
      {s && resumen && (
        <>
          {resumen.rotos.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Récords rotos">
              {resumen.rotos.map((tipo, i) => (
                <motion.li
                  key={tipo}
                  initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: -2 }}
                  transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.15 + i * 0.12 }}
                  className="flex items-center gap-2 rounded-xl border-[3px] border-borde bg-acento px-3 py-1.5 font-display font-extrabold text-sobre-acento shadow-duro-sm"
                >
                  <IconoLogros className="h-5 w-5" />
                  Nuevo récord: {ETIQUETA_RECORD[tipo]}
                </motion.li>
              ))}
            </ul>
          )}

          <dl className="grid grid-cols-2 gap-3">
            <Dato titulo="Total" valor={`${s.total} unidades`} />
            <Dato titulo="Puntos" valor={String(s.puntos)} />
            <Dato titulo="Tiempo" valor={duracionLegible(s.duracionMs)} />
            <Dato titulo="Ritmo promedio" valor={`${formatoRitmo(s.ritmoPromedio)} / min`} />
            <Dato titulo="Ritmo pico" valor={`${formatoRitmo(s.ritmoPico)} / min`} />
            <Dato titulo="Meta" valor={s.superoMeta ? `Superada (${s.meta})` : `${s.meta}`} />
          </dl>

          <div>
            <h3 className="mb-2 text-lg font-extrabold">Por comida</h3>
            <ul className="flex flex-col gap-2">
              {s.desglose.map((l) => (
                <li key={l.comidaId} className="flex items-center gap-3 rounded-xl border-[3px] border-borde bg-superficie-2 px-3 py-2">
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 rounded-full border-2 border-borde"
                    style={{ backgroundColor: l.color }}
                  />
                  <span className="flex-1 font-bold">{l.nombre}</span>
                  <span>
                    {l.cantidad} ({l.puntos} pts)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </Dialogo>
  );
}

export function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl border-[3px] border-borde bg-superficie-2 px-3 py-2">
      <dt className="text-sm font-medium text-tinta-suave">{titulo}</dt>
      <dd className="font-display text-xl font-extrabold">{valor}</dd>
    </div>
  );
}
