// Falla si encuentra emojis o degradados en el codigo fuente del proyecto.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const RAIZ = process.cwd();
const CARPETAS = ["src", "app", "components", "lib", "data", "types", "styles", "estilos", "public"];
const IGNORAR = new Set(["node_modules", ".next", ".git"]);
const EXTENSIONES = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".scss", ".json", ".svg", ".html", ".md", ".mdx",
]);

const REGLAS = [
  {
    nombre: "emoji",
    patron: /[\p{Extended_Pictographic}\p{Emoji_Presentation}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/u,
  },
  { nombre: "degradado", patron: /gradient/i },
];

function* recorrer(dir) {
  let entradas;
  try {
    entradas = readdirSync(dir);
  } catch {
    return;
  }
  for (const nombre of entradas) {
    if (IGNORAR.has(nombre)) continue;
    const ruta = join(dir, nombre);
    const info = statSync(ruta);
    if (info.isDirectory()) yield* recorrer(ruta);
    else if (EXTENSIONES.has(extname(nombre).toLowerCase())) yield ruta;
  }
}

const problemas = [];
let revisados = 0;

for (const carpeta of CARPETAS) {
  for (const archivo of recorrer(join(RAIZ, carpeta))) {
    revisados++;
    const lineas = readFileSync(archivo, "utf8").split(/\r?\n/);
    lineas.forEach((linea, i) => {
      for (const { nombre, patron } of REGLAS) {
        if (patron.test(linea)) {
          problemas.push(`${relative(RAIZ, archivo)}:${i + 1}  ${nombre}: ${linea.trim().slice(0, 80)}`);
        }
      }
    });
  }
}

if (problemas.length > 0) {
  console.error(`check:estilo fallo con ${problemas.length} problema(s):\n`);
  for (const p of problemas) console.error(`  ${p}`);
  process.exit(1);
}

console.log(`check:estilo en verde (${revisados} archivos revisados).`);
