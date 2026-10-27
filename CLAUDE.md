# Panzometro

Contador de comida para retos tipo "all you can eat". Toda la interfaz va en espanol.

## Reglas globales (obligatorias en todas las fases)

1. Prohibido usar emojis en cualquier lugar: interfaz, codigo, comentarios, README, mensajes de commit. Todos los iconos y dibujos son SVG propios.
2. Prohibido usar degradados de cualquier tipo: linear-gradient, radial-gradient, conic-gradient, repeating-*, degradados SVG (linearGradient, radialGradient), mascaras con desvanecido o cualquier efecto de fade-gradiente. Solo colores solidos.
3. Sombras solo duras y desplazadas (por ejemplo `box-shadow: 4px 4px 0 var(--tinta)`), nunca con blur. Estilo flat, bordes gruesos de 2 a 3 px, esquinas redondeadas.
4. Solo existen dos modos de tema: claro y oscuro. No agregar mas.
5. Las animaciones usan transform y opacity, respetan prefers-reduced-motion y deben sentirse fluidas en celulares de gama media.
6. Interfaz mobile first, botones grandes para tocar, buen contraste (minimo WCAG AA en textos).
7. Cada fase termina con `npm run build` sin errores y `npm run check:estilo` en verde.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS con variables CSS para temas, Framer Motion, next/font (Bricolage Grotesque para titulos, DM Sans para texto). Sin backend ni base de datos externa; despliegue en Vercel sin configuracion.

## Datos

- `data/catalog.json`: catalogo fijo, importado estaticamente. Nunca se escribe en runtime.
- Todo lo mutable vive en localStorage bajo la clave `panzometro:v1` con estructura JSON versionada (ver `lib/storage.ts`).

## Fases

Fase 1: base, catalogo y temas. Fase 2: ilustraciones y animaciones. Fase 3: modos contador y competencia, historial, logros y despliegue.

## Estructura

`app/`, `components/`, `lib/`, `data/`, `types/`. El tema se calcula en `lib/theme.ts` a partir de comida, modo y pantalla.

## Verificacion

`npm run lint`, `npm run typecheck`, `npm run build` y `npm run check:estilo` deben pasar antes de cerrar cualquier fase. El script esta en `scripts/check-estilo.mjs`.
