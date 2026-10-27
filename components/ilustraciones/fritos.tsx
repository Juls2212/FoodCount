import { stagger } from "framer-motion";
import type { Dibujo } from "./tipos";

function Plato({ cy = 150, rx = 82, ry = 26 }: { cy?: number; rx?: number; ry?: number }) {
  return (
    <>
      <ellipse cx="100" cy={cy} rx={rx} ry={ry} className="t f-plato" />
      <ellipse cx="100" cy={cy} rx={rx * 0.72} ry={ry * 0.62} className="t4 f-apoyo" />
    </>
  );
}

/* ---------- Alitas ---------- */
function AlitasDibujo() {
  return (
    <g>
      <Plato cy={152} />
      <g className="i-bal">
        <g data-p="alita">
          <path d="M112 100L160 56" fill="none" strokeWidth="22" strokeLinecap="round" style={{ stroke: "var(--tinta)" }} />
          <path d="M112 100L160 56" fill="none" strokeWidth="11" strokeLinecap="round" stroke="#F6EBD6" />
          <circle cx="164" cy="50" r="10" fill="#F6EBD6" className="t4" />
          <circle cx="172" cy="62" r="10" fill="#F6EBD6" className="t4" />
          <path d="M38 122Q32 84 72 74Q114 66 128 98Q138 126 98 140Q54 148 38 122Z" fill="#D7822B" className="t" />
          <path d="M52 114Q50 92 74 88Q100 84 112 102Q100 106 88 102Q74 98 70 114Q62 126 52 114Z" fill="#B5481E" />
          <ellipse cx="90" cy="118" rx="10" ry="6" fill="#F0A85E" />
        </g>
      </g>
      {[60, 84, 106].map((x, i) => (
        <circle key={x} data-p="gota" cx={x} cy={128 + (i % 2) * 6} r="6" fill="#B5481E" className="t4" opacity="0" />
      ))}
    </g>
  );
}

/* ---------- Empanadas ---------- */
function EmpanadasDibujo() {
  return (
    <g>
      <Plato cy={142} />
      <g className="i-respira">
        <g data-p="empanada">
          <path d="M24 122Q100 24 176 122Q100 152 24 122Z" fill="#E2A73B" className="t" />
          <path d="M44 112Q100 52 156 112" fill="none" stroke="#F3C766" strokeWidth="7" strokeLinecap="round" />
          <path d="M24 122Q100 152 176 122" fill="none" strokeWidth="14" strokeLinecap="round" strokeDasharray="1 14" style={{ stroke: "var(--tinta)" }} />
          <path d="M26 123Q100 152 174 123" fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray="1 14" stroke="#C98A25" />
          <path d="M28 120Q100 148 172 120" fill="none" strokeWidth="5" strokeLinecap="round" stroke="#C98A25" />
        </g>
      </g>
    </g>
  );
}

/* ---------- Nuggets ---------- */
function Nugget({ x, y, r, sel }: { x: number; y: number; r: number; sel?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <g className="i-flota" style={{ animationDelay: `${-(x % 5) * 0.4}s` }}>
        <g data-p={sel ? "nugget-sel" : "nugget"}>
          <path d="M-28 -2Q-32 -24 -6 -26Q22 -28 30 -6Q34 20 2 24Q-26 24 -28 -2Z" fill="#D69A3A" className="t" />
          {[[-10, -10], [10, -12], [14, 8], [-14, 8], [0, 0]].map(([dx, dy]) => (
            <circle key={`${dx}${dy}`} cx={dx} cy={dy} r="3" fill="#B97A22" />
          ))}
        </g>
      </g>
    </g>
  );
}

function NuggetsDibujo() {
  return (
    <g>
      <Plato cy={146} rx={88} ry={32} />
      <path d="M128 84H174L168 142H134Z" className="t f-plato" />
      <ellipse cx="151" cy="84" rx="23" ry="7" fill="#D6382E" className="t4" />
      <Nugget x={48} y={126} r={-12} />
      <Nugget x={94} y={142} r={6} />
      <Nugget x={80} y={102} r={14} sel />
    </g>
  );
}

export const alitas: Dibujo = {
  Dibujo: AlitasDibujo,
  comer: (a) => {
    a("[data-p=alita]", { x: [0, -6, 6, -5, 4, 0], rotate: [0, -4, 4, -3, 2, 0] }, { duration: 0.45 });
    a(
      "[data-p=gota]",
      { y: [0, 14, 34], opacity: [0, 1, 0] },
      { duration: 0.7, delay: stagger(0.08, { startDelay: 0.1 }) },
    );
  },
};

export const empanadas: Dibujo = {
  Dibujo: EmpanadasDibujo,
  comer: async (a) => {
    await a("[data-p=empanada]", { scaleX: 1.14, scaleY: 0.82 }, { duration: 0.08 });
    await a("[data-p=empanada]", { y: -44, scaleX: 0.9, scaleY: 1.14 }, { duration: 0.16, ease: "easeOut" });
    await a("[data-p=empanada]", { y: 0, scaleX: 1.16, scaleY: 0.84 }, { duration: 0.16, ease: "easeIn" });
    a("[data-p=empanada]", { scaleX: 1, scaleY: 1 }, { type: "spring", stiffness: 400, damping: 9 });
  },
};

export const nuggets: Dibujo = {
  Dibujo: NuggetsDibujo,
  comer: (a) => {
    a(
      "[data-p=nugget-sel]",
      { x: [0, 28, 52, 70, 0], y: [0, -34, -30, 0, 0], rotate: [0, 80, 160, 200, 0] },
      { duration: 0.8, times: [0, 0.25, 0.5, 0.7, 1], ease: "easeInOut" },
    );
  },
};
