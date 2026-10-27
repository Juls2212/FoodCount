import type { Catalogo, Categoria, Comida } from "@/types";
import catalogoJson from "@/data/catalog.json";

export const catalogo: Catalogo = catalogoJson;

export const categorias: Categoria[] = catalogo.categorias;

export function categoriaPorId(id: string): Categoria | undefined {
  return categorias.find((c) => c.id === id);
}

export function nombreUnidad(comida: Comida, cantidad: number): string {
  return cantidad === 1 ? comida.unidad.singular : comida.unidad.plural;
}
