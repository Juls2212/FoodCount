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

/* ---------- Sushi ---------- */
function SushiDibujo() {
  return (
    <g>
      <rect x="16" y="120" width="168" height="48" rx="10" fill="#C9955B" className="t" />
      <path d="M30 138h140M30 152h140" stroke="#A8763F" strokeWidth="4" strokeLinecap="round" fill="none" />
      <g data-p="wasabi">
        <ellipse cx="100" cy="146" rx="12" ry="8" fill="#8DC63F" className="t4" />
        <ellipse cx="97" cy="143" rx="4" ry="2.5" fill="#B9E070" />
      </g>
      <g className="i-bal">
        <g data-p="pieza">
          <rect x="34" y="96" width="70" height="36" rx="14" fill="#F8F3E6" className="t" />
          <path d="M28 98Q34 68 69 68Q104 68 110 98Q69 110 28 98Z" fill="#FF8566" className="t" />
          <path d="M46 80Q54 90 48 99M66 76Q74 88 68 101M86 79Q94 88 90 98" stroke="#FFB59F" strokeWidth="4" strokeLinecap="round" fill="none" />
          <rect x="62" y="70" width="14" height="64" rx="3" fill="#2B3A34" className="t4" />
        </g>
      </g>
      <g className="i-bal" style={{ animationDelay: "-1.4s" }}>
        <g data-p="maki">
          <circle cx="146" cy="102" r="28" fill="#2B3A34" className="t" />
          <circle cx="146" cy="102" r="19" fill="#F8F3E6" />
          <circle cx="146" cy="102" r="9" fill="#FF8566" />
          <circle cx="143" cy="99" r="3" fill="#FFB59F" />
        </g>
      </g>
    </g>
  );
}

/* ---------- Gyozas ---------- */
function Gyoza({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <g data-p="gyoza">
        <path d="M-32 6Q0 22 32 6L28 14Q0 30 -28 14Z" fill="#D9A441" className="t4" />
        <path d="M-36 4Q0 -50 36 4Q0 16 -36 4Z" fill="#F6E3B8" className="t" />
        <path d="M-22 -10L-17 0M-9 -19L-7 -4M6 -19L4 -4M19 -10L14 0" stroke="#C9A05A" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
}

function GyozasDibujo() {
  return (
    <g>
      <Plato cy={138} rx={86} ry={34} />
      <Gyoza x={100} y={112} r={0} />
      <Gyoza x={58} y={134} r={-8} />
      <Gyoza x={142} y={134} r={8} />
      {[68, 100, 132].map((x, i) => (
        <g key={x} className="i-vapor" style={{ animationDelay: `${-i * 0.9}s` }}>
          <rect x={x - 7} y="52" width="14" height="28" rx="7" className="vapor" />
        </g>
      ))}
    </g>
  );
}

/* ---------- Ramen ---------- */
const HEBRAS = [
  "M70 94C62 80 82 72 74 56",
  "M92 94C84 78 104 70 96 52",
  "M114 94C106 80 126 70 118 58",
];

function RamenDibujo() {
  return (
    <g>
      <path d="M26 96H174Q172 156 100 160Q28 156 26 96Z" className="t f-plato" />
      <path d="M28 114Q100 132 172 114" fill="none" strokeWidth="8" strokeLinecap="round" style={{ stroke: "var(--primario)" }} />
      <ellipse cx="100" cy="96" rx="74" ry="16" fill="#D88A2D" className="t" />
      <g className="i-ola">
        <g data-p="fideos">
          {HEBRAS.map((d) => (
            <g key={d}>
              <path d={d} fill="none" strokeWidth="12" strokeLinecap="round" style={{ stroke: "var(--tinta)" }} />
              <path d={d} fill="none" strokeWidth="6" strokeLinecap="round" stroke="#F6D56E" />
            </g>
          ))}
        </g>
      </g>
      <ellipse cx="138" cy="94" rx="17" ry="12" fill="#FFFFFF" className="t4" />
      <circle cx="138" cy="94" r="6" fill="#F2A71B" />
      <path d="M152 100L158 72L170 75L164 103Z" fill="#2B3A34" className="t4" />
      {[60, 84, 110, 122].map((x, i) => (
        <circle key={x} cx={x} cy={98 + (i % 2) * 3} r="4" fill="#7FBF3A" />
      ))}
      {[84, 118].map((x, i) => (
        <g key={x} className="i-vapor" style={{ animationDelay: `${-i * 1.3}s` }}>
          <rect x={x - 7} y="30" width="14" height="24" rx="7" className="vapor" />
        </g>
      ))}
    </g>
  );
}

export const sushi: Dibujo = {
  Dibujo: SushiDibujo,
  comer: (a) => {
    a("[data-p=pieza]", { y: [0, -34, 0], rotate: [0, -7, 0] }, { duration: 0.5, ease: "easeOut" });
    a("[data-p=maki]", { y: [0, -14, 0] }, { duration: 0.45, delay: 0.1, ease: "easeOut" });
    a("[data-p=wasabi]", { scale: [1, 1.7, 1] }, { duration: 0.45 });
  },
};

export const gyozas: Dibujo = {
  Dibujo: GyozasDibujo,
  comer: (a) => {
    a("[data-p=gyoza]", { scale: [1, 1.22, 0.95, 1] }, { duration: 0.55, delay: stagger(0.06) });
  },
};

export const ramen: Dibujo = {
  Dibujo: RamenDibujo,
  comer: (a) => {
    a("[data-p=fideos]", { scaleY: [1, 1.45, 1], y: [0, -4, 0] }, { duration: 0.6, ease: "easeInOut" });
  },
};
