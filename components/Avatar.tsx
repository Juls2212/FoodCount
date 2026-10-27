import { useId } from "react";
import type { Avatar as TipoAvatar } from "@/types";
import { COLORES_AVATAR, FORMAS, PATRONES } from "@/lib/competencia";

const FORMA_D: string[] = [
  "M50 6a44 44 0 1 0 0.01 0Z",
  "M18 6H82Q94 6 94 18V82Q94 94 82 94H18Q6 94 6 82V18Q6 6 18 6Z",
  "M50 4L96 50L50 96L4 50Z",
  "M50 4L92 27V73L50 96L8 73V27Z",
  "M14 10H86V52Q86 82 50 95Q14 82 14 52Z",
  "M50 6L94 88H6Z",
];

function Patron({ patron, color }: { patron: number; color: string }) {
  switch (patron % PATRONES) {
    case 1:
      return (
        <g fill={color}>
          <rect x="-20" y="22" width="150" height="14" transform="rotate(-35 50 50)" />
          <rect x="-20" y="50" width="150" height="14" transform="rotate(-35 50 50)" />
          <rect x="-20" y="78" width="150" height="14" transform="rotate(-35 50 50)" />
        </g>
      );
    case 2:
      return (
        <g fill={color}>
          {[28, 50, 72].flatMap((y) => [28, 50, 72].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="6" />))}
        </g>
      );
    case 3:
      return <circle cx="50" cy="52" r="22" fill="none" stroke={color} strokeWidth="9" />;
    case 4:
      return <path d="M-4 40L16 56L36 40L56 56L76 40L96 56L104 48V64H-4Z" fill={color} />;
    case 5:
      return (
        <g fill={color}>
          <rect x="42" y="22" width="16" height="56" rx="3" />
          <rect x="22" y="42" width="56" height="16" rx="3" />
        </g>
      );
    default:
      return null;
  }
}

interface Props {
  avatar: TipoAvatar;
  className?: string;
}

/** Avatar geometrico: forma base, color y patron, todo en formas solidas. */
export function Avatar({ avatar, className = "h-12 w-12" }: Props) {
  const id = `av${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [base, trama] = COLORES_AVATAR[avatar.color % COLORES_AVATAR.length];
  const d = FORMA_D[avatar.forma % FORMAS];
  return (
    <svg viewBox="0 0 100 100" className={`shrink-0 ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={base} />
      <g clipPath={`url(#${id})`}>
        <Patron patron={avatar.patron} color={trama} />
      </g>
      <path d={d} fill="none" strokeWidth="6" strokeLinejoin="round" style={{ stroke: "var(--tinta)" }} />
    </svg>
  );
}
