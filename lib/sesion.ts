import type {
  Comida,
  LineaDesglose,
  Records,
  Sesion,
  SesionActiva,
  TipoRecord,
} from "@/types";
import {
  cronNuevo,
  iniciarCron,
  mejorVentana,
  nuevoId,
  pausarCron,
  transcurrido,
} from "./tiempo";

export function sesionNueva(ahora: number): SesionActiva {
  return { id: nuevoId(), inicio: ahora, cron: cronNuevo(), acciones: [] };
}

/** Suma una unidad; arranca (o reanuda) el cronometro si estaba detenido. */
export function sumarUnidad(
  s: SesionActiva | null,
  comida: Comida,
  ahora: number,
): SesionActiva {
  const base = s ?? sesionNueva(ahora);
  return {
    ...base,
    cron: iniciarCron(base.cron, ahora),
    acciones: [...base.acciones, { t: ahora, comidaId: comida.id, puntos: comida.puntos }],
  };
}

export function deshacerUnidad(s: SesionActiva): SesionActiva {
  return { ...s, acciones: s.acciones.slice(0, -1) };
}

export function conteos(acciones: { comidaId: string }[]): { [comidaId: string]: number } {
  const resultado: { [comidaId: string]: number } = {};
  for (const a of acciones) resultado[a.comidaId] = (resultado[a.comidaId] ?? 0) + 1;
  return resultado;
}

export function sumaPuntos(acciones: { puntos: number }[]): number {
  return acciones.reduce((suma, a) => suma + a.puntos, 0);
}

export function desgloseDe(
  acciones: { comidaId: string; puntos: number }[],
  comidas: Comida[],
): LineaDesglose[] {
  const mapa = new Map<string, LineaDesglose>();
  for (const a of acciones) {
    const linea = mapa.get(a.comidaId);
    if (linea) {
      linea.cantidad += 1;
      linea.puntos += a.puntos;
    } else {
      const comida = comidas.find((c) => c.id === a.comidaId);
      mapa.set(a.comidaId, {
        comidaId: a.comidaId,
        nombre: comida?.nombre ?? "Comida eliminada",
        color: comida?.paleta.primario ?? "#5E6B7A",
        cantidad: 1,
        puntos: a.puntos,
      });
    }
  }
  return [...mapa.values()].sort((a, b) => b.cantidad - a.cantidad);
}

export function resumirSesion(
  s: SesionActiva,
  ahora: number,
  comidas: Comida[],
  meta: number,
): Sesion {
  const duracionMs = transcurrido(s.cron, ahora);
  const total = s.acciones.length;
  const tiempos = s.acciones.map((a) => a.t).sort((a, b) => a - b);
  const ventana = Math.min(60_000, Math.max(duracionMs, 10_000));
  return {
    id: s.id,
    inicio: s.inicio,
    fin: ahora,
    duracionMs,
    total,
    puntos: sumaPuntos(s.acciones),
    desglose: desgloseDe(s.acciones, comidas),
    ritmoPromedio: duracionMs > 0 ? total / (duracionMs / 60_000) : 0,
    ritmoPico: (mejorVentana(tiempos, ventana) * 60_000) / ventana,
    meta,
    superoMeta: total > meta,
    records: [],
  };
}

export function pausarSesion(s: SesionActiva, ahora: number): SesionActiva {
  return { ...s, cron: pausarCron(s.cron, ahora) };
}

/**
 * Compara una sesion con los records. El primer valor de cada tipo se guarda
 * sin contar como "record roto": solo se celebra superar uno existente.
 */
export function evaluarRecords(
  sesion: Sesion,
  previos: Records,
): { records: Records; rotos: TipoRecord[] } {
  const rotos: TipoRecord[] = [];
  const records: Records = { ...previos };
  const candidatos: [TipoRecord, number, boolean][] = [
    ["unidades", sesion.total, sesion.total > 0],
    ["ritmo", sesion.ritmoPromedio, sesion.total >= 5 && sesion.duracionMs >= 30_000],
    ["duracion", sesion.duracionMs, sesion.duracionMs >= 60_000],
  ];
  for (const [tipo, valor, valido] of candidatos) {
    if (!valido) continue;
    const previo = previos[tipo];
    if (!previo || valor > previo.valor) {
      records[tipo] = { valor, fecha: sesion.fin };
      if (previo) rotos.push(tipo);
    }
  }
  return { records, rotos };
}
