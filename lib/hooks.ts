"use client";

import { useEffect, useState } from "react";

/** Reloj de pared que se actualiza cada `intervalo` ms solo mientras `activo`. */
export function useAhora(activo: boolean, intervalo = 250): number {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (!activo) return;
    const id = setInterval(() => setAhora(Date.now()), intervalo);
    return () => clearInterval(id);
  }, [activo, intervalo]);
  return ahora;
}

/** Mantiene la pantalla encendida mientras `activo`, si el navegador lo permite. */
export function useWakeLock(activo: boolean): void {
  useEffect(() => {
    if (!activo || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let sentinela: WakeLockSentinel | null = null;
    let cancelado = false;

    const pedir = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelado) void lock.release().catch(() => {});
        else sentinela = lock;
      } catch {
        // Sin permiso o sin bateria suficiente: la ronda sigue sin wake lock.
      }
    };
    // El sistema libera el bloqueo al ocultar la pestana; se pide de nuevo al volver.
    const alVolver = () => {
      if (document.visibilityState === "visible") void pedir();
    };

    void pedir();
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      cancelado = true;
      document.removeEventListener("visibilitychange", alVolver);
      void sentinela?.release().catch(() => {});
    };
  }, [activo]);
}

/** true si el foco esta en un control que ya maneja Espacio o Retroceso por si mismo. */
export function enControlInteractivo(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return (
    el.isContentEditable ||
    !!el.closest("button, a, input, select, textarea, summary, dialog, [role='switch'], [role='tab'], [role='radio']")
  );
}
