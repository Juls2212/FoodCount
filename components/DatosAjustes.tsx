"use client";

import { useRef, useState } from "react";
import { useDatos } from "./AppProvider";
import { IconoDescargar, IconoSubir } from "./Iconos";
import { exportarDatos, importarDatos } from "@/lib/storage";

export function DatosAjustes() {
  const { recargar } = useDatos();
  const entrada = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  const alElegirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    const resultado = await importarDatos(archivo);
    if (resultado.ok) {
      recargar();
      setMensaje({ ok: true, texto: "Datos importados correctamente." });
    } else {
      setMensaje({ ok: false, texto: resultado.error });
    }
  };

  return (
    <section aria-labelledby="titulo-datos" className="caja flex flex-col gap-4 p-5">
      <div>
        <h2 id="titulo-datos" className="text-xl font-extrabold">
          Tus datos
        </h2>
        <p className="text-tinta-suave">
          Todo se guarda solo en este dispositivo. Exporta un archivo para
          respaldarlo o moverlo a otro.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" className="btn btn-primario" onClick={exportarDatos}>
          <IconoDescargar className="h-5 w-5" />
          Exportar datos
        </button>
        <button
          type="button"
          className="btn btn-acento"
          onClick={() => entrada.current?.click()}
        >
          <IconoSubir className="h-5 w-5" />
          Importar datos
        </button>
        <input
          ref={entrada}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={alElegirArchivo}
          aria-label="Archivo de datos a importar"
        />
      </div>
      <p
        role="status"
        className={`font-bold ${mensaje?.ok ? "text-exito" : "text-peligro"}`}
      >
        {mensaje?.texto}
      </p>
    </section>
  );
}
