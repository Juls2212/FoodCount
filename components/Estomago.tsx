"use client";

import { memo } from "react";
import { IconoMas, IconoMenos } from "./Iconos";

const BLOQUES = 20;
const PASO_META = 5;
const META_MIN = 5;
const META_MAX = 200;

type Estado = "tranquilo" | "animado" | "satisfecho" | "lleno" | "limite" | "leyenda";

const INFO: { [e in Estado]: { titulo: string; frase: string; color: string } } = {
  tranquilo: { titulo: "Tranquilo", frase: "Apenas calentando.", color: "var(--primario)" },
  animado: { titulo: "Animado", frase: "Ya agarró el ritmo.", color: "var(--acento-texto)" },
  satisfecho: { titulo: "Satisfecho", frase: "Se siente muy bien.", color: "var(--exito)" },
  lleno: { titulo: "Lleno", frase: "Queda poco espacio.", color: "var(--aviso)" },
  limite: { titulo: "Al límite", frase: "Un bocado más y listo.", color: "var(--peligro)" },
  leyenda: { titulo: "Modo leyenda", frase: "Superó la meta.", color: "var(--primario-texto)" },
};

export function estadoDe(cantidad: number, meta: number): Estado {
  const r = cantidad / meta;
  if (r > 1) return "leyenda";
  if (r >= 0.95) return "limite";
  if (r >= 0.8) return "lleno";
  if (r >= 0.5) return "satisfecho";
  if (r >= 0.2) return "animado";
  return "tranquilo";
}

function Cara({ estado, color }: { estado: Estado; color: string }) {
  const trazo = { fill: "none", stroke: "var(--tinta)", strokeWidth: 5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const punto = { fill: "var(--tinta)" } as const;
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0" aria-hidden="true" focusable="false">
      <circle cx="54" cy="62" r="36" strokeWidth="5" style={{ fill: color, stroke: "var(--tinta)" }} />
      <g className={estado === "limite" ? "tiembla" : undefined} style={{ ["--tiembla-amp" as string]: "1.5px", ["--tiembla-dur" as string]: "0.14s" }}>
        <circle cx="50" cy="58" r="36" strokeWidth="5" style={{ fill: "var(--superficie)", stroke: "var(--tinta)" }} />
        <g transform="translate(0 8)">
          {estado === "tranquilo" && (
            <>
              <circle cx="38" cy="44" r="3.5" style={punto} />
              <circle cx="62" cy="44" r="3.5" style={punto} />
              <path d="M41 60Q50 65 59 60" style={trazo} />
            </>
          )}
          {estado === "animado" && (
            <>
              <circle cx="38" cy="45" r="5.5" style={punto} />
              <circle cx="62" cy="45" r="5.5" style={punto} />
              <circle cx="40" cy="43" r="1.8" style={{ fill: "var(--superficie)" }} />
              <circle cx="64" cy="43" r="1.8" style={{ fill: "var(--superficie)" }} />
              <path d="M30 34Q38 29 46 33M54 33Q62 29 70 34" style={{ ...trazo, strokeWidth: 4 }} />
              <path d="M37 56Q50 74 63 56Z" style={{ ...trazo, fill: "var(--tinta)", strokeWidth: 3 }} />
            </>
          )}
          {(estado === "satisfecho" || estado === "leyenda") && (
            <>
              <path d="M31 47Q38 39 45 47M55 47Q62 39 69 47" style={trazo} />
              <path d="M35 58Q50 78 65 58" style={trazo} />
              <circle cx="29" cy="58" r="5" style={{ fill: color }} />
              <circle cx="71" cy="58" r="5" style={{ fill: color }} />
            </>
          )}
          {estado === "lleno" && (
            <>
              <path d="M31 46H45M55 46H69" style={trazo} />
              <circle cx="27" cy="58" r="8" style={{ fill: color }} />
              <circle cx="73" cy="58" r="8" style={{ fill: color }} />
              <path d="M39 64Q44 59 50 64T61 64" style={{ ...trazo, strokeWidth: 4 }} />
            </>
          )}
          {estado === "limite" && (
            <>
              <circle cx="38" cy="44" r="8" style={{ fill: "var(--superficie)", stroke: "var(--tinta)", strokeWidth: 4 }} />
              <circle cx="62" cy="44" r="8" style={{ fill: "var(--superficie)", stroke: "var(--tinta)", strokeWidth: 4 }} />
              <circle cx="40" cy="45" r="2.5" style={punto} />
              <circle cx="60" cy="45" r="2.5" style={punto} />
              <path d="M35 66L41 60L47 67L53 60L59 67L65 61" style={{ ...trazo, strokeWidth: 4 }} />
              <path d="M78 22Q87 34 78 40Q69 34 78 22Z" style={{ fill: "#5BC0EB", stroke: "var(--tinta)", strokeWidth: 4, strokeLinejoin: "round" }} />
            </>
          )}
        </g>
        {estado === "leyenda" && (
          <path
            d="M32 26L35 6L43 16L50 3L57 16L65 6L68 26Z"
            style={{ fill: "#F5C842", stroke: "var(--tinta)", strokeWidth: 4, strokeLinejoin: "round" }}
          />
        )}
      </g>
    </svg>
  );
}

interface Props {
  cantidad: number;
  meta: number;
  onMeta: (meta: number) => void;
}

export const Estomago = memo(function Estomago({ cantidad, meta, onMeta }: Props) {
  const estado = estadoDe(cantidad, meta);
  const info = INFO[estado];
  const r = cantidad / meta;
  const llenos =
    estado === "leyenda"
      ? BLOQUES
      : Math.min(BLOQUES, Math.floor(r * BLOQUES) + (cantidad > 0 && r * BLOQUES < 1 ? 1 : 0));
  const vibra = r >= 0.8;
  const cerca = r >= 0.95;

  return (
    <section aria-labelledby="titulo-estomago" className="caja flex flex-col gap-4 p-5">
      <div className="flex items-center gap-4">
        <Cara estado={estado} color={info.color} />
        <div className="min-w-0 flex-1">
          <h2 id="titulo-estomago" className="text-xl font-extrabold leading-tight">
            Estómago: {info.titulo}
          </h2>
          <p className="text-tinta-suave">{info.frase}</p>
          <p className="mt-1 font-display text-lg font-bold">
            {cantidad} de {meta}
            {estado === "leyenda" && (
              <span
                className="ml-2 inline-block rounded-lg border-[3px] border-borde bg-primario px-2 py-0.5 align-middle text-sm text-sobre-primario"
                style={{ transform: "rotate(-3deg)" }}
              >
                +{cantidad - meta}
              </span>
            )}
          </p>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Progreso hacia la meta"
        aria-valuemin={0}
        aria-valuemax={meta}
        aria-valuenow={Math.min(cantidad, meta)}
        aria-valuetext={`${cantidad} de ${meta}. ${info.titulo}`}
        className={`grid gap-[3px] ${vibra && estado !== "leyenda" ? "tiembla" : ""}`}
        style={{
          gridTemplateColumns: `repeat(${BLOQUES}, minmax(0, 1fr))`,
          ["--tiembla-amp" as string]: cerca ? "2px" : "1px",
          ["--tiembla-dur" as string]: cerca ? "0.12s" : "0.22s",
        }}
      >
        {Array.from({ length: BLOQUES }, (_, i) => {
          const lleno = i < llenos;
          return (
            <span
              key={i}
              className={`h-8 rounded-md border-2 border-borde ${
                estado === "leyenda" && i % 2 === 1 ? "i-titila" : ""
              }`}
              style={{
                backgroundColor: lleno ? info.color : "var(--superficie-2)",
                transform: lleno ? "scale(1)" : "scale(0.88)",
                transition: "transform 200ms ease, background-color 450ms ease",
              }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="font-bold">Meta</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn"
            aria-label="Bajar la meta"
            disabled={meta <= META_MIN}
            onClick={() => onMeta(Math.max(META_MIN, meta - PASO_META))}
          >
            <IconoMenos className="h-5 w-5" />
          </button>
          <span className="min-w-12 text-center font-display text-2xl font-extrabold" aria-live="polite">
            {meta}
          </span>
          <button
            type="button"
            className="btn"
            aria-label="Subir la meta"
            disabled={meta >= META_MAX}
            onClick={() => onMeta(Math.min(META_MAX, meta + PASO_META))}
          >
            <IconoMas className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
});
