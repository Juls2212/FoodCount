import type { Cron } from "@/types";

export const cronNuevo = (): Cron => ({ acumulado: 0, desde: null });

export function transcurrido(c: Cron, ahora: number): number {
  return c.acumulado + (c.desde !== null ? Math.max(0, ahora - c.desde) : 0);
}

export function iniciarCron(c: Cron, ahora: number): Cron {
  return c.desde !== null ? c : { acumulado: c.acumulado, desde: ahora };
}

export function pausarCron(c: Cron, ahora: number): Cron {
  return c.desde === null ? c : { acumulado: transcurrido(c, ahora), desde: null };
}

/** mm:ss, o h:mm:ss a partir de una hora. */
export function formatoTiempo(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const dos = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${dos(m)}:${dos(s)}` : `${dos(m)}:${dos(s)}`;
}

/** Duracion legible para tarjetas: "12 min 30 s". */
export function duracionLegible(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s} s`;
  return s === 0 ? `${m} min` : `${m} min ${s} s`;
}

/** Unidades por minuto, o null si todavia no hay base para calcularlo. */
export function ritmo(unidades: number, ms: number): number | null {
  if (ms < 10_000 || unidades === 0) return null;
  return unidades / (ms / 60_000);
}

export function formatoRitmo(valor: number | null): string {
  return valor === null ? "--" : valor.toLocaleString("es", { maximumFractionDigits: 1 });
}

/** Mayor cantidad de eventos dentro de una ventana deslizante. `tiempos` debe venir ordenado. */
export function mejorVentana(tiempos: number[], ventanaMs: number): number {
  let mejor = 0;
  let inicio = 0;
  for (let fin = 0; fin < tiempos.length; fin++) {
    while (tiempos[fin] - tiempos[inicio] >= ventanaMs) inicio++;
    mejor = Math.max(mejor, fin - inicio + 1);
  }
  return mejor;
}

export const nuevoId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
