"use client";

import { memo } from "react";
import { Avatar } from "../Avatar";
import { Corona } from "../Corona";
import { IconoDeshacer, IconoMas } from "../Iconos";
import { FoodIllustration } from "../ilustraciones/FoodIllustration";
import type { Comida, Participante } from "@/types";

interface Props {
  jugador: Participante;
  comida: Comida;
  /** Solo cuando la ronda es de comida libre. */
  comidas: Comida[] | null;
  unidades: number;
  puntos: number;
  posicion: number;
  lider: boolean;
  bloqueado: boolean;
  disparo: number;
  onSumar: (pid: string) => void;
  onDeshacer: (pid: string) => void;
  onComida: (pid: string, comidaId: string) => void;
}

export const TarjetaJugador = memo(function TarjetaJugador({
  jugador,
  comida,
  comidas,
  unidades,
  puntos,
  posicion,
  lider,
  bloqueado,
  disparo,
  onSumar,
  onDeshacer,
  onComida,
}: Props) {
  return (
    <li className="caja flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar avatar={jugador.avatar} className="h-12 w-12" />
          {lider && <Corona className="absolute -right-3 -top-4 h-7 w-7 -rotate-12" />}
        </div>
        <h3 className="min-w-0 flex-1 truncate font-display text-xl font-extrabold">{jugador.nombre}</h3>
        <span className="rounded-lg border-[3px] border-borde bg-acento px-2 py-0.5 font-display font-extrabold text-sobre-acento">
          #{posicion}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <FoodIllustration id={comida.id} comida={comida} disparo={disparo} className="h-20 w-20 shrink-0" />
        <div className="min-w-0 flex-1" aria-live="polite" aria-atomic="true">
          <p className="font-display text-4xl font-extrabold leading-none text-primario-texto">{puntos}</p>
          <p className="text-sm font-bold">
            puntos &middot; {unidades} {unidades === 1 ? "unidad" : "unidades"}
          </p>
          <p className="truncate text-sm text-tinta-suave">{comida.nombre}</p>
        </div>
      </div>

      {comidas && (
        <label className="flex flex-col gap-1 text-sm font-bold">
          <span className="sr-only">Comida de {jugador.nombre}</span>
          <select
            className="campo !min-h-11"
            value={comida.id}
            disabled={bloqueado}
            onChange={(e) => onComida(jugador.id, e.target.value)}
          >
            {comidas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.puntos} pts)
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="grid grid-cols-[auto_1fr] gap-3">
        <button
          type="button"
          className="btn"
          disabled={bloqueado || unidades === 0}
          onClick={() => onDeshacer(jugador.id)}
          aria-label={`Deshacer el último punto de ${jugador.nombre}`}
        >
          <IconoDeshacer className="h-6 w-6" />
        </button>
        <button
          type="button"
          className="btn btn-primario h-16 text-xl"
          disabled={bloqueado}
          onClick={() => onSumar(jugador.id)}
          aria-label={`Sumar uno para ${jugador.nombre}`}
        >
          <IconoMas className="h-7 w-7" />
          <span>1</span>
        </button>
      </div>
    </li>
  );
});
