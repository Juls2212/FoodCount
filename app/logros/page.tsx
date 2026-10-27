import type { Metadata } from "next";
import { GaleriaLogrosLazy } from "@/components/GaleriaLogrosLazy";

export const metadata: Metadata = { title: "Logros" };

export default function PaginaLogros() {
  return <GaleriaLogrosLazy />;
}
