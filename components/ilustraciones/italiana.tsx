import type { Dibujo } from "./tipos";

const RAD = Math.PI / 180;

function cuna(r: number, a0: number, a1: number): string {
  const p = (a: number) =>
    `${(100 + r * Math.cos(a * RAD)).toFixed(2)} ${(100 + r * Math.sin(a * RAD)).toFixed(2)}`;
  return `M100 100L${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}Z`;
}

const REBANADAS = 8;
const PASO = 360 / REBANADAS;

/* ---------- Pizza ---------- */
function PizzaDibujo() {
  return (
    <g>
      <circle cx="100" cy="100" r="94" className="t4 f-apoyo" />
      <g className="i-bal">
        {Array.from({ length: REBANADAS }, (_, i) => {
          const a0 = i * PASO - 90 - PASO / 2;
          const a1 = a0 + PASO;
          const medio = (a0 + a1) / 2;
          const px = 100 + 44 * Math.cos(medio * RAD);
          const py = 100 + 44 * Math.sin(medio * RAD);
          return (
            <g key={i} data-i={i}>
              <path d={cuna(82, a0, a1)} fill="#E2A44E" className="t4" />
              <path d={cuna(72, a0, a1)} fill="#D9432B" />
              <path d={cuna(66, a0 + 1, a1 - 1)} fill="#F7C94F" />
              <circle cx={px} cy={py} r="9" fill="#B8302A" className="t4" />
              <circle cx={px - 2} cy={py - 2} r="2.5" fill="#D94B3F" />
            </g>
          );
        })}
      </g>
    </g>
  );
}

/* ---------- Pasta ---------- */
const NIDO: [number, number, number][] = [
  [52, 25, -8],
  [40, 18, 6],
  [27, 11, -4],
];

function PastaDibujo() {
  return (
    <g>
      <ellipse cx="100" cy="122" rx="84" ry="44" className="t f-plato" />
      <ellipse cx="100" cy="122" rx="62" ry="30" className="t4 f-apoyo" />
      {NIDO.map(([rx, ry, rot]) => (
        <g key={rx} transform={`rotate(${rot} 100 114)`}>
          <ellipse cx="100" cy="114" rx={rx} ry={ry} fill="none" strokeWidth="13" style={{ stroke: "var(--tinta)" }} />
          <ellipse cx="100" cy="114" rx={rx} ry={ry} fill="none" strokeWidth="7" stroke="#F2CC6B" />
        </g>
      ))}
      <path d="M78 108Q100 90 124 108Q114 124 96 122Q80 120 78 108Z" fill="#D6402B" className="t4" />
      <path d="M94 100Q106 88 118 98Q106 110 94 100Z" fill="#4FA043" className="t4" />
      <g data-p="hebra">
        <path d="M100 112C90 92 112 84 100 64" fill="none" strokeWidth="12" strokeLinecap="round" style={{ stroke: "var(--tinta)" }} />
        <path d="M100 112C90 92 112 84 100 64" fill="none" strokeWidth="6" strokeLinecap="round" stroke="#F2CC6B" />
      </g>
      <g className="vb i-tenedor" style={{ transformOrigin: "100px 112px" }}>
        <g className="vb" data-p="tenedor" style={{ transformOrigin: "100px 112px" }}>
          <path d="M90 118V138M100 118V140M110 118V138" fill="none" strokeWidth="9" strokeLinecap="round" style={{ stroke: "var(--tinta)" }} />
          <path d="M90 118V138M100 118V140M110 118V138" fill="none" strokeWidth="3.5" strokeLinecap="round" stroke="#D5DCE3" />
          <rect x="96" y="24" width="8" height="84" rx="4" fill="#D5DCE3" className="t4" />
          <path d="M86 104H114V118Q114 128 100 128Q86 128 86 118Z" fill="#D5DCE3" className="t4" />
        </g>
      </g>
    </g>
  );
}

export const pizza: Dibujo = {
  Dibujo: PizzaDibujo,
  comer: (a, n) => {
    const i = n % REBANADAS;
    const medio = (i * PASO - 90) * RAD;
    const dx = Math.cos(medio) * 40;
    const dy = Math.sin(medio) * 40;
    a(
      `[data-i="${i}"]`,
      {
        x: [0, dx * 0.5, dx, 0, 0],
        y: [0, dy * 0.5 - 20, dy - 56, 0, 0],
        scale: [1, 1, 0.9, 0.6, 1],
        opacity: [1, 1, 0, 0, 1],
      },
      { duration: 1.2, times: [0, 0.28, 0.55, 0.7, 1], ease: "easeOut" },
    );
  },
};

export const pasta: Dibujo = {
  Dibujo: PastaDibujo,
  comer: (a) => {
    a("[data-p=tenedor]", { rotate: [0, 360] }, { duration: 0.9, ease: "easeInOut" });
    a("[data-p=hebra]", { y: [0, -16, 0], scaleY: [1, 1.2, 1] }, { duration: 0.9, ease: "easeInOut" });
  },
};
