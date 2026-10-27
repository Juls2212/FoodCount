import type { Comida } from "@/types";
import { rellenoAccesible } from "@/lib/theme";

/** Circulo de color con la inicial. Los dibujos reales llegan en la fase 2. */
export function MarcadorComida({
  comida,
  className = "h-16 w-16 text-3xl",
}: {
  comida: Comida;
  className?: string;
}) {
  const { relleno, sobre } = rellenoAccesible(comida.paleta.primario);
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full border-[3px] border-borde font-display font-extrabold ${className}`}
      style={{ backgroundColor: relleno, color: sobre }}
    >
      {comida.nombre.charAt(0).toUpperCase()}
    </span>
  );
}
