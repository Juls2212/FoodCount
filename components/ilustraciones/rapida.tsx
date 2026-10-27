import type { Dibujo } from "./tipos";

/* ---------- Hamburguesa ---------- */
// Cada capa se dibuja ya apilada; el desfase la separa (arriba mas lejos).
const SEPARACION = 8;
const CAPAS = 6;

function Capa({ i, children }: { i: number; children: React.ReactNode }) {
  const desfase = -(CAPAS - 1 - i) * SEPARACION;
  return (
    <g transform={`translate(0 ${desfase})`}>
      <g className="i-flota" style={{ animationDelay: `${-i * 0.35}s` }}>
        <g data-capa={i}>{children}</g>
      </g>
    </g>
  );
}

function HamburguesaDibujo() {
  return (
    <g>
      <ellipse cx="100" cy="172" rx="62" ry="9" className="t4 f-apoyo" />
      <Capa i={5}>
        <path d="M36 146H164Q164 164 146 164H54Q36 164 36 146Z" fill="#D9953F" className="t" />
      </Capa>
      <Capa i={4}>
        <rect x="38" y="134" width="124" height="12" rx="6" fill="#E0453A" className="t4" />
        <circle cx="70" cy="140" r="2.5" fill="#F7A199" />
        <circle cx="128" cy="140" r="2.5" fill="#F7A199" />
      </Capa>
      <Capa i={3}>
        <rect x="32" y="114" width="136" height="20" rx="10" fill="#6B3F24" className="t" />
        <path d="M52 124h14M92 122h14M128 126h14" stroke="#8E5A38" strokeWidth="4" strokeLinecap="round" />
      </Capa>
      <Capa i={2}>
        <path d="M38 104H162V112H138L128 126L118 112H38Z" fill="#F5C842" className="t4" />
      </Capa>
      <Capa i={1}>
        <path d="M32 98Q46 88 60 98T88 98T116 98T144 98T168 98V104H32Z" fill="#7FBF3A" className="t" />
      </Capa>
      <Capa i={0}>
        <path d="M34 92Q34 54 100 54Q166 54 166 92Z" fill="#E0A04A" className="t" />
        {[[70, 72, -20], [100, 64, 10], [128, 74, 25], [88, 82, 0], [116, 84, -15]].map(([x, y, r]) => (
          <ellipse key={`${x}${y}`} cx={x} cy={y} rx="6" ry="3.2" fill="#FFF1CF" transform={`rotate(${r} ${x} ${y})`} />
        ))}
      </Capa>
    </g>
  );
}

/* ---------- Tacos ---------- */
function TacosDibujo() {
  return (
    <g>
      <ellipse cx="100" cy="158" rx="86" ry="22" className="t f-plato" />
      <g className="i-inclina">
        <g data-p="atras" className="origin-bottom">
          <path d="M26 142A74 74 0 0 1 174 142Z" fill="#D9AE55" className="t" />
        </g>
        <g data-p="relleno">
          <path d="M40 116Q44 94 58 106Q64 84 80 100Q90 78 106 98Q120 80 130 100Q144 86 150 108Q162 102 166 122L100 134Z" fill="#7FBF3A" className="t4" />
          {[[66, 112], [92, 108], [118, 112], [142, 116]].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="7" fill="#7A4A2A" />
          ))}
          <rect x="76" y="118" width="10" height="10" rx="2" fill="#E0453A" />
          <rect x="108" y="120" width="10" height="10" rx="2" fill="#E0453A" />
          <path d="M52 124l12 -6l4 10zM128 124l12 -8l6 10z" fill="#F5C842" />
        </g>
        <g data-p="frente" className="origin-bottom">
          <path d="M26 146Q100 82 174 146Q100 172 26 146Z" fill="#F2CE7C" className="t" />
          <path d="M48 142Q100 100 152 142" fill="none" stroke="#FAE3A5" strokeWidth="6" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

/* ---------- Hot dog ---------- */
function puntosZigzag(): string {
  const pts: string[] = [];
  for (let x = 24, i = 0; x <= 176; x += 12, i++) {
    pts.push(`${x} ${i % 2 === 0 ? 96 : 110}`);
  }
  return `M${pts.join("L")}`;
}

function HotdogDibujo() {
  const zig = puntosZigzag();
  return (
    <g>
      <ellipse cx="100" cy="166" rx="84" ry="12" className="t4 f-apoyo" />
      <g data-p="perrito">
        <rect x="20" y="106" width="160" height="38" rx="19" fill="#D99B4A" className="t" />
        <rect x="12" y="90" width="176" height="28" rx="14" fill="#C8553D" className="t" />
        <path d="M30 98H160" stroke="#E27B62" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d={zig} pathLength="1" fill="none" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" className="i-mostaza" style={{ stroke: "var(--tinta)" }} />
        <path d={zig} pathLength="1" fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="i-mostaza" stroke="#F2C230" />
        <rect x="20" y="116" width="160" height="38" rx="19" fill="#E8B060" className="t" />
        <path d="M40 128H150" stroke="#F5CB8A" strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
}

export const hamburguesa: Dibujo = {
  Dibujo: HamburguesaDibujo,
  comer: (a) => {
    for (let i = 0; i < CAPAS; i++) {
      const d = (CAPAS - 1 - i) * SEPARACION;
      a(
        `[data-capa="${i}"]`,
        { y: [0, d, d - 7, d, 0] },
        { duration: 0.85, times: [0, 0.3, 0.45, 0.6, 1], ease: "easeInOut", delay: (5 - i) * 0.02 },
      );
    }
  },
};

export const tacos: Dibujo = {
  Dibujo: TacosDibujo,
  comer: (a) => {
    a("[data-p=frente]", { rotate: [0, -16, 0] }, { duration: 0.65, ease: "easeInOut" });
    a("[data-p=atras]", { rotate: [0, 16, 0] }, { duration: 0.65, ease: "easeInOut" });
    a("[data-p=relleno]", { y: [0, -10, 0], scale: [1, 1.08, 1] }, { duration: 0.65, ease: "easeInOut" });
  },
};

export const hotdog: Dibujo = {
  Dibujo: HotdogDibujo,
  comer: (a) => {
    a(
      "[data-p=perrito]",
      { y: [0, -38, 0], rotate: [0, -8, 4, 0] },
      { duration: 0.6, times: [0, 0.45, 0.8, 1], ease: "easeOut" },
    );
  },
};
