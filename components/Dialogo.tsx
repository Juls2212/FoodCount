"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface Props {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  /** Botones de accion, alineados al pie. */
  acciones?: ReactNode;
  ancho?: "normal" | "ancho";
}

/** Dialogo modal nativo: trae trampa de foco y cierre con Escape. */
export function Dialogo({ abierto, titulo, onCerrar, children, acciones, ancho = "normal" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onClose={onCerrar}
      onClick={(e) => {
        if (e.target === ref.current) onCerrar();
      }}
      className={`dialogo caja m-auto w-[calc(100%-2rem)] p-0 ${ancho === "ancho" ? "max-w-2xl" : "max-w-md"}`}
    >
      {abierto && (
        <div className="flex max-h-[85dvh] flex-col gap-4 overflow-y-auto p-5">
          <h2 id={idTitulo} className="text-2xl font-extrabold">
            {titulo}
          </h2>
          <div className="flex flex-col gap-3">{children}</div>
          {acciones && <div className="flex flex-wrap justify-end gap-3">{acciones}</div>}
        </div>
      )}
    </dialog>
  );
}

interface PropsConfirmar {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  etiqueta: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function DialogoConfirmar({
  abierto,
  titulo,
  mensaje,
  etiqueta,
  onConfirmar,
  onCancelar,
}: PropsConfirmar) {
  return (
    <Dialogo
      abierto={abierto}
      titulo={titulo}
      onCerrar={onCancelar}
      acciones={
        <>
          <button type="button" className="btn" onClick={onCancelar} autoFocus>
            Cancelar
          </button>
          <button
            type="button"
            className="btn"
            style={{ backgroundColor: "var(--peligro)", color: "var(--superficie)" }}
            onClick={onConfirmar}
          >
            {etiqueta}
          </button>
        </>
      }
    >
      <p className="text-lg">{mensaje}</p>
    </Dialogo>
  );
}
