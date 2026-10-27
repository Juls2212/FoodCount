import { LOGROS } from "@/lib/logros";

const TRAZO = { fill: "none", strokeWidth: 6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Icono({ id }: { id: string }) {
  switch (id) {
    case "primer-bocado":
      return (
        <>
          <path d="M50 30A20 20 0 1 0 70 50A12 12 0 0 1 50 30Z" {...TRAZO} />
          <path d="M44 56h.5M56 64h.5M42 70h.5" {...TRAZO} />
        </>
      );
    case "calentamiento":
      return <NumeroTexto texto="10" />;
    case "medio-centenar":
      return <NumeroTexto texto="50" />;
    case "centenar":
      return <NumeroTexto texto="100" pequeno />;
    case "maraton":
      return (
        <>
          <circle cx="50" cy="52" r="20" {...TRAZO} />
          <path d="M50 40V52L58 58M44 26H56" {...TRAZO} />
        </>
      );
    case "ritmo-veloz":
      return <path d="M56 24L38 54H50L44 78L64 46H52Z" {...TRAZO} />;
    case "probador":
      return (
        <>
          {[[36, 40], [64, 40], [28, 60], [50, 66], [72, 60]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="6" {...TRAZO} />
          ))}
        </>
      );
    case "competidor":
      return (
        <>
          <circle cx="40" cy="42" r="10" {...TRAZO} />
          <circle cx="62" cy="46" r="10" {...TRAZO} />
          <path d="M24 74Q40 58 56 74M52 76Q64 64 78 76" {...TRAZO} />
        </>
      );
    case "campeon-arena":
      return <path d="M28 64L24 36L38 48L50 28L62 48L76 36L72 64Z" {...TRAZO} />;
    case "remontada":
      return <path d="M28 70L46 52L56 60L74 38M60 36H74V50" {...TRAZO} />;
    case "racha-3":
      return <NumeroTexto texto="x3" />;
    case "meta-superada":
      return <path d="M36 74V28M36 28H68L58 40L68 52H36" {...TRAZO} />;
    case "personalizada":
      return (
        <>
          <circle cx="50" cy="50" r="24" {...TRAZO} />
          <path d="M50 38V62M38 50H62" {...TRAZO} />
        </>
      );
    case "record-personal":
      return <path d="M50 24L58 42L78 44L63 57L68 76L50 66L32 76L37 57L22 44L42 42Z" {...TRAZO} />;
    default:
      return null;
  }
}

function NumeroTexto({ texto, pequeno }: { texto: string; pequeno?: boolean }) {
  return (
    <text
      x="50"
      y="52"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={pequeno ? 30 : 36}
      fontWeight="800"
      stroke="none"
      fill="currentColor"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {texto}
    </text>
  );
}

interface Props {
  id: string;
  bloqueada?: boolean;
  className?: string;
}

/** Insignia hexagonal: en color si esta desbloqueada, en tono apagado si no. */
export function Insignia({ id, bloqueada = false, className = "h-20 w-20" }: Props) {
  const color = LOGROS.find((l) => l.id === id)?.color ?? "#5E6B7A";
  return (
    <svg viewBox="0 0 100 100" className={`shrink-0 ${className}`} aria-hidden="true" focusable="false">
      <path
        d="M50 5L90 27V73L50 95L10 73V27Z"
        strokeWidth="6"
        strokeLinejoin="round"
        style={{
          fill: bloqueada ? "var(--superficie-2)" : color,
          stroke: bloqueada ? "var(--tinta-suave)" : "var(--tinta)",
          strokeDasharray: bloqueada ? "8 8" : undefined,
        }}
      />
      <g style={{ color: bloqueada ? "var(--tinta-suave)" : "#1B1815", stroke: "currentColor" }}>
        <Icono id={id} />
      </g>
    </svg>
  );
}
