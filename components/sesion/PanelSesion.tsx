"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useComidas, useDatos } from "../AppProvider";
import { AnimatedCounter } from "../AnimatedCounter";
import { Celebracion, esHito, textoHito, type Hito } from "../Celebracion";
import { DialogoConfirmar } from "../Dialogo";
import { Estomago } from "../Estomago";
import { IconoDeshacer, IconoJugar, IconoMas, IconoPausa } from "../Iconos";
import { Particulas, type ApiParticulas } from "../Particulas";
import { FoodIllustration } from "../ilustraciones/FoodIllustration";
import { ResumenSesion } from "./ResumenSesion";
import { nombreUnidad } from "@/lib/comidas";
import { enControlInteractivo, useAhora } from "@/lib/hooks";
import {
  conteos,
  deshacerUnidad,
  evaluarRecords,
  pausarSesion,
  resumirSesion,
  sesionNueva,
  sumaPuntos,
  sumarUnidad,
} from "@/lib/sesion";
import { fanfarria, pop, vibrar } from "@/lib/sonido";
import { formatoRitmo, formatoTiempo, iniciarCron, pausarCron, ritmo, transcurrido } from "@/lib/tiempo";
import { hexAHsl, hslAHex } from "@/lib/theme";
import type { Cron, Sesion, TipoRecord } from "@/types";

const VENTANA_COMBO_MS = 900;

function coloresDe(primario: string, secundario: string): string[] {
  const [h, s, l] = hexAHsl(primario);
  return [primario, secundario, hslAHex(h, s, l - 0.16), hslAHex(h + 25, s, Math.min(0.8, l + 0.12))];
}

/** Cronometro y ritmo: es el unico que se re-renderiza cada 250 ms. */
function TiempoSesion({
  cron,
  total,
  onAlternar,
}: {
  cron: Cron;
  total: number;
  onAlternar: () => void;
}) {
  const corriendo = cron.desde !== null;
  const ahora = useAhora(corriendo);
  const ms = transcurrido(cron, ahora);
  const iniciada = cron.acumulado > 0 || corriendo;
  return (
    <>
      <div className="col-span-2 flex items-center justify-between gap-3 rounded-xl border-[3px] border-borde bg-superficie-2 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-tinta-suave">Cronómetro</p>
          <p
            className="font-display text-4xl font-extrabold tabular-nums leading-none"
            role="timer"
            aria-label={`Tiempo de la sesión ${formatoTiempo(ms)}`}
          >
            {formatoTiempo(ms)}
          </p>
        </div>
        <button type="button" className="btn" onClick={onAlternar}>
          {corriendo ? <IconoPausa className="h-5 w-5" /> : <IconoJugar className="h-5 w-5" />}
          {corriendo ? "Pausar" : iniciada ? "Reanudar" : "Iniciar"}
        </button>
      </div>
      <div className="col-span-2 rounded-xl border-[3px] border-borde bg-superficie-2 px-4 py-3">
        <p className="text-sm font-medium text-tinta-suave">Ritmo</p>
        <p className="font-display text-2xl font-extrabold">
          {formatoRitmo(ritmo(total, ms))} <span className="text-base font-bold">unidades por minuto</span>
        </p>
      </div>
    </>
  );
}

export function PanelSesion() {
  const { comida, comidas } = useComidas();
  const { datos, actualizar, actualizarYEvaluar } = useDatos();
  const reducido = useReducedMotion();
  const sesion = datos.sesionActiva;
  const { sonido, vibracion, meta } = datos.ajustes;

  const porComida = useMemo(() => conteos(sesion?.acciones ?? []), [sesion?.acciones]);
  const total = sesion?.acciones.length ?? 0;
  const puntos = useMemo(() => sumaPuntos(sesion?.acciones ?? []), [sesion?.acciones]);
  const cantidad = porComida[comida.id] ?? 0;

  const [disparo, setDisparo] = useState(0);
  const [hito, setHito] = useState<Hito | null>(null);
  const [resumen, setResumen] = useState<{ sesion: Sesion; rotos: TipoRecord[] } | null>(null);
  const [confirmarDescartar, setConfirmarDescartar] = useState(false);
  const particulas = useRef<ApiParticulas>(null);
  const combo = useRef({ ultimo: 0, n: 0 });
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const sumar = useCallback(() => {
    const ahora = Date.now();
    const nuevoTotal = (datos.sesionActiva?.acciones.length ?? 0) + 1;
    actualizar((d) => ({ ...d, sesionActiva: sumarUnidad(d.sesionActiva, comida, ahora) }));
    setDisparo((n) => n + 1);

    const t = performance.now();
    combo.current.n = t - combo.current.ultimo < VENTANA_COMBO_MS ? combo.current.n + 1 : 0;
    combo.current.ultimo = t;

    const colores = coloresDe(comida.paleta.primario, comida.paleta.secundario);
    if (esHito(nuevoTotal)) {
      particulas.current?.emitir({ cantidad: 24, colores, fuerza: 1.5, confeti: true });
      setHito({ id: t, texto: textoHito(nuevoTotal) });
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => setHito(null), 2000);
      if (sonido) fanfarria();
      if (vibracion) vibrar([30, 40, 30, 40, 80]);
    } else {
      particulas.current?.emitir({ cantidad: 9, colores });
      if (sonido) pop(combo.current.n);
      if (vibracion) vibrar(12);
    }
  }, [actualizar, comida, datos.sesionActiva, sonido, vibracion]);

  const deshacer = useCallback(() => {
    if (!datos.sesionActiva || datos.sesionActiva.acciones.length === 0) return;
    actualizar((d) => {
      if (!d.sesionActiva) return d;
      const s = deshacerUnidad(d.sesionActiva);
      return { ...d, sesionActiva: s };
    });
    if (vibracion) vibrar(8);
  }, [actualizar, datos.sesionActiva, vibracion]);

  const alternarCron = useCallback(() => {
    const ahora = Date.now();
    actualizar((d) => {
      const base = d.sesionActiva ?? sesionNueva(ahora);
      const cron = base.cron.desde === null ? iniciarCron(base.cron, ahora) : pausarCron(base.cron, ahora);
      return { ...d, sesionActiva: { ...base, cron } };
    });
  }, [actualizar]);

  // Atajos: Espacio suma, Retroceso deshace (si el foco no esta en un control).
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || enControlInteractivo(e.target)) return;
      if (resumen || confirmarDescartar) return;
      if (e.code === "Space") {
        e.preventDefault();
        sumar();
      } else if (e.code === "Backspace") {
        e.preventDefault();
        deshacer();
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [sumar, deshacer, resumen, confirmarDescartar]);

  const terminar = () => {
    if (!datos.sesionActiva) return;
    const ahora = Date.now();
    const pausada = pausarSesion(datos.sesionActiva, ahora);
    actualizar((d) => ({ ...d, sesionActiva: pausada }));
    const base = resumirSesion(pausada, ahora, comidas, meta);
    setResumen({ sesion: base, rotos: evaluarRecords(base, datos.records).rotos });
  };

  const guardar = () => {
    if (!resumen) return;
    const { sesion: base } = resumen;
    actualizarYEvaluar((d) => {
      const { records, rotos } = evaluarRecords(base, d.records);
      return {
        ...d,
        sesionActiva: null,
        sesiones: [{ ...base, records: rotos }, ...d.sesiones],
        records,
      };
    });
    setResumen(null);
  };

  const descartar = () => {
    actualizar((d) => ({ ...d, sesionActiva: null }));
    setConfirmarDescartar(false);
  };

  const cambiarMeta = useCallback(
    (m: number) => actualizar((d) => ({ ...d, ajustes: { ...d.ajustes, meta: m } })),
    [actualizar],
  );

  const entrada = reducido
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { x: 70, opacity: 0, scale: 0.85 },
        animate: {
          x: 0,
          opacity: 1,
          scale: 1,
          transition: { type: "spring" as const, stiffness: 260, damping: 20 },
        },
        exit: { x: -70, opacity: 0, transition: { duration: 0.22 } },
      };

  const cron: Cron = sesion?.cron ?? { acumulado: 0, desde: null };

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="titulo-contador" className="caja flex flex-col gap-4 p-5">
        <div>
          <h1 id="titulo-contador" className="text-2xl font-extrabold leading-tight">
            {comida.nombre}
          </h1>
          <p className="text-sm font-medium text-tinta-suave">
            {comida.puntos} {comida.puntos === 1 ? "punto" : "puntos"} por {nombreUnidad(comida, 1)}
          </p>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[17rem]">
          <Particulas ref={particulas} />
          <Celebracion hito={hito} />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={comida.id} className="absolute inset-0" {...entrada}>
              <FoodIllustration id={comida.id} comida={comida} disparo={disparo} className="h-full w-full" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center" aria-live="polite" aria-atomic="true">
          <AnimatedCounter
            valor={cantidad}
            className="font-display text-[5.5rem] font-extrabold leading-none text-primario-texto"
          />
          <span className="text-lg font-bold">{nombreUnidad(comida, cantidad)}</span>
        </div>

        <button type="button" className="btn btn-primario h-24 text-2xl" onClick={sumar} aria-label="Sumar uno" aria-keyshortcuts="Space">
          <IconoMas className="h-9 w-9" />
          <span>1</span>
        </button>

        <button
          type="button"
          className="btn"
          onClick={deshacer}
          disabled={total === 0}
          aria-keyshortcuts="Backspace"
        >
          <IconoDeshacer className="h-5 w-5" />
          Deshacer
          {total > 0 && <span className="text-sm font-medium">({total})</span>}
        </button>
        <p className="hidden text-center text-sm text-tinta-suave lg:block">
          Atajos: Espacio suma, Retroceso deshace.
        </p>
      </section>

      <section aria-labelledby="titulo-sesion" className="caja flex flex-col gap-4 p-5">
        <h2 id="titulo-sesion" className="text-xl font-extrabold">
          Sesión
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 rounded-xl border-[3px] border-borde bg-superficie-2 px-4 py-3" aria-live="polite" aria-atomic="true">
            <p className="text-sm font-medium text-tinta-suave">Total de la sesión</p>
            <p className="font-display text-3xl font-extrabold">
              {total} <span className="text-base font-bold">{total === 1 ? "unidad" : "unidades"}</span>
              <span className="mx-2 text-tinta-suave">/</span>
              {puntos} <span className="text-base font-bold">puntos</span>
            </p>
          </div>
          <TiempoSesion cron={cron} total={total} onAlternar={alternarCron} />
        </div>

        {total > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Desglose por comida">
            {Object.entries(porComida).map(([id, n]) => {
              const c = comidas.find((x) => x.id === id);
              return (
                <li
                  key={id}
                  className="flex items-center gap-2 rounded-full border-[3px] border-borde bg-superficie px-3 py-1 text-sm font-bold"
                >
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 rounded-full border-2 border-borde"
                    style={{ backgroundColor: c?.paleta.primario }}
                  />
                  {c?.nombre ?? "Comida eliminada"}: {n}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Estomago cantidad={total} meta={meta} onMeta={cambiarMeta} />

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" className="btn btn-acento" onClick={terminar} disabled={total === 0}>
          Terminar sesión
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => setConfirmarDescartar(true)}
          disabled={!sesion}
        >
          Descartar sesión
        </button>
      </div>

      <ResumenSesion resumen={resumen} onGuardar={guardar} onSeguir={() => setResumen(null)} />
      <DialogoConfirmar
        abierto={confirmarDescartar}
        titulo="Descartar la sesión"
        mensaje="Se perderán el conteo y el tiempo de esta sesión. Esta acción no se puede deshacer."
        etiqueta="Descartar"
        onConfirmar={descartar}
        onCancelar={() => setConfirmarDescartar(false)}
      />
    </div>
  );
}
