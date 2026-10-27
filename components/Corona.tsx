export function Corona({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" className={className} aria-hidden="true" focusable="false">
      <path
        d="M5 32L3 10L15 20L24 5L33 20L45 10L43 32Z"
        fill="#F5C842"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ stroke: "var(--tinta)" }}
      />
      <circle cx="24" cy="25" r="3" style={{ fill: "var(--tinta)" }} />
    </svg>
  );
}
