export type Modo = "claro" | "oscuro";
export type Pantalla = "contador" | "competencia";

export interface Paleta {
  primario: string;
  secundario: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  color: string;
}

export interface Unidad {
  singular: string;
  plural: string;
}

export interface Comida {
  id: string;
  nombre: string;
  categoria: string;
  unidad: Unidad;
  puntos: number;
  paleta: Paleta;
  personalizada?: boolean;
}

export interface Catalogo {
  categorias: Categoria[];
  comidas: Comida[];
  coloresPersonalizados: { nombre: string; hex: string }[];
}

/* ---------- Cronometro ---------- */

/** `desde` es el instante (ms epoch) en que se reanudo; null si esta en pausa. */
export interface Cron {
  acumulado: number;
  desde: number | null;
}

/* ---------- Sesion (modo contador) ---------- */

/** Cada +1 es una accion; deshacer saca la ultima de la pila. */
export interface Accion {
  t: number;
  comidaId: string;
  puntos: number;
}

export interface SesionActiva {
  id: string;
  inicio: number;
  cron: Cron;
  acciones: Accion[];
}

export interface LineaDesglose {
  comidaId: string;
  nombre: string;
  color: string;
  cantidad: number;
  puntos: number;
}

export type TipoRecord = "unidades" | "ritmo" | "duracion";

export interface Sesion {
  id: string;
  inicio: number;
  fin: number;
  duracionMs: number;
  total: number;
  puntos: number;
  desglose: LineaDesglose[];
  ritmoPromedio: number;
  ritmoPico: number;
  meta: number;
  superoMeta: boolean;
  records: TipoRecord[];
}

export interface ValorRecord {
  valor: number;
  fecha: number;
}

export interface Records {
  unidades: ValorRecord | null;
  ritmo: ValorRecord | null;
  duracion: ValorRecord | null;
}

/* ---------- Competencia ---------- */

export interface Avatar {
  forma: number;
  color: number;
  patron: number;
}

export interface Participante {
  id: string;
  nombre: string;
  avatar: Avatar;
}

export interface ConfigCompetencia {
  participantes: Participante[];
  /** null: ronda libre, sin limite de tiempo. */
  duracionMin: number | null;
  /** null: cada participante elige su comida. */
  comidaUnica: string | null;
}

export interface AccionComp {
  /** Instante real (ms epoch). */
  t: number;
  /** Milisegundos transcurridos de la ronda (sin contar pausas). */
  te: number;
  pid: string;
  comidaId: string;
  puntos: number;
}

export interface CompetenciaActiva {
  id: string;
  config: ConfigCompetencia;
  inicio: number;
  fase: "juego" | "resultado";
  cron: Cron;
  acciones: AccionComp[];
  comidaPor: { [pid: string]: string };
  guardada: boolean;
}

export interface ResultadoParticipante {
  id: string;
  nombre: string;
  avatar: Avatar;
  posicion: number;
  unidades: number;
  puntos: number;
  ritmo: number;
  desglose: LineaDesglose[];
  destacado: string | null;
}

export interface Competencia {
  id: string;
  fecha: number;
  duracionMs: number;
  duracionObjetivoMin: number | null;
  participantes: ResultadoParticipante[];
  ganadorId: string;
  remontada: boolean;
}

/* ---------- Ajustes y datos ---------- */

export interface Ajustes {
  /** null significa "seguir la preferencia del sistema" hasta que la persona elija. */
  modo: Modo | null;
  comidaActiva: string | null;
  /** Unidades que cuentan como estomago lleno. */
  meta: number;
  sonido: boolean;
  vibracion: boolean;
}

export interface DatosApp {
  version: number;
  ajustes: Ajustes;
  comidasPersonalizadas: Comida[];
  sesionActiva: SesionActiva | null;
  competenciaActiva: CompetenciaActiva | null;
  sesiones: Sesion[];
  competencias: Competencia[];
  records: Records;
  /** id de logro -> fecha de desbloqueo. */
  logros: { [id: string]: number };
}
