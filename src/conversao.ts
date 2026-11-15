import { IONS, type Concentracoes, type IonId } from "./ions";

export type Unidade = "mg/L" | "mmol/L" | "meq/L";

/** Massa equivalente (g/eq) = massa molar / |carga|. */
export function massaEquivalente(ion: IonId): number {
  const { massaMolar, carga } = IONS[ion];
  return massaMolar / carga;
}

export function mgParaMeq(ion: IonId, mgL: number): number {
  return mgL / massaEquivalente(ion);
}

export function meqParaMg(ion: IonId, meqL: number): number {
  return meqL * massaEquivalente(ion);
}

export function mgParaMmol(ion: IonId, mgL: number): number {
  return mgL / IONS[ion].massaMolar;
}

/** Converte um valor entre mg/L, mmol/L e meq/L para o íon informado. */
export function converter(ion: IonId, valor: number, de: Unidade, para: Unidade): number {
  const { massaMolar, carga } = IONS[ion];
  let mg: number;
  switch (de) {
    case "mg/L":
      mg = valor;
      break;
    case "mmol/L":
      mg = valor * massaMolar;
      break;
    case "meq/L":
      mg = (valor * massaMolar) / carga;
      break;
  }
  switch (para) {
    case "mg/L":
      return mg;
    case "mmol/L":
      return mg / massaMolar;
    case "meq/L":
      return (mg * carga) / massaMolar;
  }
}

/** Expressa uma concentração em meq/L como mg/L de CaCO₃ (massa equivalente do CaCO₃ = 50,04 g/eq). */
export const MASSA_EQ_CACO3 = 100.087 / 2;
export function meqParaCaCO3(meqL: number): number {
  return meqL * MASSA_EQ_CACO3;
}

/** Converte um conjunto de concentrações em mg/L para meq/L (íons ausentes ficam ausentes). */
export function conjuntoParaMeq(conc: Concentracoes, unidade: Unidade = "mg/L"): Concentracoes {
  const out: Concentracoes = {};
  for (const [id, v] of Object.entries(conc) as [IonId, number | undefined][]) {
    if (v === undefined || Number.isNaN(v)) continue;
    out[id] = unidade === "meq/L" ? v : converter(id, v, unidade, "meq/L");
  }
  return out;
}

/** Dureza total como mg/L de CaCO₃ a partir de Ca e Mg em mg/L. */
export function durezaTotal(caMgL: number, mgMgL: number): number {
  return meqParaCaCO3(mgParaMeq("Ca", caMgL) + mgParaMeq("Mg", mgMgL));
}
