"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useDatos } from "./AppProvider";
import { Avatar } from "./Avatar";
import { Corona } from "./Corona";
import { DialogoConfirmar } from "./Dialogo";
import { EstadoVacio } from "./EstadoVacio";
import { IconoBasura, IconoFlecha, IconoLogros } from "./Iconos";
import { Dato } from "./sesion/ResumenSesion";
import { duracionLegible, formatoRitmo } from "@/lib/tiempo";
import type { Competencia, Sesion, TipoRecord } from "@/types";

type Pestana = "sesiones" | "competencias";

const fecha = (ms: number) =>
  new Date(ms).toLocaleString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const ETIQUETA_RECORD: { [t in TipoRecord]: string } = {
  unidades: "Más unidades",
  ritmo: "Mejor ritmo",
  duracion: "Sesión más larga",
};

function Records() {
  const { datos } = useDatos();
  const { records } = datos;
  const items = [
    { titulo: "Más unidades", valor: records.unidades ? `${records.unidades.valor}` : "--", fecha: records.unidades?.fecha },
    {
      titulo: "Mejor ritmo",
      valor: records.ritmo ? `${formatoRitmo(records.ritmo.valor)} / min` : "--",
      fecha: records.ritmo?.fecha,
    },
    {
      titulo: "Sesión más larga",
      valor: records.duracion ? duracionLegible(records.duracion.valor) : "--",
      fecha: records.duracion?.fecha,
    },
  ];
  return (
    <section aria-labelledby="titulo-records" className="flex flex-col gap-3">
      <h2 id="titulo-records" className="flex items-center gap-2 text-xl font-extrabold text-tinta-fondo">
        <IconoLogros className="h-6 w-6" />
        Récords personales
      </h2>
      <dl className="grid gap-3 sm:grid-cols-3">
        {items.map((r) => (
          <div key={r.titulo} className="caja px-4 py-3">
            <dt className="text-sm font-medium text-tinta-suave">{r.titulo}</dt>
            <dd className="font-display text-2xl font-extrabold">{r.valor}</dd>
            {r.fecha && <dd className="text-xs text-tinta-suave">{fecha(r.fecha)}</dd>}
          </div>
        ))}
      </dl>
    </section>
  );
}

function Plegable({
  resumen,
  detalle,
  onEliminar,
  etiquetaEliminar,
}: {
  resumen: React.ReactNode;
  detalle: React.ReactNode;
  onEliminar: () => void;
  etiquetaEliminar: string;
}) {
  const [abierto, setAbierto] = useState(false);
  return (
    <motion.li layout="position" className="caja flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">{resumen}</div>
        <button
          type="button"
          className="btn !min-h-12 !min-w-12 !px-3"
          onClick={() => setAbierto((a) => !a)}
          aria-expanded={abierto}
          aria-label={abierto ? "Ocultar detalle" : "Ver detalle"}
        >
          <IconoFlecha className="h-5 w-5" style={{ transform: abierto ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }} />
        </button>
        <button type="button" className="btn !min-h-12 !min-w-12 !px-3" onClick={onEliminar} aria-label={etiquetaEliminar}>
          <IconoBasura className="h-5 w-5" />
        </button>
      </div>
      {abierto && <div className="flex flex-col gap-3 border-t-[3px] border-borde pt-3">{detalle}</div>}
    </motion.li>
  );
}

function TarjetaSesion({ s, onEliminar }: { s: Sesion; onEliminar: () => void }) {
  return (
    <Plegable
      etiquetaEliminar={`Eliminar la sesión del ${fecha(s.inicio)}`}
      onEliminar={onEliminar}
      resumen={
        <>
          <p className="text-sm font-medium text-tinta-suave">{fecha(s.inicio)}</p>
          <p className="font-display text-2xl font-extrabold">
            {s.total} {s.total === 1 ? "unidad" : "unidades"}
          </p>
          <p className="text-sm font-medium">
            {s.puntos} puntos &middot; {duracionLegible(s.duracionMs)} &middot; {formatoRitmo(s.ritmoPromedio)} por minuto
          </p>
          {s.records.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-1.5" aria-label="Récords de la sesión">
              {s.records.map((r) => (
                <li key={r} className="rounded-lg border-[3px] border-borde bg-acento px-2 text-sm font-extrabold text-sobre-acento">
                  Récord: {ETIQUETA_RECORD[r]}
                </li>
              ))}
            </ul>
          )}
        </>
      }
      detalle={
        <>
          <dl className="grid grid-cols-2 gap-2">
            <Dato titulo="Ritmo pico" valor={`${formatoRitmo(s.ritmoPico)} / min`} />
            <Dato titulo="Meta" valor={s.superoMeta ? `Superada (${s.meta})` : `${s.meta}`} />
          </dl>
          <ul className="flex flex-col gap-2" aria-label="Desglose por comida">
            {s.desglose.map((l) => (
              <li key={l.comidaId} className="flex items-center gap-3 rounded-xl border-[3px] border-borde bg-superficie-2 px-3 py-2">
                <span aria-hidden="true" className="h-4 w-4 shrink-0 rounded-full border-2 border-borde" style={{ backgroundColor: l.color }} />
                <span className="flex-1 font-bold">{l.nombre}</span>
                <span>
                  {l.cantidad} ({l.puntos} pts)
                </span>
              </li>
            ))}
          </ul>
        </>
      }
    />
  );
}

function TarjetaCompetencia({ c, onEliminar }: { c: Competencia; onEliminar: () => void }) {
  const ganador = c.participantes.find((p) => p.id === c.ganadorId) ?? c.participantes[0];
  return (
    <Plegable
      etiquetaEliminar={`Eliminar la competencia del ${fecha(c.fecha)}`}
      onEliminar={onEliminar}
      resumen={
        <>
          <p className="text-sm font-medium text-tinta-suave">{fecha(c.fecha)}</p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar avatar={ganador.avatar} className="h-10 w-10" />
              <Corona className="absolute -right-2 -top-3 h-5 w-5 -rotate-12" />
            </div>
            <p className="min-w-0 truncate font-display text-xl font-extrabold">{ganador.nombre}</p>
          </div>
          <p className="text-sm font-medium">
            {c.participantes.length} participantes &middot; {duracionLegible(c.duracionMs)} &middot; {ganador.puntos} puntos
            {c.remontada ? " · remontada" : ""}
          </p>
        </>
      }
      detalle={
        <ol className="flex flex-col gap-2" aria-label="Posiciones finales">
          {c.participantes.map((p) => (
            <li key={p.id} className="flex flex-col gap-1 rounded-xl border-[3px] border-borde bg-superficie-2 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-5 font-display font-extrabold">{p.posicion}</span>
                <Avatar avatar={p.avatar} className="h-8 w-8" />
                <span className="min-w-0 flex-1 truncate font-bold">{p.nombre}</span>
                <span className="font-display font-extrabold">{p.puntos} pts</span>
              </div>
              <p className="text-sm text-tinta-suave">
                {p.unidades} unidades &middot; {formatoRitmo(p.ritmo)} por minuto
                {p.destacado ? ` · ${p.destacado}` : ""}
              </p>
              {p.desglose.length > 0 && (
                <p className="text-sm">{p.desglose.map((l) => `${l.nombre} ${l.cantidad}`).join(", ")}</p>
              )}
            </li>
          ))}
        </ol>
      }
    />
  );
}

export function Historial() {
  const { datos, cargado, actualizar } = useDatos();
  const [pestana, setPestana] = useState<Pestana>("sesiones");
  const [aEliminar, setAEliminar] = useState<{ tipo: Pestana; id: string } | null>(null);

  const eliminar = () => {
    if (!aEliminar) return;
    actualizar((d) =>
      aEliminar.tipo === "sesiones"
        ? { ...d, sesiones: d.sesiones.filter((s) => s.id !== aEliminar.id) }
        : { ...d, competencias: d.competencias.filter((c) => c.id !== aEliminar.id) },
    );
    setAEliminar(null);
  };

  const pestanas: { id: Pestana; nombre: string; n: number }[] = [
    { id: "sesiones", nombre: "Sesiones", n: datos.sesiones.length },
    { id: "competencias", nombre: "Competencias", n: datos.competencias.length },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-tinta-fondo">Historial</h1>
        <Link href="/logros" className="btn btn-acento">
          <IconoLogros className="h-5 w-5" />
          Ver logros
        </Link>
      </div>

      <Records />

      <div role="tablist" aria-label="Tipo de historial" className="flex gap-2">
        {pestanas.map((p) => {
          const activa = p.id === pestana;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`tab-${p.id}`}
              aria-selected={activa}
              aria-controls={`panel-${p.id}`}
              onClick={() => setPestana(p.id)}
              className={`relative flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border-[3px] border-borde px-2 font-display font-bold sm:flex-none sm:px-4 ${
                activa ? "text-sobre-primario" : "bg-superficie text-tinta"
              }`}
            >
              {activa && (
                <motion.span
                  layoutId="hist-tab"
                  aria-hidden="true"
                  className="absolute -inset-[3px] rounded-xl border-[3px] border-borde bg-primario"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative">
                {p.nombre} ({p.n})
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${pestana}`} aria-labelledby={`tab-${pestana}`}>
        {!cargado ? null : pestana === "sesiones" ? (
          datos.sesiones.length === 0 ? (
            <EstadoVacio
              titulo="Aún no hay sesiones"
              descripcion="Cuando termines una sesión en el contador, aparecerá aquí con su resumen."
            >
              <Link href="/" className="btn btn-primario">
                Ir al contador
              </Link>
            </EstadoVacio>
          ) : (
            <ul className="grid gap-4">
              {datos.sesiones.map((s) => (
                <TarjetaSesion key={s.id} s={s} onEliminar={() => setAEliminar({ tipo: "sesiones", id: s.id })} />
              ))}
            </ul>
          )
        ) : datos.competencias.length === 0 ? (
          <EstadoVacio
            titulo="Aún no hay competencias"
            descripcion="Guarda los resultados de una ronda y la verás aquí con su podio."
          >
            <Link href="/competencia" className="btn btn-primario">
              Ir a competencia
            </Link>
          </EstadoVacio>
        ) : (
          <ul className="grid gap-4">
            {datos.competencias.map((c) => (
              <TarjetaCompetencia key={c.id} c={c} onEliminar={() => setAEliminar({ tipo: "competencias", id: c.id })} />
            ))}
          </ul>
        )}
      </div>

      <DialogoConfirmar
        abierto={!!aEliminar}
        titulo="Eliminar del historial"
        mensaje="Se eliminará este registro de forma permanente. Los logros ya desbloqueados se conservan."
        etiqueta="Eliminar"
        onConfirmar={eliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </div>
  );
}
