import type { Metadata } from "next";
import { FormComida } from "@/components/FormComida";

export const metadata: Metadata = { title: "Nueva comida" };

export default function NuevaComida() {
  return <FormComida />;
}
