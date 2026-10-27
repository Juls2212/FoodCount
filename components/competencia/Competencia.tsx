"use client";

import { useCallback, useState } from "react";
import { useComidas, useDatos } from "../AppProvider";
import { ConfigCompetencia } from "./ConfigCompetencia";
import { Cuenta } from "./Cuenta";
import { Juego } from "./Juego";
import { Resultados } from "./Resultados";
import { competenciaNueva } from "@/lib/competencia";
import type { ConfigCompetencia as TipoConfig } from "@/types";

/** Orquesta las fases: configuracion, cuenta regresiva, juego y resultados. */
export function Competencia() {
  const { datos, cargado, actualizar } = useDatos();
  const { comidas } = useComidas();
  const [cuenta, setCuenta] = useState<TipoConfig | null>(null);
  const [precargada, setPrecargada] = useState<TipoConfig | undefined>(undefined);
  const ca = datos.competenciaActiva;
  const primeraComida = comidas[0].id;

  const empezar = useCallback(
    (config: TipoConfig) => {
      actualizar((d) => ({
        ...d,
        competenciaActiva: competenciaNueva(config, primeraComida, Date.now()),
      }));
      setCuenta(null);
    },
    [actualizar, primeraComida],
  );

  // Hasta leer localStorage no se sabe si hay una ronda por restaurar.
  if (!cargado) return <div className="h-96" aria-hidden="true" />;

  if (cuenta) return <Cuenta onTerminar={() => empezar(cuenta)} />;

  if (!ca) {
    return (
      <ConfigCompetencia
        inicial={precargada}
        onComenzar={(config) => {
          setPrecargada(config);
          setCuenta(config);
        }}
      />
    );
  }

  if (ca.fase === "juego") return <Juego ca={ca} />;

  return (
    <Resultados
      ca={ca}
      onRevancha={(config) => {
        setPrecargada(config);
        setCuenta(config);
      }}
      onNueva={() => setPrecargada(undefined)}
    />
  );
}
