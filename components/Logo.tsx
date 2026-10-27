const trazo = { stroke: "var(--sobre-primario)" } as const;

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="Panzómetro"
      focusable="false"
    >
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="12"
        strokeWidth="3"
        style={{ fill: "var(--primario)", stroke: "var(--borde)" }}
      />
      <path
        d="M12 31a12 12 0 0 1 24 0"
        fill="none"
        strokeWidth="3.5"
        strokeLinecap="round"
        style={trazo}
      />
      <path
        d="M24 31l7-10"
        fill="none"
        strokeWidth="3.5"
        strokeLinecap="round"
        style={trazo}
      />
      <circle cx="24" cy="31" r="3.5" style={{ fill: "var(--sobre-primario)" }} />
      <path
        d="M12 37h24"
        fill="none"
        strokeWidth="3.5"
        strokeLinecap="round"
        style={trazo}
      />
    </svg>
  );
}
