// Sonidos sinteticos con Web Audio: no hay archivos de audio.

let contexto: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!contexto) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    contexto = new Ctor();
  }
  if (contexto.state === "suspended") void contexto.resume();
  return contexto;
}

const ESCALA = [0, 2, 4, 7, 9];

function nota(
  ctx: AudioContext,
  frecuencia: number,
  inicio: number,
  duracion: number,
  volumen: number,
  tipo: OscillatorType = "triangle",
) {
  const osc = ctx.createOscillator();
  const ganancia = ctx.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(frecuencia * 0.8, inicio);
  osc.frequency.exponentialRampToValueAtTime(frecuencia, inicio + 0.04);
  ganancia.gain.setValueAtTime(0.0001, inicio);
  ganancia.gain.exponentialRampToValueAtTime(volumen, inicio + 0.008);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
  osc.connect(ganancia).connect(ctx.destination);
  osc.start(inicio);
  osc.stop(inicio + duracion + 0.02);
}

/** Pop corto; el tono sube con el combo (pentatonica, hasta dos octavas). */
export function pop(combo: number): void {
  const ctx = audio();
  if (!ctx) return;
  const semitonos = Math.min(24, ESCALA[combo % 5] + 12 * Math.floor(combo / 5));
  nota(ctx, 262 * Math.pow(2, semitonos / 12), ctx.currentTime, 0.14, 0.18);
}

/** Arpegio ascendente para los hitos. */
export function fanfarria(): void {
  const ctx = audio();
  if (!ctx) return;
  [0, 4, 7, 12].forEach((s, i) =>
    nota(ctx, 392 * Math.pow(2, s / 12), ctx.currentTime + i * 0.07, 0.22, 0.2, "square"),
  );
}

export function vibrar(patron: number | number[]): void {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(patron);
  }
}
