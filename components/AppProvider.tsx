"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";
import type { Comida, DatosApp, Modo, Pantalla } from "@/types";
import { catalogo } from "@/lib/comidas";
import {
  CLAVE_CACHE_TEMA,
  datosPorDefecto,
  escribirDatos,
  leerDatos,
} from "@/lib/storage";
import { evaluarLogros } from "@/lib/logros";
import { calcularTema } from "@/lib/theme";

interface ValorDatos {
  datos: DatosApp;
  cargado: boolean;
  actualizar: (fn: (d: DatosApp) => DatosApp) => void;
  /** Como actualizar, pero ademas desbloquea logros y avisa de los nuevos. */
  actualizarYEvaluar: (fn: (d: DatosApp) => DatosApp) => void;
  recargar: () => void;
}

interface ValorComida {
  comidas: Comida[];
  comida: Comida;
  seleccionarComida: (id: string) => void;
}

interface ValorTema {
  modo: Modo;
  pantalla: Pantalla;
  alternarModo: () => void;
}

const CtxDatos = createContext<ValorDatos | null>(null);
const CtxComida = createContext<ValorComida | null>(null);
const CtxTema = createContext<ValorTema | null>(null);
const CtxAvisos = createContext<{ avisos: string[]; cerrarAviso: () => void } | null>(null);

function requerir<T>(valor: T | null): T {
  if (!valor) throw new Error("El hook debe usarse dentro de AppProvider");
  return valor;
}

/** Contextos separados: sumar solo re-renderiza a quien lee los datos. */
export const useDatos = () => requerir(useContext(CtxDatos));
export const useComidas = () => requerir(useContext(CtxComida));
export const useTema = () => requerir(useContext(CtxTema));
export const useAvisos = () => requerir(useContext(CtxAvisos));

export function useApp() {
  return { ...useDatos(), ...useComidas(), ...useTema() };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [datos, setDatos] = useState<DatosApp>(datosPorDefecto);
  const [cargado, setCargado] = useState(false);
  const [sistemaOscuro, setSistemaOscuro] = useState(false);
  const [avisos, setAvisos] = useState<string[]>([]);
  const datosRef = useRef(datos);
  const pathname = usePathname();

  const pantalla: Pantalla = pathname.startsWith("/competencia")
    ? "competencia"
    : "contador";

  // localStorage solo existe en el cliente: se lee tras montar para que el primer
  // render coincida con el HTML del servidor y no haya errores de hidratacion.
  useEffect(() => {
    const leidos = leerDatos();
    datosRef.current = leidos;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDatos(leidos);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSistemaOscuro(mq.matches);
    setCargado(true);
    const alCambiar = (e: MediaQueryListEvent) => setSistemaOscuro(e.matches);
    mq.addEventListener("change", alCambiar);
    return () => mq.removeEventListener("change", alCambiar);
  }, []);

  const actualizar = useCallback((fn: (d: DatosApp) => DatosApp) => {
    const siguiente = fn(datosRef.current);
    datosRef.current = siguiente;
    setDatos(siguiente);
    escribirDatos(siguiente);
  }, []);

  const actualizarYEvaluar = useCallback((fn: (d: DatosApp) => DatosApp) => {
    const siguiente = fn(datosRef.current);
    const { logros, nuevos } = evaluarLogros(siguiente, Date.now());
    const final = nuevos.length > 0 ? { ...siguiente, logros } : siguiente;
    datosRef.current = final;
    setDatos(final);
    escribirDatos(final);
    if (nuevos.length > 0) setAvisos((a) => [...a, ...nuevos]);
  }, []);

  const cerrarAviso = useCallback(() => setAvisos((a) => a.slice(1)), []);

  const recargar = useCallback(() => {
    const leidos = leerDatos();
    datosRef.current = leidos;
    setDatos(leidos);
  }, []);

  const comidas = useMemo(
    () => [...catalogo.comidas, ...datos.comidasPersonalizadas],
    [datos.comidasPersonalizadas],
  );

  const comida = useMemo(
    () =>
      comidas.find((c) => c.id === datos.ajustes.comidaActiva) ?? comidas[0],
    [comidas, datos.ajustes.comidaActiva],
  );

  const modo: Modo =
    datos.ajustes.modo ?? (sistemaOscuro ? "oscuro" : "claro");

  const seleccionarComida = useCallback(
    (id: string) =>
      actualizar((d) => ({ ...d, ajustes: { ...d.ajustes, comidaActiva: id } })),
    [actualizar],
  );

  const alternarModo = useCallback(
    () =>
      actualizar((d) => {
        const actual: Modo =
          d.ajustes.modo ??
          (window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "oscuro"
            : "claro");
        return {
          ...d,
          ajustes: { ...d.ajustes, modo: actual === "oscuro" ? "claro" : "oscuro" },
        };
      }),
    [actualizar],
  );

  // Aplica los tokens al documento. Espera a la lectura de localStorage para
  // no pisar lo que fijo el script inline antes de pintar.
  useEffect(() => {
    if (!cargado) return;
    const raiz = document.documentElement;
    const tokens = calcularTema({ paleta: comida.paleta, modo, pantalla });
    raiz.setAttribute("data-theme", modo);
    raiz.setAttribute("data-pantalla", pantalla);
    for (const [nombre, valor] of Object.entries(tokens)) {
      raiz.style.setProperty(`--${nombre}`, valor);
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", tokens.fondo);
    try {
      window.localStorage.setItem(
        CLAVE_CACHE_TEMA,
        JSON.stringify({ modo, pantalla, vars: tokens }),
      );
    } catch {
      // La cache solo evita el parpadeo inicial; no es critica.
    }
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => raiz.classList.remove("sin-transicion")),
    );
    return () => cancelAnimationFrame(id);
  }, [cargado, comida, modo, pantalla]);

  const valorDatos = useMemo(
    () => ({ datos, cargado, actualizar, actualizarYEvaluar, recargar }),
    [datos, cargado, actualizar, actualizarYEvaluar, recargar],
  );
  const valorComida = useMemo(
    () => ({ comidas, comida, seleccionarComida }),
    [comidas, comida, seleccionarComida],
  );
  const valorAvisos = useMemo(() => ({ avisos, cerrarAviso }), [avisos, cerrarAviso]);
  const valorTema = useMemo(
    () => ({ modo, pantalla, alternarModo }),
    [modo, pantalla, alternarModo],
  );

  return (
    <CtxDatos.Provider value={valorDatos}>
      <CtxComida.Provider value={valorComida}>
        <CtxTema.Provider value={valorTema}>
          <CtxAvisos.Provider value={valorAvisos}>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
          </CtxAvisos.Provider>
        </CtxTema.Provider>
      </CtxComida.Provider>
    </CtxDatos.Provider>
  );
}
