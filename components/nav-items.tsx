import type { ComponentType, SVGProps } from "react";
import {
  IconoAjustes,
  IconoCompetencia,
  IconoContador,
  IconoHistorial,
  IconoLogros,
} from "./Iconos";

export interface ItemNav {
  href: string;
  nombre: string;
  Icono: ComponentType<SVGProps<SVGSVGElement>>;
}

export const itemsNav: ItemNav[] = [
  { href: "/", nombre: "Contador", Icono: IconoContador },
  { href: "/competencia", nombre: "Competencia", Icono: IconoCompetencia },
  { href: "/historial", nombre: "Historial", Icono: IconoHistorial },
  { href: "/logros", nombre: "Logros", Icono: IconoLogros },
  { href: "/ajustes", nombre: "Ajustes", Icono: IconoAjustes },
];

export function esActivo(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
