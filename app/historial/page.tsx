import type { Metadata } from "next";
import { Historial } from "@/components/Historial";

export const metadata: Metadata = { title: "Historial" };

export default function PaginaHistorial() {
  return <Historial />;
}
