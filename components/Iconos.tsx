import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconoContador(props: Props) {
  return (
    <Base {...props}>
      <path d="M4 17a8 8 0 0 1 16 0" />
      <path d="M12 17l4-5" />
      <path d="M4 21h16" />
    </Base>
  );
}

export function IconoCompetencia(props: Props) {
  return (
    <Base {...props}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3" />
      <path d="M17 6h3v1a3 3 0 0 1-3 3" />
      <path d="M12 14v4" />
      <path d="M8 20h8" />
    </Base>
  );
}

export function IconoHistorial(props: Props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Base>
  );
}

export function IconoAjustes(props: Props) {
  return (
    <Base {...props}>
      <path d="M4 7h10" />
      <path d="M18 7h2" />
      <circle cx="16" cy="7" r="2" />
      <path d="M4 17h2" />
      <path d="M10 17h10" />
      <circle cx="8" cy="17" r="2" />
    </Base>
  );
}

export function IconoMas(props: Props) {
  return (
    <Base {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Base>
  );
}

export function IconoMenos(props: Props) {
  return (
    <Base {...props}>
      <path d="M5 12h14" />
    </Base>
  );
}

export function IconoReiniciar(props: Props) {
  return (
    <Base {...props}>
      <path d="M4 12a8 8 0 1 0 3-6.2" />
      <path d="M4 4v5h5" />
    </Base>
  );
}

export function IconoDescargar(props: Props) {
  return (
    <Base {...props}>
      <path d="M12 4v11" />
      <path d="M7 11l5 5 5-5" />
      <path d="M5 20h14" />
    </Base>
  );
}

export function IconoSubir(props: Props) {
  return (
    <Base {...props}>
      <path d="M12 16V5" />
      <path d="M7 9l5-5 5 5" />
      <path d="M5 20h14" />
    </Base>
  );
}

export function IconoBasura(props: Props) {
  return (
    <Base {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
    </Base>
  );
}

export function IconoSol(props: Props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </Base>
  );
}

export function IconoLuna(props: Props) {
  return (
    <Base {...props}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </Base>
  );
}

export function PlatoGenerico(props: Props) {
  return (
    <Base viewBox="0 0 48 48" strokeWidth="3" {...props}>
      <circle cx="24" cy="24" r="19" />
      <circle cx="24" cy="24" r="11" />
    </Base>
  );
}

export function IconoCerrar(props: Props) {
  return (
    <Base {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Base>
  );
}

export function IconoPausa(props: Props) {
  return (
    <Base {...props}>
      <path d="M8 5v14M16 5v14" />
    </Base>
  );
}

export function IconoJugar(props: Props) {
  return (
    <Base {...props}>
      <path d="M7 5l12 7-12 7z" />
    </Base>
  );
}

export function IconoDeshacer(props: Props) {
  return (
    <Base {...props}>
      <path d="M9 6L4 11l5 5" />
      <path d="M4 11h10a5 5 0 0 1 0 10H9" />
    </Base>
  );
}

export function IconoLogros(props: Props) {
  return (
    <Base {...props}>
      <path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4 6.8 19.2l1-5.9L3.5 9.2l5.9-.8z" />
    </Base>
  );
}

export function IconoFlecha(props: Props) {
  return (
    <Base {...props}>
      <path d="M6 9l6 6 6-6" />
    </Base>
  );
}
