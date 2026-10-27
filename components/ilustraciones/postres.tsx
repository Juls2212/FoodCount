import { rellenoAccesible } from "@/lib/theme";
import type { Dibujo, PropsDibujo } from "./tipos";

const RAD = Math.PI / 180;

/* ---------- Donas ---------- */
function glaseado(): string {
  const lobulos = 10;
  const pts: string[] = [];
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * 360;
    const r = 62 + 5 * Math.sin(a * RAD * lobulos);
    pts.push(`${(100 + r * Math.cos(a * RAD)).toFixed(1)} ${(100 + r * Math.sin(a * RAD)).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

const CHISPAS = ["#FFFFFF", "#F2C230", "#2FA6D6", "#7FBF3A", "#8A6BD1"];

function DonasDibujo() {
  const onda = glaseado();
  return (
    <g>
      <g className="i-giro">
        <g data-p="dona">
          <circle cx="100" cy="100" r="80" fill="#DDA05A" className="t" />
          <path d={onda} fill="#EC6FA5" className="t4" />
          <path d="M60 78Q78 56 104 52" fill="none" stroke="#F7A3C6" strokeWidth="6" strokeLinecap="round" />
          <circle cx="100" cy="100" r="25" className="t f-apoyo" />
          {Array.from({ length: 14 }, (_, i) => {
            const a = i * (360 / 14) + 8;
            const r = i % 2 === 0 ? 40 : 52;
            const x = 100 + r * Math.cos(a * RAD);
            const y = 100 + r * Math.sin(a * RAD);
            const chispa = (
              <rect
                x={x - 6}
                y={y - 2.5}
                width="12"
                height="5"
                rx="2.5"
                fill={CHISPAS[i % CHISPAS.length]}
                transform={`rotate(${(i * 47) % 180} ${x} ${y})`}
              />
            );
            // El titileo va en un grupo aparte: transform-origin de CSS desplazaria el atributo transform.
            return i % 3 === 0 ? (
              <g key={i} className="i-titila" style={{ animationDelay: `${-i * 0.22}s` }}>
                {chispa}
              </g>
            ) : (
              <g key={i}>{chispa}</g>
            );
          })}
        </g>
      </g>
    </g>
  );
}

/* ---------- Helado ---------- */
const izq = (y: number) => 64 + ((y - 100) * 36) / 84;
const der = (y: number) => 136 - ((y - 100) * 36) / 84;

const BOLA = "M66 92Q66 56 100 56Q134 56 134 92Q128 104 120 94Q112 106 104 96Q96 108 88 96Q80 106 72 94Q68 98 66 92Z";

function HeladoDibujo() {
  return (
    <g>
      <path d="M64 100L100 186L136 100Z" fill="#E2A650" className="t" />
      {[116, 134, 152].map((y) => (
        <g key={y} stroke="#B9812E" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d={`M${izq(y)} ${y}L${der(y + 16)} ${y + 16}`} />
          <path d={`M${der(y)} ${y}L${izq(y + 16)} ${y + 16}`} />
        </g>
      ))}
      <g data-p="bola1" className="origin-bottom">
        <path d={BOLA} transform="translate(0 6)" fill="#F9B3CE" className="t" />
      </g>
      <g transform="translate(2 -34)">
        <g data-p="bola2" className="origin-bottom">
          <path d={BOLA} fill="#8EDFE6" className="t" />
          <ellipse cx="86" cy="72" rx="8" ry="5" fill="#C9F3F6" />
        </g>
      </g>
      {[[84, 116, 0], [118, 124, 1.1], [100, 134, 1.8]].map(([x, y, d]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <g className="i-gota" style={{ animationDelay: `${-d}s` }}>
            <path d="M0 -9Q8 2 0 8Q-8 2 0 -9Z" fill="#F9B3CE" className="t4" />
          </g>
        </g>
      ))}
    </g>
  );
}

/* ---------- Personalizada ---------- */
function GenericoDibujo({ comida }: PropsDibujo) {
  const base = comida?.paleta.primario ?? "#5E6B7A";
  const { relleno, sobre } = rellenoAccesible(base);
  return (
    <g>
      <g className="i-flota">
        <circle cx="100" cy="100" r="82" className="t f-plato" />
        <circle cx="100" cy="100" r="62" fill={relleno} className="t4" />
        <g data-p="letra">
          <text
            x="100"
            y="100"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="84"
            fontWeight="800"
            fill={sobre}
            style={{ fontFamily: "var(--font-display)" }}
          >
            {(comida?.nombre ?? "?").charAt(0).toUpperCase()}
          </text>
        </g>
      </g>
    </g>
  );
}

export const donas: Dibujo = {
  Dibujo: DonasDibujo,
  comer: (a) => {
    a("[data-p=dona]", { rotate: [0, 360], scale: [1, 1.08, 1] }, { duration: 0.8, ease: "easeInOut" });
  },
};

export const helado: Dibujo = {
  Dibujo: HeladoDibujo,
  comer: async (a) => {
    a("[data-p=bola2]", { y: [0, -16, 0] }, { duration: 0.5, ease: "easeOut" });
    await a("[data-p=bola1]", { scaleY: 0.68, scaleX: 1.16 }, { duration: 0.09 });
    a("[data-p=bola1]", { scaleY: 1, scaleX: 1 }, { type: "spring", stiffness: 420, damping: 8 });
  },
};

export const generico: Dibujo = {
  Dibujo: GenericoDibujo,
  comer: (a) => {
    a("[data-p=letra]", { y: [0, -18, 0], scale: [1, 1.15, 1] }, { duration: 0.45, ease: "easeOut" });
  },
};
