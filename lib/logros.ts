import type { DatosApp } from "@/types";

export interface DefLogro {
  id: string;
  nombre: string;
  descripcion: string;
  /** Color de la insignia cuando esta desbloqueada. */
  color: string;
  cumple: (d: DatosApp) => boolean;
}

const MIN = 60_000;

const maxSesion = (d: DatosApp, f: (s: DatosApp["sesiones"][number]) => number) =>
  d.sesiones.reduce((m, s) => Math.max(m, f(s)), 0);

function comidasProbadas(d: DatosApp): number {
  const ids = new Set<string>();
  for (const s of d.sesiones) for (const l of s.desglose) ids.add(l.comidaId);
  for (const c of d.competencias)
    for (const p of c.participantes) for (const l of p.desglose) ids.add(l.comidaId);
  return ids.size;
}

/** Mayor racha de victorias consecutivas del mismo nombre en competencias guardadas. */
function mejorRacha(d: DatosApp): number {
  const orden = [...d.competencias].sort((a, b) => a.fecha - b.fecha);
  let mejor = 0;
  let actual = 0;
  let nombre = "";
  for (const c of orden) {
    const ganador = c.participantes.find((p) => p.id === c.ganadorId)?.nombre.trim().toLowerCase();
    if (!ganador) {
      actual = 0;
      continue;
    }
    actual = ganador === nombre ? actual + 1 : 1;
    nombre = ganador;
    mejor = Math.max(mejor, actual);
  }
  return mejor;
}

export const LOGROS: DefLogro[] = [
  {
    id: "primer-bocado",
    nombre: "Primer bocado",
    descripcion: "Termina tu primera sesión.",
    color: "#F2A93B",
    cumple: (d) => d.sesiones.length >= 1,
  },
  {
    id: "calentamiento",
    nombre: "Calentamiento de 10",
    descripcion: "Come 10 unidades en una sesión.",
    color: "#F2705F",
    cumple: (d) => maxSesion(d, (s) => s.total) >= 10,
  },
  {
    id: "medio-centenar",
    nombre: "Medio centenar",
    descripcion: "Llega a 50 unidades en una sesión.",
    color: "#E9D13A",
    cumple: (d) => maxSesion(d, (s) => s.total) >= 50,
  },
  {
    id: "centenar",
    nombre: "Centenar",
    descripcion: "Llega a 100 unidades en una sesión.",
    color: "#E86FA9",
    cumple: (d) => maxSesion(d, (s) => s.total) >= 100,
  },
  {
    id: "maraton",
    nombre: "Maratón de 30 minutos",
    descripcion: "Mantén una sesión durante 30 minutos.",
    color: "#4F7FE0",
    cumple: (d) => maxSesion(d, (s) => s.duracionMs) >= 30 * MIN,
  },
  {
    id: "ritmo-veloz",
    nombre: "Ritmo veloz",
    descripcion: "Alcanza un pico de 12 unidades en un minuto.",
    color: "#3BB8C9",
    cumple: (d) => maxSesion(d, (s) => s.ritmoPico) >= 12,
  },
  {
    id: "probador",
    nombre: "Probador de 5 comidas",
    descripcion: "Prueba 5 comidas distintas.",
    color: "#4FBF7A",
    cumple: (d) => comidasProbadas(d) >= 5,
  },
  {
    id: "competidor",
    nombre: "Competidor",
    descripcion: "Guarda tu primera competencia.",
    color: "#8A6BD1",
    cumple: (d) => d.competencias.length >= 1,
  },
  {
    id: "campeon-arena",
    nombre: "Campeón de arena",
    descripcion: "Gana una competencia de 4 o más participantes.",
    color: "#F2A93B",
    cumple: (d) => d.competencias.some((c) => c.participantes.length >= 4),
  },
  {
    id: "remontada",
    nombre: "Remontada en el último minuto",
    descripcion: "Gana una ronda yendo por detrás al entrar al último minuto.",
    color: "#F2705F",
    cumple: (d) => d.competencias.some((c) => c.remontada),
  },
  {
    id: "racha-3",
    nombre: "Racha de 3 victorias",
    descripcion: "Gana 3 competencias seguidas con el mismo nombre.",
    color: "#E86FA9",
    cumple: (d) => mejorRacha(d) >= 3,
  },
  {
    id: "meta-superada",
    nombre: "Meta superada",
    descripcion: "Termina una sesión por encima de tu meta.",
    color: "#4FBF7A",
    cumple: (d) => d.sesiones.some((s) => s.superoMeta),
  },
  {
    id: "personalizada",
    nombre: "Comida personalizada",
    descripcion: "Crea tu propia comida.",
    color: "#3BB8C9",
    cumple: (d) => d.comidasPersonalizadas.length >= 1,
  },
  {
    id: "record-personal",
    nombre: "Récord personal",
    descripcion: "Rompe uno de tus récords en una sesión.",
    color: "#E9D13A",
    cumple: (d) => d.sesiones.some((s) => s.records.length > 0),
  },
];

/** Desbloquea los logros nuevos; nunca vuelve a bloquear uno ya obtenido. */
export function evaluarLogros(
  datos: DatosApp,
  ahora: number,
): { logros: DatosApp["logros"]; nuevos: string[] } {
  const logros = { ...datos.logros };
  const nuevos: string[] = [];
  for (const l of LOGROS) {
    if (!logros[l.id] && l.cumple(datos)) {
      logros[l.id] = ahora;
      nuevos.push(l.id);
    }
  }
  return { logros, nuevos };
}
