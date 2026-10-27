"use client";

import { useDatos } from "./AppProvider";
import { Insignia } from "./Insignia";
import { LOGROS } from "@/lib/logros";

export default function GaleriaLogros() {
  const { datos, cargado } = useDatos();
  const obtenidos = LOGROS.filter((l) => datos.logros[l.id]).length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-extrabold text-tinta-fondo">Logros</h1>
        <p className="text-lg font-medium text-tinta-fondo" aria-live="polite">
          {cargado ? `${obtenidos} de ${LOGROS.length} desbloqueados` : " "}
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LOGROS.map((l) => {
          const fecha = datos.logros[l.id];
          const bloqueado = !fecha;
          return (
            <li
              key={l.id}
              className="caja flex items-center gap-4 p-4"
              style={bloqueado ? { opacity: 0.8 } : undefined}
            >
              <Insignia id={l.id} bloqueada={bloqueado} className="h-20 w-20" />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-extrabold leading-tight">{l.nombre}</h2>
                <p className="text-sm text-tinta-suave">{l.descripcion}</p>
                <p className="mt-1 text-sm font-bold">
                  {bloqueado
                    ? "Bloqueado"
                    : `Obtenido el ${new Date(fecha).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}`}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
