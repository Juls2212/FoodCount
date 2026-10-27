"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { esActivo, itemsNav } from "./nav-items";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 pb-2 pt-4">
      <Link href="/" className="flex items-center gap-3" aria-label="Panzómetro, inicio">
        <Logo className="h-12 w-12" />
        <span className="font-display text-2xl font-extrabold tracking-tight text-tinta-fondo">
          Panzómetro
        </span>
      </Link>

      <nav aria-label="Principal" className="hidden items-center gap-2 lg:flex">
        {itemsNav.map(({ href, nombre }) => {
          const activo = esActivo(href, pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={activo ? "page" : undefined}
              className={`flex min-h-12 items-center rounded-xl border-[3px] px-4 font-display font-bold ${
                activo
                  ? "border-borde bg-superficie text-tinta shadow-duro-sm"
                  : "border-transparent text-tinta-fondo"
              }`}
            >
              {nombre}
            </Link>
          );
        })}
      </nav>

      <ThemeToggle />
    </header>
  );
}
