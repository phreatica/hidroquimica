import { ANIONS, CATIONS, type Concentracoes } from "./ions";

export interface BalancoIonico {
  somaCations: number; // meq/L
  somaAnions: number; // meq/L
  erroPercentual: number; // 100 × (Σc − Σa) / (Σc + Σa)
  diferencaAbsoluta: number; // Σc − Σa (meq/L)
}

/** Calcula o balanço iônico a partir de concentrações em meq/L. */
export function balancoIonico(meq: Concentracoes): BalancoIonico {
  const somaCations = CATIONS.reduce((s, id) => s + (meq[id] ?? 0), 0);
  const somaAnions = ANIONS.reduce((s, id) => s + (meq[id] ?? 0), 0);
  const total = somaCations + somaAnions;
  const diferencaAbsoluta = somaCations - somaAnions;
  return {
    somaCations,
    somaAnions,
    diferencaAbsoluta,
    erroPercentual: total > 0 ? (100 * diferencaAbsoluta) / total : 0,
  };
}

export type CriterioId = "apha-1030e" | "fixo-5" | "fixo-10";

export interface Criterio {
  id: CriterioId;
  nome: string;
  referencia: string;
  descricao: string;
}

export const CRITERIOS: Criterio[] = [
  {
    id: "apha-1030e",
    nome: "Standard Methods (APHA 1030 E)",
    referencia: "APHA/AWWA/WEF, Standard Methods for the Examination of Water and Wastewater, seção 1030 E",
    descricao:
      "Tolerância variável com a soma de ânions: até 3,0 meq/L → diferença de ±0,2 meq/L; de 3,0 a 10,0 meq/L → ±2%; de 10,0 a 800 meq/L → ±5%.",
  },
  {
    id: "fixo-5",
    nome: "Limite fixo de ±5%",
    referencia: "Critério fixo definido pelo usuário",
    descricao: "Aceita |erro| ≤ 5%, independentemente da concentração.",
  },
  {
    id: "fixo-10",
    nome: "Limite fixo de ±10%",
    referencia: "Critério fixo definido pelo usuário",
    descricao: "Aceita |erro| ≤ 10%, independentemente da concentração (comum para águas pouco mineralizadas).",
  },
];

export interface ResultadoCriterio {
  dentro: boolean;
  limiteTexto: string;
}

/** Compara o balanço com o critério selecionado. Retorna um resultado objetivo, sem julgamento sobre a amostra. */
export function avaliarCriterio(b: BalancoIonico, criterio: CriterioId): ResultadoCriterio {
  const erro = Math.abs(b.erroPercentual);
  switch (criterio) {
    case "fixo-5":
      return { dentro: erro <= 5, limiteTexto: "±5%" };
    case "fixo-10":
      return { dentro: erro <= 10, limiteTexto: "±10%" };
    case "apha-1030e": {
      const a = b.somaAnions;
      if (a <= 3.0) {
        return { dentro: Math.abs(b.diferencaAbsoluta) <= 0.2, limiteTexto: "±0,2 meq/L (Σ ânions ≤ 3,0 meq/L)" };
      }
      if (a <= 10.0) {
        return { dentro: erro <= 2, limiteTexto: "±2% (Σ ânions entre 3,0 e 10,0 meq/L)" };
      }
      return { dentro: erro <= 5, limiteTexto: "±5% (Σ ânions entre 10,0 e 800 meq/L)" };
    }
  }
}
