"use client";

import dynamic from "next/dynamic";

const GaleriaLogros = dynamic(() => import("./GaleriaLogros"), {
  ssr: false,
  loading: () => <div className="h-96" aria-hidden="true" />,
});

export function GaleriaLogrosLazy() {
  return <GaleriaLogros />;
}
