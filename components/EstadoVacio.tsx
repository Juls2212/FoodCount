import type { ReactNode } from "react";

interface Props {
  titulo: string;
  descripcion: string;
  children?: ReactNode;
}

/** Plato vacio con cubiertos, dibujado con formas propias. */
export function EstadoVacio({ titulo, descripcion, children }: Props) {
  return (
    <div className="caja flex flex-col items-center gap-3 p-8 text-center">
      <svg viewBox="0 0 200 140" className="h-32 w-48" aria-hidden="true" focusable="false">
        <ellipse cx="100" cy="86" rx="62" ry="30" strokeWidth="6" style={{ fill: "var(--superficie-2)", stroke: "var(--tinta)" }} />
        <ellipse cx="100" cy="86" rx="40" ry="17" strokeWidth="4" style={{ fill: "var(--superficie)", stroke: "var(--tinta)" }} />
        <g strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--tinta)", fill: "none" }}>
          <path d="M22 34V74M14 34V50Q14 58 22 58Q30 58 30 50V34M22 58V112" />
          <path d="M180 34Q168 44 172 62Q174 70 180 70M180 34V112" />
        </g>
        <g style={{ fill: "var(--primario)", stroke: "var(--tinta)" }} strokeWidth="4">
          <circle cx="100" cy="30" r="9" />
          <circle cx="126" cy="18" r="6" />
          <circle cx="76" cy="16" r="5" />
        </g>
      </svg>
      <h2 className="text-2xl font-extrabold">{titulo}</h2>
      <p className="max-w-sm text-lg text-tinta-suave">{descripcion}</p>
      {children}
    </div>
  );
}
