import type {
  AccionComp,
  Avatar,
  Comida,
  Competencia,
  CompetenciaActiva,
  ConfigCompetencia,
  Participante,
  ResultadoParticipante,
} from "@/types";
import { mejorVentana, nuevoId, transcurrido } from "./tiempo";
import { desgloseDe } from "./sesion";

export const DURACIONES_MIN = [5, 10, 15, 20, 30] as const;
export const MIN_PARTICIPANTES = 2;
export const MAX_PARTICIPANTES = 8;

export const FORMAS = 6;
export const COLORES_AVATAR: [string, string][] = [
  ["#F2705F", "#B93A2C"],
  ["#F2A93B", "#B0710F"],
  ["#E9D13A", "#A08C0A"],
  ["#4FBF7A", "#237A47"],
  ["#3BB8C9", "#1B7581"],
  ["#4F7FE0", "#2447A3"],
  ["#8A6BD1", "#573E99"],
  ["#E86FA9", "#A93B74"],
];
export const PATRONES = 6;

export function avatarPorIndice(i: number): Avatar {
  return { forma: i % FORMAS, color: i % COLORES_AVATAR.length, patron: (i * 2 + 1) % PATRONES };
}

export function participanteNuevo(i: number): Participante {
  return { id: nuevoId(), nombre: "", avatar: avatarPorIndice(i) };
}

export function configInicial(): ConfigCompetencia {
  return {
    participantes: [participanteNuevo(0), participanteNuevo(1)],
    duracionMin: 10,
    comidaUnica: "pizza",
  };
}

export function competenciaNueva(
  config: ConfigCompetencia,
  comidaInicial: string,
  ahora: number,
): CompetenciaActiva {
  const participantes = config.participantes.map((p, i) => ({
    ...p,
    nombre: p.nombre.trim() || `Jugador ${i + 1}`,
  }));
  return {
    id: nuevoId(),
    config: { ...config, participantes },
    inicio: ahora,
    fase: "juego",
    // El cronometro arranca junto con la ronda, justo al terminar la cuenta regresiva.
    cron: { acumulado: 0, desde: ahora },
    acciones: [],
    comidaPor: Object.fromEntries(
      participantes.map((p) => [p.id, config.comidaUnica ?? comidaInicial]),
    ),
    guardada: false,
  };
}

export interface Puntaje {
  id: string;
  unidades: number;
  puntos: number;
}

/** Ranking por puntos; desempata por unidades y luego por orden de registro. */
export function calcularRanking(participantes: Participante[], acciones: AccionComp[]): Puntaje[] {
  const mapa = new Map<string, Puntaje>(
    participantes.map((p) => [p.id, { id: p.id, unidades: 0, puntos: 0 }]),
  );
  for (const a of acciones) {
    const p = mapa.get(a.pid);
    if (p) {
      p.unidades += 1;
      p.puntos += a.puntos;
    }
  }
  return participantes
    .map((p, i) => ({ puntaje: mapa.get(p.id)!, i }))
    .sort(
      (a, b) =>
        b.puntaje.puntos - a.puntaje.puntos ||
        b.puntaje.unidades - a.puntaje.unidades ||
        a.i - b.i,
    )
    .map((x) => x.puntaje);
}

export const duracionObjetivoMs = (c: CompetenciaActiva): number | null =>
  c.config.duracionMin === null ? null : c.config.duracionMin * 60_000;

function liderEn(
  participantes: Participante[],
  acciones: AccionComp[],
  limiteTe: number,
): string | null {
  const ranking = calcularRanking(
    participantes,
    acciones.filter((a) => a.te <= limiteTe),
  );
  if (ranking[0].puntos === 0) return null;
  if (ranking[1] && ranking[1].puntos === ranking[0].puntos) return null;
  return ranking[0].id;
}

interface Candidato {
  titulo: string;
  puntua: (id: string) => number | null;
}

function asignarDestacados(
  participantes: Participante[],
  acciones: AccionComp[],
): Map<string, string> {
  const porJugador = (id: string) => acciones.filter((a) => a.pid === id);

  const candidatos: Candidato[] = [
    {
      titulo: "El más rápido",
      puntua: (id) => {
        const t = porJugador(id).map((a) => a.te);
        return t.length >= 3 ? mejorVentana(t, 30_000) : null;
      },
    },
    {
      titulo: "El más constante",
      puntua: (id) => {
        const t = porJugador(id).map((a) => a.te);
        if (t.length < 6) return null;
        const pasos = t.slice(1).map((x, i) => x - t[i]);
        const media = pasos.reduce((s, x) => s + x, 0) / pasos.length;
        if (media === 0) return null;
        const varianza = pasos.reduce((s, x) => s + (x - media) ** 2, 0) / pasos.length;
        return 1 / (1 + Math.sqrt(varianza) / media);
      },
    },
    {
      titulo: "El más variado",
      puntua: (id) => {
        const distintas = new Set(porJugador(id).map((a) => a.comidaId)).size;
        return distintas >= 2 ? distintas : null;
      },
    },
    {
      titulo: "El más contundente",
      puntua: (id) => {
        const lista = porJugador(id);
        return lista.length >= 3 ? lista.reduce((s, a) => s + a.puntos, 0) / lista.length : null;
      },
    },
  ];

  const asignados = new Map<string, string>();
  for (const { titulo, puntua } of candidatos) {
    let mejor: { id: string; valor: number } | null = null;
    for (const p of participantes) {
      if (asignados.has(p.id)) continue;
      const valor = puntua(p.id);
      if (valor !== null && (!mejor || valor > mejor.valor)) mejor = { id: p.id, valor };
    }
    if (mejor) asignados.set(mejor.id, titulo);
  }
  return asignados;
}

export function resumirCompetencia(
  ca: CompetenciaActiva,
  comidas: Comida[],
  ahora: number,
): Competencia {
  const { participantes } = ca.config;
  const duracionMs = Math.max(transcurrido(ca.cron, ahora), 1);
  const objetivo = duracionObjetivoMs(ca);
  const ranking = calcularRanking(participantes, ca.acciones);
  const destacados = asignarDestacados(participantes, ca.acciones);

  const resultados: ResultadoParticipante[] = ranking.map((puntaje, i) => {
    const p = participantes.find((x) => x.id === puntaje.id)!;
    return {
      id: p.id,
      nombre: p.nombre,
      avatar: p.avatar,
      posicion: i + 1,
      unidades: puntaje.unidades,
      puntos: puntaje.puntos,
      ritmo: puntaje.unidades / (duracionMs / 60_000),
      desglose: desgloseDe(
        ca.acciones.filter((a) => a.pid === p.id),
        comidas,
      ),
      destacado: destacados.get(p.id) ?? null,
    };
  });

  const ganadorId = resultados[0].id;
  let remontada = false;
  if (objetivo !== null && objetivo >= 120_000 && resultados[0].puntos > 0) {
    const lider = liderEn(participantes, ca.acciones, objetivo - 60_000);
    remontada = lider !== null && lider !== ganadorId;
  }

  return {
    id: ca.id,
    fecha: ahora,
    duracionMs,
    duracionObjetivoMin: ca.config.duracionMin,
    participantes: resultados,
    ganadorId,
    remontada,
  };
}
