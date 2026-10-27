"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useComidas, useDatos } from "../AppProvider";
import { Avatar } from "../Avatar";
import { Corona } from "../Corona";
import { duracionLegible, formatoRitmo } from "@/lib/tiempo";
import { resumirCompetencia } from "@/lib/competencia";
import type { CompetenciaActiva, ConfigCompetencia } from "@/types";

const Podio = dynamic(() => import("./Podio"), {
  ssr: false,
  loading: () => <div className="h-56" aria-hidden="true" />,
});

interface Props {
  ca: CompetenciaActiva;
  onRevancha: (config: ConfigCompetencia) => void;
  onNueva: () => void;
}

export function Resultados({ ca, onRevancha, onNueva }: Props) {
  const { comidas } = useComidas();
  const { actualizar, actualizarYEvaluar } = useDatos();
  const [momento] = useState(() => Date.now());
  const resumen = useMemo(() => resumirCompetencia(ca, comidas, momento), [ca, comidas, momento]);
  const ganador = resumen.participantes[0];

  const guardar = () =>
    actualizarYEvaluar((d) => {
      const act = d.competenciaActiva;
      if (!act || act.guardada) return d;
      return {
        ...d,
        competencias: [resumen, ...d.competencias.filter((c) => c.id !== resumen.id)],
        competenciaActiva: { ...act, guardada: true },
      };
    });

  const salir = (despues: () => void) => {
    actualizar((d) => ({ ...d, competenciaActiva: null }));
    despues();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-tinta-fondo">Resultados</h1>
        <p className="text-lg font-medium text-tinta-fondo" aria-live="polite">
          {ganador.puntos > 0
            ? `Ganó ${ganador.nombre} con ${ganador.puntos} puntos.`
            : "Nadie sumó puntos en esta ronda."}
          {resumen.remontada ? " Remontada en el último minuto." : ""}
        </p>
      </div>

      {ganador.puntos > 0 && <Podio top={resumen.participantes.slice(0, 3)} />}

      <section aria-labelledby="titulo-tabla" className="flex flex-col gap-3">
        <h2 id="titulo-tabla" className="text-xl font-extrabold text-tinta-fondo">
          Tabla completa ({duracionLegible(resumen.duracionMs)})
        </h2>
        <ol className="grid gap-3 md:grid-cols-2">
          {resumen.participantes.map((p) => (
            <li key={p.id} className="caja flex flex-col gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="w-7 text-center font-display text-2xl font-extrabold">{p.posicion}</span>
                <div className="relative">
                  <Avatar avatar={p.avatar} className="h-11 w-11" />
                  {p.posicion === 1 && p.puntos > 0 && <Corona className="absolute -right-2 -top-3 h-6 w-6 -rotate-12" />}
                </div>
                <p className="min-w-0 flex-1 truncate font-display text-xl font-extrabold">{p.nombre}</p>
                <p className="text-right font-display text-2xl font-extrabold leading-none text-primario-texto">
                  {p.puntos}
                  <span className="block text-xs font-bold text-tinta">puntos</span>
                </p>
              </div>
              {p.destacado && (
                <p className="self-start rounded-lg border-[3px] border-borde bg-acento px-2 py-0.5 text-sm font-extrabold text-sobre-acento">
                  {p.destacado}
                </p>
              )}
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border-[3px] border-borde bg-superficie-2 px-2 py-1">
                  <dt className="text-tinta-suave">Unidades</dt>
                  <dd className="font-display text-lg font-extrabold">{p.unidades}</dd>
                </div>
                <div className="rounded-lg border-[3px] border-borde bg-superficie-2 px-2 py-1">
                  <dt className="text-tinta-suave">Ritmo</dt>
                  <dd className="font-display text-lg font-extrabold">{formatoRitmo(p.ritmo)} / min</dd>
                </div>
              </dl>
              {p.desglose.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label={`Desglose de ${p.nombre}`}>
                  {p.desglose.map((l) => (
                    <li
                      key={l.comidaId}
                      className="flex items-center gap-1.5 rounded-full border-[3px] border-borde px-2.5 py-0.5 text-sm font-bold"
                    >
                      <span
                        aria-hidden="true"
                        className="h-3 w-3 rounded-full border-2 border-borde"
                        style={{ backgroundColor: l.color }}
                      />
                      {l.nombre}: {l.cantidad}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <button type="button" className="btn btn-primario" onClick={() => salir(() => onRevancha(ca.config))}>
          Revancha
        </button>
        <button type="button" className="btn btn-acento" onClick={guardar} disabled={ca.guardada}>
          {ca.guardada ? "Guardada en el historial" : "Guardar en el historial"}
        </button>
        <button type="button" className="btn" onClick={() => salir(onNueva)}>
          Nueva competencia
        </button>
      </div>
      {!ca.guardada && (
        <p className="text-center text-sm font-medium text-tinta-fondo">
          Esta ronda todavía no está guardada: si empiezas otra sin guardar, se perderá.
        </p>
      )}
    </div>
  );
}
