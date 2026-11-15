import type { Concentracoes } from "./ions";

/**
 * Diagrama de Piper (Piper, 1944).
 *
 * Entrada: concentrações em meq/L.
 * Cátions: Ca²⁺, Mg²⁺, Na⁺ + K⁺. Ânions: HCO₃⁻ + CO₃²⁻, SO₄²⁻, Cl⁻.
 *
 * Geometria (coordenadas matemáticas, y para cima, lado do triângulo = 1):
 *  - Triângulo de cátions: Ca no vértice inferior esquerdo (0,0), Na+K no inferior direito (1,0), Mg no topo (½, h).
 *  - Triângulo de ânions, deslocado de (1 + gap): HCO₃+CO₃ inferior esquerdo, Cl inferior direito, SO₄ no topo.
 *  - Losango: vértice inferior B = (1 + gap/2, gap·h). Com a = fração de Na+K nos cátions e
 *    b = fração de Cl+SO₄ nos ânions: P = L + a·(B − L) + b·(T − L), em que L = B + (−½, h) e T = B + (0, 2h).
 *    É equivalente à interseção das projeções dos pontos dos dois triângulos.
 */
export const H = Math.sqrt(3) / 2;

export interface Ponto {
  x: number;
  y: number;
}

export interface FracoesPiper {
  ca: number;
  mg: number;
  naK: number;
  hco3co3: number;
  so4: number;
  cl: number;
  somaCations: number; // meq/L considerado no Piper
  somaAnions: number;
}

export interface GeometriaPiper {
  gap: number;
  origemAnions: number; // x do vértice inferior esquerdo do triângulo de ânions
  B: Ponto;
  L: Ponto;
  T: Ponto;
  R: Ponto;
  largura: number;
  altura: number;
}

export function geometria(gap = 0.2): GeometriaPiper {
  const origemAnions = 1 + gap;
  const B = { x: 1 + gap / 2, y: gap * H };
  const L = { x: B.x - 0.5, y: B.y + H };
  const T = { x: B.x, y: B.y + 2 * H };
  const R = { x: B.x + 0.5, y: B.y + H };
  return { gap, origemAnions, B, L, T, R, largura: 2 + gap, altura: T.y };
}

/** Frações (0–1) dos grupos do Piper. Retorna null se faltar soma de cátions ou de ânions. */
export function fracoesPiper(meq: Concentracoes): FracoesPiper | null {
  const ca = meq.Ca ?? 0;
  const mg = meq.Mg ?? 0;
  const naK = (meq.Na ?? 0) + (meq.K ?? 0);
  const hco3co3 = (meq.HCO3 ?? 0) + (meq.CO3 ?? 0);
  const so4 = meq.SO4 ?? 0;
  const cl = meq.Cl ?? 0;
  const sc = ca + mg + naK;
  const sa = hco3co3 + so4 + cl;
  if (sc <= 0 || sa <= 0) return null;
  return {
    ca: ca / sc,
    mg: mg / sc,
    naK: naK / sc,
    hco3co3: hco3co3 / sa,
    so4: so4 / sa,
    cl: cl / sa,
    somaCations: sc,
    somaAnions: sa,
  };
}

/** Ponto no triângulo de cátions. */
export function pontoCations(f: Pick<FracoesPiper, "mg" | "naK">): Ponto {
  return { x: f.naK + f.mg / 2, y: f.mg * H };
}

/** Ponto no triângulo de ânions. */
export function pontoAnions(f: Pick<FracoesPiper, "so4" | "cl">, g: GeometriaPiper): Ponto {
  return { x: g.origemAnions + f.cl + f.so4 / 2, y: f.so4 * H };
}

/** Ponto no losango central. */
export function pontoLosango(f: Pick<FracoesPiper, "naK" | "cl" | "so4">, g: GeometriaPiper): Ponto {
  const a = f.naK;
  const b = f.cl + f.so4;
  return {
    x: g.L.x + a * (g.B.x - g.L.x) + b * (g.T.x - g.L.x),
    y: g.L.y + a * (g.B.y - g.L.y) + b * (g.T.y - g.L.y),
  };
}

export interface FaciesHidroquimica {
  cation: string;
  anion: string;
  rotulo: string;
}

/**
 * Classificação pelo íon dominante: um grupo é "dominante" quando passa de 50% da soma em meq/L;
 * se nenhum passar de 50%, a água é "mista" naquele lado. Regra explícita, sem interpretação.
 */
export function faciesDominante(f: FracoesPiper): FaciesHidroquimica {
  const cat: [string, number][] = [
    ["cálcica", f.ca],
    ["magnesiana", f.mg],
    ["sódica/potássica", f.naK],
  ];
  const an: [string, number][] = [
    ["bicarbonatada", f.hco3co3],
    ["sulfatada", f.so4],
    ["cloretada", f.cl],
  ];
  const dom = (arr: [string, number][]) => arr.find(([, v]) => v > 0.5)?.[0] ?? "mista";
  const cation = dom(cat);
  const anion = dom(an);
  return { cation, anion, rotulo: `${anion} ${cation}` };
}
