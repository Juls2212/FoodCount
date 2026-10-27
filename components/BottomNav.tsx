"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { esActivo, itemsNav } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t-[3px] border-borde bg-superficie text-tinta lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {itemsNav.map(({ href, nombre, Icono }) => {
          const activo = esActivo(href, pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className="flex min-h-16 flex-col items-center justify-center gap-0.5 px-0.5 text-[0.7rem] font-bold"
              >
                <span
                  className={`grid h-8 w-12 place-items-center rounded-full border-[3px] ${
                    activo
                      ? "border-borde bg-primario text-sobre-primario"
                      : "border-transparent"
                  }`}
                >
                  <Icono className="h-5 w-5" />
                </span>
                {nombre}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
