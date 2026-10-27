"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export const MAX_PARTICULAS = 24;

export interface OpcionesEmision {
  cantidad: number;
  colores: string[];
  /** Multiplicador de velocidad (los hitos salen mas fuerte). */
  fuerza?: number;
  /** Solo rectangulos planos. */
  confeti?: boolean;
}

export interface ApiParticulas {
  emitir: (opciones: OpcionesEmision) => void;
}

type Forma = { radio?: string; clip?: string; ancho: number; alto: number };

const FORMAS: Forma[] = [
  { radio: "50%", ancho: 11, alto: 11 },
  { ancho: 10, alto: 10 },
  { clip: "polygon(50% 0, 100% 100%, 0 100%)", ancho: 13, alto: 12 },
  { clip: "polygon(10% 25%, 60% 0, 100% 40%, 80% 100%, 20% 90%)", ancho: 8, alto: 8 },
];
const CONFETI: Forma = { ancho: 12, alto: 6 };
const GRAVEDAD = 1100;
const PASOS = 10;

/** Piscina fija de 24 elementos animados con la Web Animations API (transform y opacity). */
export const Particulas = forwardRef<ApiParticulas>(function Particulas(_, ref) {
  const nodos = useRef<(HTMLSpanElement | null)[]>([]);
  const ocupado = useRef<boolean[]>(Array.from({ length: MAX_PARTICULAS }, () => false));
  const reducido = useReducedMotion();

  useImperativeHandle(
    ref,
    () => ({
      emitir({ cantidad, colores, fuerza = 1, confeti = false }) {
        if (reducido || colores.length === 0) return;
        let emitidas = 0;
        for (let i = 0; i < MAX_PARTICULAS && emitidas < cantidad; i++) {
          const el = nodos.current[i];
          if (!el || ocupado.current[i]) continue;
          ocupado.current[i] = true;
          emitidas++;

          const forma = confeti ? CONFETI : FORMAS[Math.floor(Math.random() * FORMAS.length)];
          el.style.width = `${forma.ancho}px`;
          el.style.height = `${forma.alto}px`;
          el.style.marginLeft = `${-forma.ancho / 2}px`;
          el.style.marginTop = `${-forma.alto / 2}px`;
          el.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
          el.style.borderRadius = forma.radio ?? "0";
          el.style.clipPath = forma.clip ?? "none";

          const angulo = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
          const velocidad = (260 + Math.random() * 260) * fuerza;
          const vx = Math.cos(angulo) * velocidad;
          const vy = Math.sin(angulo) * velocidad;
          const duracion = 0.8 + Math.random() * 0.4;
          const giro = (Math.random() - 0.5) * 900;

          const cuadros: Keyframe[] = Array.from({ length: PASOS + 1 }, (_, k) => {
            const p = k / PASOS;
            const t = p * duracion;
            const x = vx * t;
            const y = vy * t + 0.5 * GRAVEDAD * t * t;
            return {
              transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(giro * t).toFixed(0)}deg)`,
              opacity: p < 0.55 ? 1 : Math.max(0, 1 - (p - 0.55) / 0.45),
            };
          });

          const anim = el.animate(cuadros, {
            duration: duracion * 1000,
            easing: "linear",
            fill: "forwards",
          });
          anim.onfinish = () => {
            anim.cancel();
            ocupado.current[i] = false;
          };
        }
      },
    }),
    [reducido],
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      {Array.from({ length: MAX_PARTICULAS }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            nodos.current[i] = el;
          }}
          className="absolute left-1/2 top-1/2 block opacity-0"
          style={{ willChange: "transform, opacity" }}
        />
      ))}
    </div>
  );
});
