"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useComidas, useDatos } from "../AppProvider";
import { DialogoConfirmar } from "../Dialogo";
import { IconoJugar, IconoPausa } from "../Iconos";
import { Ranking, type Adelanto } from "./Ranking";
import { TarjetaJugador } from "./TarjetaJugador";
import { calcularRanking, duracionObjetivoMs } from "@/lib/competencia";
import { enControlInteractivo, useAhora, useWakeLock } from "@/lib/hooks";
import { pop, vibrar } from "@/lib/sonido";
import { formatoTiempo, iniciarCron, pausarCron, transcurrido } from "@/lib/tiempo";
import type { AccionComp, CompetenciaActiva } from "@/types";

const ULTIMOS_MS = 10_000;

export function Juego({ ca }: { ca: CompetenciaActiva }) {
  const { comidas } = useComidas();
  const { datos, actualizar } = useDatos();
  const { sonido, vibracion } = datos.ajustes;
  const { participantes, comidaUnica } = ca.config;
  const objetivo = duracionObjetivoMs(ca);

  const corriendo = ca.cron.desde !== null;
  const ahora = useAhora(corriendo, 200);
  const ms = transcurrido(ca.cron, ahora);
  const restante = objetivo === null ? null : Math.max(0, objetivo - ms);
  const terminado = restante !== null && restante <= 0;
  const bloqueado = !corriendo || terminado;
  const ultimos = restante !== null && restante > 0 && restante <= ULTIMOS_MS && corriendo;

  useWakeLock(true);

  const [disparos, setDisparos] = useState<{ [pid: string]: number }>({});
  const [adelanto, setAdelanto] = useState<Adelanto | null>(null);
  const [confirmarFin, setConfirmarFin] = useState(false);

  // Los manejadores leen la ronda desde una ref para mantenerse estables y no
  // re-renderizar todas las tarjetas con cada punto.
  const actual = useRef(ca);
  useEffect(() => {
    actual.current = ca;
  });

  const ranking = useMemo(
    () => calcularRanking(participantes, ca.acciones),
    [participantes, ca.acciones],
  );
  const puntajes = useMemo(() => new Map(ranking.map((r, i) => [r.id, { ...r, pos: i + 1 }])), [ranking]);

  const finalizar = useCallback(
    (limite?: number) => {
      const ahoraMs = Date.now();
      actualizar((d) => {
        const c = d.competenciaActiva;
        if (!c || c.fase !== "juego") return d;
        const cron = pausarCron(c.cron, ahoraMs);
        return {
          ...d,
          competenciaActiva: {
            ...c,
            fase: "resultado",
            cron: limite !== undefined ? { acumulado: limite, desde: null } : cron,
          },
        };
      });
    },
    [actualizar],
  );

  // Al llegar a cero la ronda se cierra sola (tambien si se recarga despues de terminar).
  useEffect(() => {
    if (terminado && objetivo !== null) finalizar(objetivo);
  }, [terminado, objetivo, finalizar]);

  const sumar = useCallback(
    (pid: string) => {
      const t = Date.now();
      const c = actual.current;
      if (c.fase !== "juego" || c.cron.desde === null) return;
      const te = transcurrido(c.cron, t);
      const limite = duracionObjetivoMs(c);
      if (limite !== null && te >= limite) return;
      const comida = comidas.find((x) => x.id === c.comidaPor[pid]);
      if (!comida) return;
      const accion: AccionComp = { t, te, pid, comidaId: comida.id, puntos: comida.puntos };

      const antes = calcularRanking(c.config.participantes, c.acciones).map((r) => r.id);
      const despues = calcularRanking(c.config.participantes, [...c.acciones, accion]).map((r) => r.id);
      const i = despues.indexOf(pid);
      const j = antes.indexOf(pid);
      if (i < j) {
        const superado = antes[i];
        const nombre = (id: string) => c.config.participantes.find((p) => p.id === id)?.nombre ?? "";
        setAdelanto({ key: t, pid, texto: `${nombre(pid)} adelantó a ${nombre(superado)}` });
      }

      actualizar((d) => {
        const act = d.competenciaActiva;
        if (!act) return d;
        return { ...d, competenciaActiva: { ...act, acciones: [...act.acciones, accion] } };
      });
      setDisparos((m) => ({ ...m, [pid]: (m[pid] ?? 0) + 1 }));
      if (sonido) pop(Math.min(12, (c.acciones.filter((a) => a.pid === pid).length + 1) % 13));
      if (vibracion) vibrar(10);
    },
    [actualizar, comidas, sonido, vibracion],
  );

  const deshacer = useCallback(
    (pid: string) =>
      actualizar((d) => {
        const act = d.competenciaActiva;
        if (!act || act.fase !== "juego") return d;
        const indice = act.acciones.map((a) => a.pid).lastIndexOf(pid);
        if (indice < 0) return d;
        return {
          ...d,
          competenciaActiva: { ...act, acciones: act.acciones.filter((_, i) => i !== indice) },
        };
      }),
    [actualizar],
  );

  const cambiarComida = useCallback(
    (pid: string, comidaId: string) =>
      actualizar((d) => {
        const act = d.competenciaActiva;
        if (!act) return d;
        return { ...d, competenciaActiva: { ...act, comidaPor: { ...act.comidaPor, [pid]: comidaId } } };
      }),
    [actualizar],
  );

  const alternarPausa = () => {
    const t = Date.now();
    actualizar((d) => {
      const act = d.competenciaActiva;
      if (!act || act.fase !== "juego") return d;
      const cron = act.cron.desde === null ? iniciarCron(act.cron, t) : pausarCron(act.cron, t);
      return { ...d, competenciaActiva: { ...act, cron } };
    });
  };

  // Atajo: P pausa o reanuda la ronda.
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.code === "KeyP" && !e.repeat && !e.ctrlKey && !e.metaKey && !enControlInteractivo(e.target)) {
        alternarPausa();
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  });

  const comidaDe = (pid: string) =>
    comidas.find((c) => c.id === ca.comidaPor[pid]) ?? comidas[0];

  return (
    <div className="flex flex-col gap-5">
      {ultimos && (
        <>
          <div aria-hidden="true" className="parpadeo parpadeo-a" />
          <div aria-hidden="true" className="parpadeo parpadeo-b" />
        </>
      )}

      <div className="caja sticky top-2 z-30 flex items-center justify-between gap-3 p-3">
        <div>
          <p className="text-sm font-bold text-tinta-suave">
            {restante === null ? "Tiempo transcurrido" : "Tiempo restante"}
          </p>
          <p
            role="timer"
            aria-label={`${restante === null ? "Transcurrido" : "Restante"} ${formatoTiempo(restante ?? ms)}`}
            className={`font-display text-5xl font-extrabold leading-none tabular-nums ${ultimos ? "pulsa" : ""}`}
            style={{ color: ultimos ? "var(--peligro)" : undefined }}
          >
            {formatoTiempo(restante ?? ms)}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" className="btn !min-h-12" onClick={alternarPausa} disabled={terminado}>
            {corriendo ? <IconoPausa className="h-5 w-5" /> : <IconoJugar className="h-5 w-5" />}
            {corriendo ? "Pausar" : "Reanudar"}
          </button>
          <button type="button" className="btn btn-acento !min-h-12" onClick={() => setConfirmarFin(true)}>
            Terminar
          </button>
        </div>
      </div>

      {!corriendo && !terminado && (
        <p role="status" className="caja p-3 text-center font-bold">
          Ronda en pausa. Los botones se desbloquean al reanudar.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <Ranking ranking={ranking} participantes={participantes} adelanto={adelanto} />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Participantes">
          {participantes.map((p) => {
            const pj = puntajes.get(p.id)!;
            return (
              <TarjetaJugador
                key={p.id}
                jugador={p}
                comida={comidaDe(p.id)}
                comidas={comidaUnica === null ? comidas : null}
                unidades={pj.unidades}
                puntos={pj.puntos}
                posicion={pj.pos}
                lider={pj.pos === 1 && pj.puntos > 0}
                bloqueado={bloqueado}
                disparo={disparos[p.id] ?? 0}
                onSumar={sumar}
                onDeshacer={deshacer}
                onComida={cambiarComida}
              />
            );
          })}
        </ul>
      </div>

      <DialogoConfirmar
        abierto={confirmarFin}
        titulo="Terminar la ronda"
        mensaje="La ronda se cierra ahora y verás los resultados con los puntos actuales."
        etiqueta="Terminar ronda"
        onConfirmar={() => {
          setConfirmarFin(false);
          finalizar();
        }}
        onCancelar={() => setConfirmarFin(false)}
      />
    </div>
  );
}
