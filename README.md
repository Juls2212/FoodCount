# Panzómetro

Contador de comida para retos tipo "all you can eat". Cuenta bocados con ilustraciones animadas, mide tu ritmo y tu estómago, y permite competir con hasta 8 personas en un mismo dispositivo. Toda la interfaz está en español, funciona sin servidor propio y se puede instalar como aplicación ligera (PWA).

## Qué incluye

- **Modo Contador:** sesión con desglose por comida, total de puntos, cronómetro pausable, ritmo, meta con barra de estómago, deshacer ilimitado y atajos de teclado (Espacio suma, Retroceso deshace). Al terminar muestra un resumen y guarda récords personales. Si se cierra la pestaña a mitad de sesión, se restaura.
- **Modo Competencia:** de 2 a 8 participantes con avatar geométrico en SVG, rondas de 5 a 30 minutos o libres, comida única o libre por participante, cuenta regresiva, ranking en vivo con animación de layout, últimos 10 segundos con alerta visual, podio animado y resultados con datos destacados. Mantiene la pantalla encendida con la Wake Lock API cuando el navegador la soporta y restaura una ronda activa tras recargar.
- **Historial:** pestañas de sesiones y competencias, detalle expandible, eliminación con confirmación y resumen de récords.
- **Logros:** 14 insignias SVG que se evalúan al guardar sesiones y competencias o crear una comida personalizada.
- **Temas:** claro y oscuro, con paleta derivada de la comida elegida y del tipo de pantalla (contador relajado, competencia intensa), con contraste AA verificado por código.
- **Datos:** exportar e importar un archivo JSON validado desde Ajustes.

## Cómo correr en local

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:3000
```

Otros comandos:

```bash
npm run build          # compilación de producción
npm run start          # sirve la compilación
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run check:estilo   # falla si hay emojis o degradados en el código
```

Nota: el proyecto fija TypeScript 6 porque `typescript-eslint` todavía no soporta TypeScript 7.

## Estructura del proyecto

```
app/                 Rutas (App Router): /, /competencia, /historial, /logros, /ajustes,
                     /comidas/nueva, manifest.ts, icon.svg y apple-icon.png
components/          Componentes de interfaz
  ilustraciones/     Las 13 ilustraciones SVG animadas y el plato genérico
  sesion/            Panel del modo Contador y resumen de sesión
  competencia/       Configuración, cuenta regresiva, juego, ranking, podio y resultados
data/catalog.json    Catálogo fijo: categorías, comidas y colores para comidas propias
lib/                 Lógica pura: storage, tema, sesión, competencia, logros, tiempo, sonido
public/icons/        Íconos PNG de la aplicación instalable
scripts/             check-estilo.mjs
types/               Tipos compartidos
```

## Cómo funciona la "base de datos"

No hay backend ni base de datos externa, así que el despliegue es estático y Vercel no necesita configuración.

- **Catálogo (`data/catalog.json`):** datos fijos que se importan de forma estática durante el build. Nunca se escriben en runtime.
- **Datos del usuario (localStorage):** todo lo que cambia (sesión activa, sesiones, competencias, comidas personalizadas, récords, logros y ajustes) vive en un único objeto JSON versionado bajo la clave `panzometro:v1`. `lib/storage.ts` lee y escribe de forma segura (maneja SSR, JSON corrupto y cuota llena), valida la estructura y migra datos de versiones anteriores. La versión actual del esquema es la 3.
- **Caché de tema (`panzometro:tema-cache`):** copia desechable de los colores de la última visita para evitar el parpadeo inicial.
- **Respaldo:** Ajustes permite exportar el objeto completo a un archivo `.json` e importarlo de nuevo. El archivo se valida antes de aceptarse y los errores se muestran con mensajes claros.

## Cómo añadir una comida nueva al catálogo

1. Agrega un objeto a `comidas` en `data/catalog.json`:

   ```json
   {
     "id": "arepas",
     "nombre": "Arepas",
     "categoria": "rapida",
     "unidad": { "singular": "unidad", "plural": "unidades" },
     "puntos": 4,
     "paleta": { "primario": "#D6A04A", "secundario": "#F7E5C2" }
   }
   ```

   El `id` debe ser único y la `categoria` uno de los ids de `categorias`. Los puntos equilibran la competencia (una pizza vale más que un nugget). El color primario debe distinguirse de las demás comidas.
2. Sin hacer nada más, la comida aparece en la cuadrícula y en las competencias con un plato genérico con su inicial.
3. Para darle un dibujo propio, crea el componente SVG en el archivo de su categoría dentro de `components/ilustraciones/` (usa viewBox 200x200, colores sólidos y contorno con `var(--tinta)`), expórtalo con su animación `comer` y regístralo en el objeto `registro` de `FoodIllustration.tsx`.
4. Ejecuta `npm run build` y `npm run check:estilo`.

Las comidas que crea cada persona desde la app se guardan solo en su navegador y no tocan el catálogo.

## Reglas de diseño

Están en `CLAUDE.md`: sin emojis, sin degradados, sombras duras sin desenfoque, solo modos claro y oscuro, animaciones con transform y opacity que respetan `prefers-reduced-motion`, interfaz mobile first con contraste mínimo AA.

## Despliegue en Vercel

La aplicación es estática (todas las rutas se prerenderizan) y no usa rutas de API, variables de entorno ni escritura en el sistema de archivos. No requiere configuración especial.

**Opción 1: desde el panel de Vercel**

1. Sube el repositorio a GitHub, GitLab o Bitbucket.
2. En Vercel pulsa "Add New" y luego "Project", e importa el repositorio.
3. Vercel detecta Next.js automáticamente. Deja los valores por defecto (comando de build `next build`) y no agregues variables de entorno.
4. Pulsa "Deploy".

**Opción 2: desde la CLI**

```bash
npm install -g vercel
vercel          # primera vez: vincula el proyecto y crea una vista previa
vercel --prod   # publica en producción
```

Los datos de cada persona se guardan en su propio navegador, por lo que un despliegue nuevo no borra nada.

## Instalar como aplicación

En un navegador compatible, usa "Instalar" o "Agregar a la pantalla de inicio". El manifiesto está en `app/manifest.ts`; no hay service worker, así que la aplicación necesita conexión para la primera carga.
