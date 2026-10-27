import type { Modo, Paleta, Pantalla } from "@/types";

export type Tokens = { [nombre: string]: string };

export const CONTRASTE_MIN = 4.5;

const NEGRO_TINTA = "#14110F";
const BLANCO = "#FFFFFF";

/* ---------- Utilidades de color ---------- */

const limitar = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

function hexARgb(hex: string): [number, number, number] {
  const limpio = hex.replace("#", "");
  const n = parseInt(limpio, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbAHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.round(limitar(v, 0, 255)).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

export function hexAHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexARgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}

export function hslAHex(h: number, s: number, l: number): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = limitar(s, 0, 1);
  const ll = limitar(l, 0, 1);
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;
  let rgb: [number, number, number];
  if (hh < 60) rgb = [c, x, 0];
  else if (hh < 120) rgb = [x, c, 0];
  else if (hh < 180) rgb = [0, c, x];
  else if (hh < 240) rgb = [0, x, c];
  else if (hh < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgbAHex((rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255);
}

export function luminancia(hex: string): number {
  const [r, g, b] = hexARgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/* ---------- Ajustes automaticos de contraste ---------- */

function peorContraste(color: string, fondos: string[]): number {
  return Math.min(...fondos.map((f) => contraste(color, f)));
}

/** Mueve la luminosidad de `fg` hasta cumplir AA contra todos los fondos. */
export function ajustarTexto(
  fg: string,
  fondos: string[],
  minimo = CONTRASTE_MIN,
): string {
  if (peorContraste(fg, fondos) >= minimo) return fg;
  const [h, s, l] = hexAHsl(fg);
  const dir =
    peorContraste(hslAHex(h, s, 0), fondos) >=
    peorContraste(hslAHex(h, s, 1), fondos)
      ? -1
      : 1;
  for (let paso = 1; paso <= 100; paso++) {
    const candidato = hslAHex(h, s, l + dir * paso * 0.01);
    if (peorContraste(candidato, fondos) >= minimo) return candidato;
  }
  return dir < 0 ? "#000000" : "#FFFFFF";
}

export function mejorTinta(fondo: string): string {
  return contraste(fondo, NEGRO_TINTA) >= contraste(fondo, BLANCO)
    ? NEGRO_TINTA
    : BLANCO;
}

/** Devuelve un relleno y un color de texto encima que cumplen AA. */
export function rellenoAccesible(relleno: string): {
  relleno: string;
  sobre: string;
} {
  const sobre = mejorTinta(relleno);
  if (contraste(relleno, sobre) >= CONTRASTE_MIN) return { relleno, sobre };
  const [h, s, l] = hexAHsl(relleno);
  const dir = sobre === BLANCO ? -1 : 1;
  for (let paso = 1; paso <= 100; paso++) {
    const candidato = hslAHex(h, s, l + dir * paso * 0.01);
    if (contraste(candidato, sobre) >= CONTRASTE_MIN)
      return { relleno: candidato, sobre };
  }
  return { relleno, sobre };
}

/** Deriva la paleta completa de una comida personalizada a partir de un color. */
export function derivarPaleta(primario: string): Paleta {
  const [h] = hexAHsl(primario);
  return { primario: primario.toUpperCase(), secundario: hslAHex(h, 0.75, 0.9) };
}

/* ---------- Calculo del tema ---------- */

interface EntradaTema {
  paleta: Paleta;
  modo: Modo;
  pantalla: Pantalla;
}

const ESTADOS: { [modo in Modo]: { exito: string; peligro: string; aviso: string } } = {
  claro: { exito: "#1B7F4B", peligro: "#B3261E", aviso: "#8A5600" },
  oscuro: { exito: "#4ADE9A", peligro: "#FF8A80", aviso: "#FFC857" },
};

export function calcularTema({ paleta, modo, pantalla }: EntradaTema): Tokens {
  const [h, sP, lP] = hexAHsl(paleta.primario);
  const arena = pantalla === "competencia";
  const claro = modo === "claro";
  const complementario = (h + 180) % 360;

  let fondo: string;
  let superficie: string;
  let superficie2: string;
  let tinta: string;
  let tintaFondo: string;
  let borde: string;
  let sombra: string;
  let primarioBase: string;
  let acentoBase: string;
  let tintaSuaveBase: string;

  if (claro && !arena) {
    fondo = hslAHex(h, 0.7, 0.95);
    superficie = "#FFFBF4";
    superficie2 = hslAHex(h, 0.55, 0.9);
    tinta = "#1B1815";
    tintaFondo = tinta;
    borde = tinta;
    sombra = tinta;
    primarioBase = paleta.primario;
    acentoBase = paleta.secundario;
    tintaSuaveBase = hslAHex(h, 0.08, 0.33);
  } else if (claro && arena) {
    const base = hslAHex(h, Math.max(sP, 0.7), limitar(lP, 0.45, 0.6));
    const ajustado = rellenoAccesible(base);
    fondo = ajustado.relleno;
    tintaFondo = ajustado.sobre;
    superficie = "#FFFFFF";
    superficie2 = "#F3EEE6";
    tinta = "#0D0B0A";
    borde = tinta;
    sombra = tinta;
    primarioBase = fondo;
    acentoBase = hslAHex(complementario, Math.max(sP, 0.65), 0.55);
    tintaSuaveBase = hslAHex(h, 0.1, 0.3);
  } else if (!claro && !arena) {
    fondo = hslAHex(h, 0.3, 0.09);
    superficie = hslAHex(h, 0.22, 0.14);
    superficie2 = hslAHex(h, 0.2, 0.19);
    tinta = "#F6F1EA";
    tintaFondo = tinta;
    borde = hslAHex(h, 0.35, 0.45);
    sombra = hslAHex(h, 0.45, 0.2);
    primarioBase = hslAHex(h, sP, limitar(lP, 0.5, 0.65));
    acentoBase = hslAHex(h, 0.6, 0.78);
    tintaSuaveBase = hslAHex(h, 0.1, 0.72);
  } else {
    const neon = hslAHex(h, Math.max(sP, 0.9), limitar(lP, 0.55, 0.65));
    fondo = hslAHex(h, 0.35, 0.04);
    superficie = hslAHex(h, 0.3, 0.08);
    superficie2 = hslAHex(h, 0.28, 0.12);
    tinta = "#FFFFFF";
    tintaFondo = tinta;
    borde = neon;
    sombra = neon;
    primarioBase = neon;
    acentoBase = hslAHex(complementario, 0.95, 0.62);
    tintaSuaveBase = hslAHex(h, 0.12, 0.76);
  }

  // Los textos sobre superficies siempre se miden contra las superficies; el
  // fondo solo cuenta cuando no es el primario saturado de la arena clara.
  const fondoTextoPlano = !(claro && arena);
  const sobreSuperficies = [superficie, superficie2];
  const sobreTodo = fondoTextoPlano ? [fondo, ...sobreSuperficies] : sobreSuperficies;

  const primario = rellenoAccesible(primarioBase);
  const acento = rellenoAccesible(acentoBase);
  const estados = ESTADOS[modo];

  return {
    fondo,
    superficie,
    "superficie-2": superficie2,
    tinta,
    "tinta-suave": ajustarTexto(tintaSuaveBase, sobreTodo),
    "tinta-fondo": tintaFondo,
    primario: primario.relleno,
    "sobre-primario": primario.sobre,
    "primario-texto": ajustarTexto(paleta.primario, sobreTodo),
    acento: acento.relleno,
    "sobre-acento": acento.sobre,
    "acento-texto": ajustarTexto(acentoBase, sobreTodo),
    borde,
    sombra,
    exito: ajustarTexto(estados.exito, sobreTodo),
    peligro: ajustarTexto(estados.peligro, sobreTodo),
    aviso: ajustarTexto(estados.aviso, sobreTodo),
  };
}

/** Lista los pares de texto que no cumplen AA (vacia si el tema es valido). */
export function verificarContraste(
  t: Tokens,
  pantalla: Pantalla,
  modo: Modo,
): { par: string; ratio: number }[] {
  const planoFondo = !(modo === "claro" && pantalla === "competencia");
  const pares: [string, string, string][] = [
    ["tinta/superficie", t.tinta, t.superficie],
    ["tinta/superficie-2", t.tinta, t["superficie-2"]],
    ["tinta-fondo/fondo", t["tinta-fondo"], t.fondo],
    ["tinta-suave/superficie", t["tinta-suave"], t.superficie],
    ["tinta-suave/superficie-2", t["tinta-suave"], t["superficie-2"]],
    ["sobre-primario/primario", t["sobre-primario"], t.primario],
    ["sobre-acento/acento", t["sobre-acento"], t.acento],
    ["primario-texto/superficie", t["primario-texto"], t.superficie],
    ["acento-texto/superficie", t["acento-texto"], t.superficie],
    ["exito/superficie", t.exito, t.superficie],
    ["peligro/superficie", t.peligro, t.superficie],
    ["aviso/superficie", t.aviso, t.superficie],
  ];
  if (planoFondo) {
    pares.push(["tinta-suave/fondo", t["tinta-suave"], t.fondo]);
    pares.push(["primario-texto/fondo", t["primario-texto"], t.fondo]);
  }
  return pares
    .map(([par, a, b]) => ({ par, ratio: contraste(a, b) }))
    .filter((p) => p.ratio < CONTRASTE_MIN);
}
