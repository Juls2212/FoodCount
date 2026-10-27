import type { Metadata } from "next";
import { Competencia } from "@/components/competencia/Competencia";

export const metadata: Metadata = { title: "Competencia" };

export default function PaginaCompetencia() {
  return <Competencia />;
}
