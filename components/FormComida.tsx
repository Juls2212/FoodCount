"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "./AppProvider";
import { IconoBasura } from "./Iconos";
import { MarcadorComida } from "./MarcadorComida";
import { catalogo, categoriaPorId } from "@/lib/comidas";
import { derivarPaleta, rellenoAccesible } from "@/lib/theme";
import type { Comida } from "@/types";

export function FormComida() {
  const router = useRouter();
  const { datos, actualizar, actualizarYEvaluar, seleccionarComida } = useApp();
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState(catalogo.categorias[0].id);
  const [color, setColor] = useState(catalogo.coloresPersonalizados[0].hex);
  const [puntos, setPuntos] = useState(3);
  const [error, setError] = useState("");

  const vista: Comida = {
    id: "vista",
    nombre: nombre.trim() || "Nueva",
    categoria,
    unidad: { singular: "porción", plural: "porciones" },
    puntos,
    paleta: derivarPaleta(color),
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = nombre.trim();
    if (limpio.length < 2) {
      setError("Escribe un nombre de al menos 2 letras.");
      return;
    }
    const existe = [...catalogo.comidas, ...datos.comidasPersonalizadas].some(
      (c) => c.nombre.toLowerCase() === limpio.toLowerCase(),
    );
    if (existe) {
      setError("Ya existe una comida con ese nombre.");
      return;
    }
    const nueva: Comida = {
      ...vista,
      id: `personalizada-${Date.now().toString(36)}`,
      nombre: limpio,
      personalizada: true,
    };
    actualizarYEvaluar((d) => ({
      ...d,
      comidasPersonalizadas: [...d.comidasPersonalizadas, nueva],
    }));
    seleccionarComida(nueva.id);
    router.push("/");
  };

  const borrar = (id: string) =>
    actualizar((d) => ({
      ...d,
      comidasPersonalizadas: d.comidasPersonalizadas.filter((c) => c.id !== id),
      ajustes:
        d.ajustes.comidaActiva === id
          ? { ...d.ajustes, comidaActiva: null }
          : d.ajustes,
    }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-tinta-fondo">Nueva comida</h1>

      <form onSubmit={guardar} className="caja flex flex-col gap-5 p-5" noValidate>
        <div className="flex items-center gap-4">
          <MarcadorComida comida={vista} />
          <p className="font-display text-xl font-extrabold">{vista.nombre}</p>
        </div>

        <label className="flex flex-col gap-1.5 font-bold">
          Nombre
          <input
            className="campo"
            value={nombre}
            maxLength={24}
            onChange={(e) => {
              setNombre(e.target.value);
              setError("");
            }}
            placeholder="Por ejemplo, Arepas"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "error-form" : undefined}
          />
        </label>

        <label className="flex flex-col gap-1.5 font-bold">
          Categoría
          <select
            className="campo"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {catalogo.categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 font-bold">Color</legend>
          <div role="radiogroup" aria-label="Color de la comida" className="grid grid-cols-6 gap-2">
            {catalogo.coloresPersonalizados.map((c) => {
              const elegido = c.hex === color;
              return (
                <button
                  key={c.hex}
                  type="button"
                  role="radio"
                  aria-checked={elegido}
                  aria-label={c.nombre}
                  onClick={() => setColor(c.hex)}
                  className="aspect-square min-h-11 cursor-pointer rounded-xl border-[3px] border-borde"
                  style={{
                    backgroundColor: rellenoAccesible(c.hex).relleno,
                    boxShadow: elegido ? "3px 3px 0 var(--sombra)" : "none",
                    transform: elegido ? "translate(-2px, -2px) scale(1.05)" : "none",
                    transition: "transform 150ms ease",
                  }}
                />
              );
            })}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1.5 font-bold">
          Puntos por unidad
          <input
            className="campo"
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            value={puntos}
            onChange={(e) =>
              setPuntos(Math.min(50, Math.max(1, Math.round(Number(e.target.value) || 1))))
            }
          />
        </label>

        <p id="error-form" role="alert" className="min-h-6 font-bold text-peligro">
          {error}
        </p>

        <button type="submit" className="btn btn-primario">
          Guardar comida
        </button>
      </form>

      {datos.comidasPersonalizadas.length > 0 && (
        <section aria-labelledby="titulo-mias" className="flex flex-col gap-3">
          <h2 id="titulo-mias" className="text-xl font-extrabold text-tinta-fondo">
            Mis comidas
          </h2>
          <ul className="flex flex-col gap-3">
            {datos.comidasPersonalizadas.map((c) => (
              <li key={c.id} className="caja flex items-center gap-3 p-3">
                <MarcadorComida comida={c} className="h-12 w-12 text-xl" />
                <div className="flex-1">
                  <p className="font-display font-extrabold">{c.nombre}</p>
                  <p className="text-sm text-tinta-suave">
                    {categoriaPorId(c.categoria)?.nombre} - {c.puntos} puntos
                  </p>
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => borrar(c.id)}
                  aria-label={`Eliminar ${c.nombre}`}
                >
                  <IconoBasura className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
