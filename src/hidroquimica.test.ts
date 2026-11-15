import { describe, expect, it } from "vitest";
import {
  avaliarCriterio,
  balancoIonico,
  conjuntoParaMeq,
  converter,
  durezaTotal,
  faciesDominante,
  fracoesPiper,
  geometria,
  lerNumero,
  lerTabela,
  mgParaMeq,
  pontoAnions,
  pontoCations,
  pontoLosango,
} from ".";

const close = (a: number, b: number, d = 1e-3) => expect(Math.abs(a - b)).toBeLessThan(d);

describe("conversões", () => {
  it("mg/L → meq/L usa massa molar e carga", () => {
    close(mgParaMeq("Ca", 40.078), 2, 1e-9);
    close(mgParaMeq("Cl", 35.453), 1, 1e-9);
    close(mgParaMeq("SO4", 96.06), 2, 1e-9);
  });
  it("converter ida e volta é identidade", () => {
    const v = converter("Mg", converter("Mg", 12.3, "mg/L", "meq/L"), "meq/L", "mg/L");
    close(v, 12.3, 1e-9);
    close(converter("Na", 1, "mmol/L", "meq/L"), 1, 1e-9);
    close(converter("Ca", 1, "mmol/L", "meq/L"), 2, 1e-9);
  });
  it("dureza: 100 mg/L de Ca ≈ 249,7 mg/L CaCO₃", () => {
    close(durezaTotal(100, 0), 249.7, 0.1);
    close(durezaTotal(0, 100), 411.8, 0.1);
  });
});

describe("balanço iônico", () => {
  // Amostra ilustrativa PM-01 (calculada à mão: Σc ≈ 3,962; Σa ≈ 3,987 meq/L)
  const pm01 = conjuntoParaMeq({ Ca: 45, Mg: 12, Na: 15, K: 3, HCO3: 180, SO4: 20, Cl: 22 });
  it("somas e erro", () => {
    const b = balancoIonico(pm01);
    close(b.somaCations, 3.962, 2e-3);
    close(b.somaAnions, 3.987, 2e-3);
    close(b.erroPercentual, -0.31, 0.02);
  });
  it("critério APHA usa diferença absoluta quando Σ ânions ≤ 3 meq/L", () => {
    const r = avaliarCriterio(
      { somaCations: 2.5, somaAnions: 2.8, diferencaAbsoluta: -0.3, erroPercentual: -5.66 },
      "apha-1030e",
    );
    expect(r.dentro).toBe(false);
    const r2 = avaliarCriterio(
      { somaCations: 2.7, somaAnions: 2.8, diferencaAbsoluta: -0.1, erroPercentual: -1.82 },
      "apha-1030e",
    );
    expect(r2.dentro).toBe(true);
  });
  it("critério APHA de 2% entre 3 e 10 meq/L", () => {
    expect(avaliarCriterio(balancoIonico(pm01), "apha-1030e").dentro).toBe(true);
  });
});

describe("Piper", () => {
  const g = geometria(0.2);
  it("vértices dos triângulos", () => {
    const caPuro = pontoCations({ mg: 0, naK: 0 });
    expect(caPuro).toEqual({ x: 0, y: 0 });
    const mgPuro = pontoCations({ mg: 1, naK: 0 });
    close(mgPuro.x, 0.5, 1e-12);
    close(mgPuro.y, Math.sqrt(3) / 2, 1e-12);
    const clPuro = pontoAnions({ so4: 0, cl: 1 }, g);
    close(clPuro.x, 2.2, 1e-12);
  });
  it("vértices do losango", () => {
    // Ca-Mg-HCO3 → esquerda; Na-HCO3 → baixo; Ca-Mg-Cl-SO4 → topo; Na-Cl → direita
    expect(pontoLosango({ naK: 0, cl: 0, so4: 0 }, g)).toEqual(g.L);
    const b = pontoLosango({ naK: 1, cl: 0, so4: 0 }, g);
    close(b.x, g.B.x, 1e-12);
    close(b.y, g.B.y, 1e-12);
    const t = pontoLosango({ naK: 0, cl: 0.5, so4: 0.5 }, g);
    close(t.x, g.T.x, 1e-12);
    close(t.y, g.T.y, 1e-12);
    const r = pontoLosango({ naK: 1, cl: 1, so4: 0 }, g);
    close(r.x, g.R.x, 1e-12);
    close(r.y, g.R.y, 1e-12);
  });
  it("ponto do losango é a interseção das projeções dos triângulos", () => {
    const f = fracoesPiper(conjuntoParaMeq({ Ca: 60, Mg: 30, Na: 320, K: 8, HCO3: 210, SO4: 90, Cl: 520 }))!;
    const pc = pontoCations(f);
    const pa = pontoAnions(f, g);
    const pd = pontoLosango(f, g);
    // projeção do cátion: reta a 60° a partir de pc; do ânion: reta a 120° a partir de pa
    const dirC = { x: 0.5, y: Math.sqrt(3) / 2 };
    const dirA = { x: -0.5, y: Math.sqrt(3) / 2 };
    // pd - pc deve ser paralelo a dirC; pd - pa paralelo a dirA (produto vetorial ≈ 0)
    const cross = (u: { x: number; y: number }, v: { x: number; y: number }) => u.x * v.y - u.y * v.x;
    close(cross({ x: pd.x - pc.x, y: pd.y - pc.y }, dirC), 0, 1e-9);
    close(cross({ x: pd.x - pa.x, y: pd.y - pa.y }, dirA), 0, 1e-9);
  });
  it("fácies pelo íon dominante", () => {
    const f = fracoesPiper(conjuntoParaMeq({ Ca: 60, Mg: 30, Na: 320, K: 8, HCO3: 210, SO4: 90, Cl: 520 }))!;
    expect(faciesDominante(f).rotulo).toBe("cloretada sódica/potássica");
  });
});

describe("leitura de dados", () => {
  it("números brasileiros e censurados", () => {
    expect(lerNumero("12,5").valor).toBe(12.5);
    expect(lerNumero("1.234,5").valor).toBe(1234.5);
    expect(lerNumero("1,234.5").valor).toBe(1234.5);
    expect(lerNumero("<0,5", "metade-lq")).toMatchObject({ valor: 0.25, censurado: true });
    expect(lerNumero("ND")).toMatchObject({ valor: 0, censurado: true });
    expect(lerNumero("").valor).toBeNull();
    expect(lerNumero("abc").valor).toBeNull();
  });
  it("tabela colada do Excel com cabeçalhos variados", () => {
    const t = "Amostra\tCálcio (mg/L)\tMg²⁺\tNa\tK\tHCO3\tSO4\tCloreto\nPM-01\t45\t12\t15\t3\t180\t20\t22\n";
    const r = lerTabela(t);
    expect(r.amostras).toHaveLength(1);
    expect(r.amostras[0].nome).toBe("PM-01");
    expect(r.amostras[0].valores).toMatchObject({ Ca: 45, Mg: 12, Cl: 22 });
  });
});
