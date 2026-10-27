"use client";

interface Props {
  etiqueta: string;
  descripcion: string;
  activo: boolean;
  onCambiar: (activo: boolean) => void;
}

export function Interruptor({ etiqueta, descripcion, activo, onCambiar }: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-display text-lg font-bold">{etiqueta}</p>
        <p className="text-tinta-suave">{descripcion}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        aria-label={etiqueta}
        onClick={() => onCambiar(!activo)}
        className="relative flex h-12 w-[4.5rem] shrink-0 cursor-pointer items-center rounded-full border-[3px] border-borde p-0.5"
        style={{
          touchAction: "manipulation",
          backgroundColor: activo ? "var(--primario)" : "var(--superficie-2)",
        }}
      >
        <span
          className="block h-8 w-8 rounded-full border-[3px] border-borde bg-superficie"
          style={{
            transform: activo ? "translateX(1.75rem)" : "translateX(0)",
            transition: "transform 250ms cubic-bezier(0.3, 1.4, 0.5, 1)",
          }}
        />
      </button>
    </div>
  );
}
