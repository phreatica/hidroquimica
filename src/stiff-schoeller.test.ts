import { describe, expect, it } from "vitest";
import { conjuntoParaMeq, decadasLog, eixosStiff, maiorEixoStiff, poligonoStiff, serieSchoeller } from ".";

describe("Stiff", () => {
  const meq = conjuntoParaMeq({ Ca: 40.078, Mg: 24.305, Na: 22.99, K: 0, Cl: 35.453, HCO3: 61.017, SO4: 96.06 });
  // Ca = 2, Mg = 2, Na = 1, Cl = 1, HCO3 = 1, SO4 = 2 meq/L
  it("eixos em meq/L", () => {
    const e = eixosStiff(meq);
    expect(e.ca).toBeCloseTo(2, 9);
    expect(e.mg).toBeCloseTo(2, 9);
    expect(e.naK).toBeCloseTo(1, 9);
    expect(e.so4).toBeCloseTo(2, 9);
  });
  it("polígono: cátions à esquerda (x<0), ânions à direita (x>0), 3 linhas", () => {
    const p = poligonoStiff(eixosStiff(meq));
    expect(p).toHaveLength(6);
    expect(p.slice(0, 3).every((v) => v.x <= 0)).toBe(true);
    expect(p.slice(3).every((v) => v.x >= 0)).toBe(true);
    expect(p.map((v) => v.y)).toEqual([0, 1, 2, 2, 1, 0]);
  });
  it("maior eixo para escala comum", () => {
    expect(maiorEixoStiff([eixosStiff(meq)])).toBeCloseTo(2, 9);
  });
});

describe("Schoeller", () => {
  it("zeros viram null (sem log de zero)", () => {
    const s = serieSchoeller({ Ca: 2, Mg: 0, Na: 1, Cl: 1, SO4: 0.5, HCO3: 3 });
    expect(s).toEqual([2, null, 1, 1, 0.5, 3]);
  });
  it("décadas cobrem os valores", () => {
    expect(decadasLog([0.05, 12, null])).toEqual({ min: -2, max: 2 });
    expect(decadasLog([1, 1])).toEqual({ min: 0, max: 1 });
  });
});
