import type { Concentracoes } from "./ions";

/**
 * Diagrama de Stiff (Stiff, 1951): polígono com cátions à esquerda e ânions à direita, em meq/L.
 * Linhas (de cima para baixo): Na⁺ + K⁺ | Cl⁻ ; Ca²⁺ | HCO₃⁻ + CO₃²⁻ ; Mg²⁺ | SO₄²⁻.
 */
export interface EixosStiff {
  naK: number;
  ca: number;
  mg: number;
  cl: number;
  hco3co3: number;
  so4: number;
}

export function eixosStiff(meq: Concentracoes): EixosStiff {
  return {
    naK: (meq.Na ?? 0) + (meq.K ?? 0),
    ca: meq.Ca ?? 0,
    mg: meq.Mg ?? 0,
    cl: meq.Cl ?? 0,
    hco3co3: (meq.HCO3 ?? 0) + (meq.CO3 ?? 0),
    so4: meq.SO4 ?? 0,
  };
}

/**
 * Vértices do polígono em coordenadas (x em meq/L; y = índice da linha 0, 1, 2).
 * Cátions com x negativo, ânions com x positivo, no sentido horário a partir do topo esquerdo.
 */
export function poligonoStiff(e: EixosStiff): { x: number; y: number }[] {
  return [
    { x: -e.naK, y: 0 },
    { x: -e.ca, y: 1 },
    { x: -e.mg, y: 2 },
    { x: e.so4, y: 2 },
    { x: e.hco3co3, y: 1 },
    { x: e.cl, y: 0 },
  ];
}

export function maiorEixoStiff(lista: EixosStiff[]): number {
  return lista.reduce((m, e) => Math.max(m, e.naK, e.ca, e.mg, e.cl, e.hco3co3, e.so4), 0);
}

/**
 * Diagrama de Schoeller (Schoeller, 1955): concentrações em meq/L, em escala logarítmica,
 * na ordem clássica Ca, Mg, Na+K, Cl, SO₄, HCO₃+CO₃.
 */
export const EIXOS_SCHOELLER = ["Ca²⁺", "Mg²⁺", "Na⁺ + K⁺", "Cl⁻", "SO₄²⁻", "HCO₃⁻ + CO₃²⁻"] as const;

/** Valores na ordem dos eixos; zero ou ausente vira null (não existe log de zero). */
export function serieSchoeller(meq: Concentracoes): (number | null)[] {
  const e = eixosStiff(meq);
  return [e.ca, e.mg, e.naK, e.cl, e.so4, e.hco3co3].map((v) => (v > 0 ? v : null));
}

/** Décadas inteiras (potências de 10) que cobrem todos os valores positivos. */
export function decadasLog(valores: (number | null)[]): { min: number; max: number } {
  const pos = valores.filter((v): v is number => v !== null && v > 0);
  if (pos.length === 0) return { min: -1, max: 1 };
  const min = Math.floor(Math.log10(Math.min(...pos)));
  let max = Math.ceil(Math.log10(Math.max(...pos)));
  if (max === min) max = min + 1;
  return { min, max };
}
