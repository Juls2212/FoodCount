import type { DatosApp } from "@/types";

export const CLAVE_ALMACEN = "panzometro:v1";
export const CLAVE_CACHE_TEMA = "panzometro:tema-cache";
export const VERSION_ACTUAL = 3;
export const META_POR_DEFECTO = 30;

const LIMITE_IMPORTACION = 5 * 1024 * 1024;
const HEX = /^#[0-9a-fA-F]{6}$/;

type Obj = { [clave: string]: unknown };

const esObjeto = (x: unknown): x is Obj =>
  typeof x === "object" && x !== null && !Array.isArray(x);

const esNumero = (x: unknown): x is number =>
  typeof x === "number" && Number.isFinite(x);

export function ajustesPorDefecto(): DatosApp["ajustes"] {
  return {
    modo: null,
    comidaActiva: null,
    meta: META_POR_DEFECTO,
    sonido: false,
    vibracion: true,
  };
}

export function recordsPorDefecto(): DatosApp["records"] {
  return { unidades: null, ritmo: null, duracion: null };
}

export function datosPorDefecto(): DatosApp {
  return {
    version: VERSION_ACTUAL,
    ajustes: ajustesPorDefecto(),
    comidasPersonalizadas: [],
    sesionActiva: null,
    competenciaActiva: null,
    sesiones: [],
    competencias: [],
    records: recordsPorDefecto(),
    logros: {},
  };
}

/* ---------- Validacion ---------- */

function comidaValida(x: unknown): boolean {
  if (!esObjeto(x)) return false;
  const unidad = x.unidad;
  const paleta = x.paleta;
  return (
    typeof x.id === "string" &&
    typeof x.nombre === "string" &&
    typeof x.categoria === "string" &&
    esNumero(x.puntos) &&
    esObjeto(unidad) &&
    typeof unidad.singular === "string" &&
    typeof unidad.plural === "string" &&
    esObjeto(paleta) &&
    typeof paleta.primario === "string" &&
    HEX.test(paleta.primario) &&
    typeof paleta.secundario === "string" &&
    HEX.test(paleta.secundario)
  );
}

const cronValido = (x: unknown): boolean =>
  esObjeto(x) && esNumero(x.acumulado) && (x.desde === null || esNumero(x.desde));

function sesionActivaValida(x: unknown): boolean {
  return (
    esObjeto(x) &&
    typeof x.id === "string" &&
    esNumero(x.inicio) &&
    cronValido(x.cron) &&
    Array.isArray(x.acciones) &&
    x.acciones.every(
      (a) => esObjeto(a) && esNumero(a.t) && typeof a.comidaId === "string" && esNumero(a.puntos),
    )
  );
}

const avatarValido = (x: unknown): boolean =>
  esObjeto(x) && esNumero(x.forma) && esNumero(x.color) && esNumero(x.patron);

const participanteValido = (x: unknown): boolean =>
  esObjeto(x) && typeof x.id === "string" && typeof x.nombre === "string" && avatarValido(x.avatar);

function competenciaActivaValida(x: unknown): boolean {
  if (!esObjeto(x) || typeof x.id !== "string" || !cronValido(x.cron)) return false;
  if (x.fase !== "juego" && x.fase !== "resultado") return false;
  if (typeof x.guardada !== "boolean" || !esNumero(x.inicio)) return false;
  const config = x.config;
  if (!esObjeto(config)) return false;
  if (!Array.isArray(config.participantes) || !config.participantes.every(participanteValido))
    return false;
  if (config.duracionMin !== null && !esNumero(config.duracionMin)) return false;
  if (config.comidaUnica !== null && typeof config.comidaUnica !== "string") return false;
  if (!esObjeto(x.comidaPor)) return false;
  return (
    Array.isArray(x.acciones) &&
    x.acciones.every(
      (a) =>
        esObjeto(a) &&
        esNumero(a.t) &&
        esNumero(a.te) &&
        typeof a.pid === "string" &&
        typeof a.comidaId === "string" &&
        esNumero(a.puntos),
    )
  );
}

const desgloseValido = (x: unknown): boolean =>
  Array.isArray(x) &&
  x.every(
    (l) =>
      esObjeto(l) && typeof l.comidaId === "string" && typeof l.nombre === "string" && esNumero(l.cantidad),
  );

function sesionValida(x: unknown): boolean {
  return (
    esObjeto(x) &&
    typeof x.id === "string" &&
    esNumero(x.inicio) &&
    esNumero(x.fin) &&
    esNumero(x.duracionMs) &&
    esNumero(x.total) &&
    esNumero(x.puntos) &&
    esNumero(x.ritmoPromedio) &&
    esNumero(x.ritmoPico) &&
    esNumero(x.meta) &&
    typeof x.superoMeta === "boolean" &&
    Array.isArray(x.records) &&
    desgloseValido(x.desglose)
  );
}

function competenciaValida(x: unknown): boolean {
  return (
    esObjeto(x) &&
    typeof x.id === "string" &&
    esNumero(x.fecha) &&
    esNumero(x.duracionMs) &&
    typeof x.ganadorId === "string" &&
    typeof x.remontada === "boolean" &&
    Array.isArray(x.participantes) &&
    x.participantes.every(
      (p) =>
        participanteValido(p) &&
        esObjeto(p) &&
        esNumero(p.unidades) &&
        esNumero(p.puntos) &&
        esNumero(p.ritmo) &&
        esNumero(p.posicion) &&
        desgloseValido(p.desglose),
    )
  );
}

function recordsValidos(x: unknown): boolean {
  if (!esObjeto(x)) return false;
  return ["unidades", "ritmo", "duracion"].every((k) => {
    const v = x[k];
    return v === null || (esObjeto(v) && esNumero(v.valor) && esNumero(v.fecha));
  });
}

export function validarDatos(x: unknown): x is DatosApp {
  if (!esObjeto(x)) return false;
  if (x.version !== VERSION_ACTUAL) return false;
  const ajustes = x.ajustes;
  if (!esObjeto(ajustes)) return false;
  if (ajustes.modo !== null && ajustes.modo !== "claro" && ajustes.modo !== "oscuro") return false;
  if (ajustes.comidaActiva !== null && typeof ajustes.comidaActiva !== "string") return false;
  if (
    !esNumero(ajustes.meta) ||
    !Number.isInteger(ajustes.meta) ||
    ajustes.meta < 1 ||
    typeof ajustes.sonido !== "boolean" ||
    typeof ajustes.vibracion !== "boolean"
  )
    return false;
  if (!Array.isArray(x.comidasPersonalizadas) || !x.comidasPersonalizadas.every(comidaValida))
    return false;
  if (x.sesionActiva !== null && !sesionActivaValida(x.sesionActiva)) return false;
  if (x.competenciaActiva !== null && !competenciaActivaValida(x.competenciaActiva)) return false;
  if (!Array.isArray(x.sesiones) || !x.sesiones.every(sesionValida)) return false;
  if (!Array.isArray(x.competencias) || !x.competencias.every(competenciaValida)) return false;
  if (!recordsValidos(x.records)) return false;
  if (!esObjeto(x.logros) || !Object.values(x.logros).every(esNumero)) return false;
  return true;
}

/* ---------- Migracion por version ---------- */

/** Cada funcion lleva los datos de la version N a la N+1. */
const MIGRACIONES: { [desde: number]: (d: Obj) => Obj } = {
  0: (d) => ({ ...d, version: 1 }),
  1: (d) => ({
    ...d,
    version: 2,
    ajustes: { ...ajustesPorDefecto(), ...(esObjeto(d.ajustes) ? d.ajustes : {}) },
  }),
  // La v2 solo tenia un contador de prueba por comida: se descarta.
  2: (d) => {
    const resto = { ...d };
    delete resto.contadores;
    return {
      ...resto,
      version: 3,
      sesionActiva: null,
      competenciaActiva: null,
      sesiones: [],
      competencias: [],
      records: recordsPorDefecto(),
      logros: {},
    };
  },
};

export function migrar(crudo: unknown): DatosApp | null {
  if (!esObjeto(crudo)) return null;
  let actual: Obj = crudo;
  let version = esNumero(actual.version) ? actual.version : 0;
  if (version > VERSION_ACTUAL || version < 0) return null;
  while (version < VERSION_ACTUAL) {
    const paso = MIGRACIONES[version];
    if (!paso) return null;
    actual = paso(actual);
    version = esNumero(actual.version) ? actual.version : version + 1;
  }
  return validarDatos(actual) ? actual : null;
}

/* ---------- Lectura y escritura seguras ---------- */

export function leerDatos(): DatosApp {
  if (typeof window === "undefined") return datosPorDefecto();
  let texto: string | null = null;
  try {
    texto = window.localStorage.getItem(CLAVE_ALMACEN);
  } catch {
    return datosPorDefecto();
  }
  if (texto === null) return datosPorDefecto();
  try {
    const migrado = migrar(JSON.parse(texto));
    if (migrado) return migrado;
  } catch {
    // JSON corrupto: se conserva una copia y se arranca limpio.
  }
  try {
    window.localStorage.setItem(`${CLAVE_ALMACEN}:corrupto`, texto);
  } catch {
    // Sin cuota para la copia: se descarta.
  }
  return datosPorDefecto();
}

export type ResultadoEscritura =
  | { ok: true }
  | { ok: false; motivo: "cuota" | "no-disponible" };

export function escribirDatos(datos: DatosApp): ResultadoEscritura {
  if (typeof window === "undefined") return { ok: false, motivo: "no-disponible" };
  try {
    window.localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(datos));
    return { ok: true };
  } catch (error) {
    const cuota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");
    return { ok: false, motivo: cuota ? "cuota" : "no-disponible" };
  }
}

/* ---------- Exportar e importar ---------- */

export function exportarDatos(): void {
  if (typeof window === "undefined") return;
  const datos = leerDatos();
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  const fecha = new Date().toISOString().slice(0, 10);
  enlace.href = url;
  enlace.download = `panzometro-${fecha}.json`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type ResultadoImportacion =
  | { ok: true; datos: DatosApp }
  | { ok: false; error: string };

export async function importarDatos(archivo: File): Promise<ResultadoImportacion> {
  if (archivo.size > LIMITE_IMPORTACION)
    return { ok: false, error: "El archivo es demasiado grande (máximo 5 MB)." };
  let crudo: unknown;
  try {
    crudo = JSON.parse(await archivo.text());
  } catch {
    return { ok: false, error: "El archivo no es un JSON válido." };
  }
  if (esObjeto(crudo) && esNumero(crudo.version) && crudo.version > VERSION_ACTUAL)
    return {
      ok: false,
      error: "El archivo viene de una versión más nueva de Panzómetro y no se puede cargar.",
    };
  const datos = migrar(crudo);
  if (!datos)
    return {
      ok: false,
      error: "El archivo no tiene la estructura de datos de Panzómetro o está dañado.",
    };
  const resultado = escribirDatos(datos);
  if (!resultado.ok)
    return {
      ok: false,
      error:
        resultado.motivo === "cuota"
          ? "No hay espacio disponible en el navegador."
          : "No se pudo guardar en el navegador.",
    };
  return { ok: true, datos };
}
