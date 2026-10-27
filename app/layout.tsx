import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { AppProvider } from "@/components/AppProvider";
import { AvisoLogros } from "@/components/AvisoLogros";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--fuente-display",
  display: "swap",
});

const texto = DM_Sans({
  subsets: ["latin"],
  variable: "--fuente-texto",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Panzómetro", template: "%s | Panzómetro" },
  description:
    "Contador de comida para retos tipo all you can eat: cuenta bocados, compite con amigos y desbloquea logros.",
  applicationName: "Panzómetro",
  appleWebApp: { capable: true, title: "Panzómetro", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Fija data-theme, los tokens de la ultima visita y el color del navegador
// antes del primer pintado, para evitar el parpadeo inicial.
const scriptTema = `(function(){var d=document.documentElement;try{
var t=null;var raw=localStorage.getItem('panzometro:v1');
if(raw){var o=JSON.parse(raw);t=o&&o.ajustes&&o.ajustes.modo;}
if(t!=='claro'&&t!=='oscuro'){t=matchMedia('(prefers-color-scheme: dark)').matches?'oscuro':'claro';}
d.setAttribute('data-theme',t);
d.classList.add('sin-transicion');
var p=location.pathname.indexOf('/competencia')===0?'competencia':'contador';
var c=JSON.parse(localStorage.getItem('panzometro:tema-cache')||'null');
var fondo=t==='oscuro'?'#1a1110':'#fdeceb';
if(c&&c.modo===t&&c.pantalla===p&&c.vars){for(var k in c.vars){d.style.setProperty('--'+k,c.vars[k]);}fondo=c.vars.fondo||fondo;}
var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',fondo);
}catch(e){d.setAttribute('data-theme','claro');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${display.variable} ${texto.variable}`}
    >
      <head>
        <meta name="theme-color" content="#fdeceb" />
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body className="min-h-dvh antialiased">
        <AppProvider>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-xl focus:border-[3px] focus:border-borde focus:bg-superficie focus:px-4 focus:py-2 focus:font-bold focus:text-tinta"
          >
            Saltar al contenido
          </a>
          <Header />
          <main id="contenido" className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4 lg:pb-10">
            {children}
          </main>
          <BottomNav />
          <AvisoLogros />
        </AppProvider>
      </body>
    </html>
  );
}
