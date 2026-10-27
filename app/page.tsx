import { PanelSesion } from "@/components/sesion/PanelSesion";
import { SelectorComida } from "@/components/SelectorComida";

export default function Inicio() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[26rem_minmax(0,1fr)] lg:items-start">
      <PanelSesion />
      <SelectorComida />
    </div>
  );
}
