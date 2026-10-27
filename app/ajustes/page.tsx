import type { Metadata } from "next";
import { Preferencias } from "@/components/Preferencias";
import { DatosAjustes } from "@/components/DatosAjustes";

export const metadata: Metadata = { title: "Ajustes" };

export default function Ajustes() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-3xl font-extrabold text-tinta-fondo">Ajustes</h1>
      <Preferencias />
      <DatosAjustes />
    </div>
  );
}
