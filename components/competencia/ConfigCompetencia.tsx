"use client";

import { useState } from "react";
import { useComidas } from "../AppProvider";
import { Avatar } from "../Avatar";
import { IconoBasura, IconoMas } from "../Iconos";
import { FoodIllustration } from "../ilustraciones/FoodIllustration";
import {
  COLORES_AVATAR,
  configInicial,
  DURACIONES_MIN,
  FORMAS,
  MAX_PARTICIPANTES,
  MIN_PARTICIPANTES,
  participanteNuevo,
  PATRONES,
} from "@/lib/competencia";
import type { ConfigCompetencia, Participante } from "@/types";

interface Props {
  /** Configuracion precargada (por ejemplo, al repetir una ronda). */
  inicial?: ConfigCompetencia;
  onComenzar: (config: ConfigCompetencia) => void;
}

const chip = (activo: boolean) =>
  `btn !min-h-12 !px-4 ${activo ? "btn-primario" : ""}`;

export function ConfigCompetencia({ inicial, onComenzar }: Props) {
  const { comidas } = useComidas();
  const [config, setConfig] = useState<ConfigCompetencia>(inicial ?? configInicial);
  const { participantes, duracionMin, comidaUnica } = config;
  const comidaElegida = comidas.find((c) => c.id === comidaUnica) ?? comidas[0];

  const cambiarParticipante = (id: string, parcial: Partial<Participante>) =>
    setConfig((c) => ({
      ...c,
      participantes: c.participantes.map((p) => (p.id === id ? { ...p, ...parcial } : p)),
    }));

  const ciclar = (p: Participante, campo: "forma" | "color" | "patron") => {
    const modulo = { forma: FORMAS, color: COLORES_AVATAR.length, patron: PATRONES }[campo];
    cambiarParticipante(p.id, { avatar: { ...p.avatar, [campo]: (p.avatar[campo] + 1) % modulo } });
  };

  const agregar = () =>
    setConfig((c) =>
      c.participantes.length >= MAX_PARTICIPANTES
        ? c
        : { ...c, participantes: [...c.participantes, participanteNuevo(c.participantes.length)] },
    );

  const quitar = (id: string) =>
    setConfig((c) =>
      c.participantes.length <= MIN_PARTICIPANTES
        ? c
        : { ...c, participantes: c.participantes.filter((p) => p.id !== id) },
    );

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        onComenzar(config);
      }}
    >
      <h1 className="text-3xl font-extrabold text-tinta-fondo">Competencia</h1>

      <section aria-labelledby="titulo-part" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="titulo-part" className="text-xl font-extrabold text-tinta-fondo">
            Participantes ({participantes.length} de {MAX_PARTICIPANTES})
          </h2>
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {participantes.map((p, i) => (
            <li key={p.id} className="caja flex flex-col gap-3 p-3">
              <div className="flex items-center gap-3">
                <Avatar avatar={p.avatar} className="h-14 w-14" />
                <label className="flex-1">
                  <span className="sr-only">Nombre del participante {i + 1}</span>
                  <input
                    className="campo"
                    value={p.nombre}
                    maxLength={16}
                    placeholder={`Jugador ${i + 1}`}
                    onChange={(e) => cambiarParticipante(p.id, { nombre: e.target.value })}
                  />
                </label>
                <button
                  type="button"
                  className="btn !min-w-12 !px-3"
                  onClick={() => quitar(p.id)}
                  disabled={participantes.length <= MIN_PARTICIPANTES}
                  aria-label={`Quitar a ${p.nombre || `Jugador ${i + 1}`}`}
                >
                  <IconoBasura className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label={`Avatar de ${p.nombre || `Jugador ${i + 1}`}`}>
                {(["forma", "color", "patron"] as const).map((campo) => (
                  <button
                    key={campo}
                    type="button"
                    className="btn !min-h-11 flex-1 !px-3 !text-base"
                    onClick={() => ciclar(p, campo)}
                  >
                    {campo === "forma" ? "Forma" : campo === "color" ? "Color" : "Trama"}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn"
          onClick={agregar}
          disabled={participantes.length >= MAX_PARTICIPANTES}
        >
          <IconoMas className="h-5 w-5" />
          Agregar participante
        </button>
      </section>

      <section aria-labelledby="titulo-dur" className="caja flex flex-col gap-3 p-4">
        <h2 id="titulo-dur" className="text-xl font-extrabold">
          Duración de la ronda
        </h2>
        <div role="radiogroup" aria-labelledby="titulo-dur" className="flex flex-wrap gap-2">
          {DURACIONES_MIN.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={duracionMin === m}
              className={chip(duracionMin === m)}
              onClick={() => setConfig((c) => ({ ...c, duracionMin: m }))}
            >
              {m} min
            </button>
          ))}
          <button
            type="button"
            role="radio"
            aria-checked={duracionMin === null}
            className={chip(duracionMin === null)}
            onClick={() => setConfig((c) => ({ ...c, duracionMin: null }))}
          >
            Libre
          </button>
        </div>
      </section>

      <section aria-labelledby="titulo-comida" className="caja flex flex-col gap-3 p-4">
        <h2 id="titulo-comida" className="text-xl font-extrabold">
          Comida de la ronda
        </h2>
        <div role="radiogroup" aria-labelledby="titulo-comida" className="flex flex-wrap gap-2">
          <button
            type="button"
            role="radio"
            aria-checked={comidaUnica !== null}
            className={chip(comidaUnica !== null)}
            onClick={() => setConfig((c) => ({ ...c, comidaUnica: comidaElegida.id }))}
          >
            Una para todos
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={comidaUnica === null}
            className={chip(comidaUnica === null)}
            onClick={() => setConfig((c) => ({ ...c, comidaUnica: null }))}
          >
            Libre por participante
          </button>
        </div>
        {comidaUnica !== null ? (
          <div className="flex items-center gap-4">
            <FoodIllustration id={comidaElegida.id} comida={comidaElegida} className="h-24 w-24 shrink-0" />
            <label className="flex flex-1 flex-col gap-1.5 font-bold">
              Comida
              <select
                className="campo"
                value={comidaElegida.id}
                onChange={(e) => setConfig((c) => ({ ...c, comidaUnica: e.target.value }))}
              >
                {comidas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.puntos} pts)
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <p className="text-tinta-suave">
            Cada participante elegirá su comida desde su tarjeta durante la ronda.
          </p>
        )}
      </section>

      <button type="submit" className="btn btn-primario h-20 text-2xl">
        Comenzar
      </button>
    </form>
  );
}
