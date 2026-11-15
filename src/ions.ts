/**
 * Íons maiores e menores usados nos cálculos hidroquímicos.
 * Massas molares (g/mol) a partir dos pesos atômicos padrão IUPAC (valores abreviados).
 * meq/L = mg/L × |carga| / massa molar
 */
export type IonId =
  | "Ca"
  | "Mg"
  | "Na"
  | "K"
  | "Fe"
  | "NH4"
  | "HCO3"
  | "CO3"
  | "SO4"
  | "Cl"
  | "NO3"
  | "F";

export type IonKind = "cation" | "anion";

export interface Ion {
  id: IonId;
  nome: string;
  formula: string; // texto com sobrescritos Unicode, para exibição
  massaMolar: number; // g/mol
  carga: number; // valor absoluto
  tipo: IonKind;
}

export const IONS: Record<IonId, Ion> = {
  Ca: { id: "Ca", nome: "Cálcio", formula: "Ca²⁺", massaMolar: 40.078, carga: 2, tipo: "cation" },
  Mg: { id: "Mg", nome: "Magnésio", formula: "Mg²⁺", massaMolar: 24.305, carga: 2, tipo: "cation" },
  Na: { id: "Na", nome: "Sódio", formula: "Na⁺", massaMolar: 22.99, carga: 1, tipo: "cation" },
  K: { id: "K", nome: "Potássio", formula: "K⁺", massaMolar: 39.098, carga: 1, tipo: "cation" },
  Fe: { id: "Fe", nome: "Ferro (II)", formula: "Fe²⁺", massaMolar: 55.845, carga: 2, tipo: "cation" },
  NH4: { id: "NH4", nome: "Amônio", formula: "NH₄⁺", massaMolar: 18.038, carga: 1, tipo: "cation" },
  HCO3: { id: "HCO3", nome: "Bicarbonato", formula: "HCO₃⁻", massaMolar: 61.017, carga: 1, tipo: "anion" },
  CO3: { id: "CO3", nome: "Carbonato", formula: "CO₃²⁻", massaMolar: 60.009, carga: 2, tipo: "anion" },
  SO4: { id: "SO4", nome: "Sulfato", formula: "SO₄²⁻", massaMolar: 96.06, carga: 2, tipo: "anion" },
  Cl: { id: "Cl", nome: "Cloreto", formula: "Cl⁻", massaMolar: 35.453, carga: 1, tipo: "anion" },
  NO3: { id: "NO3", nome: "Nitrato", formula: "NO₃⁻", massaMolar: 62.004, carga: 1, tipo: "anion" },
  F: { id: "F", nome: "Fluoreto", formula: "F⁻", massaMolar: 18.998, carga: 1, tipo: "anion" },
};

export const CATIONS: IonId[] = ["Ca", "Mg", "Na", "K", "Fe", "NH4"];
export const ANIONS: IonId[] = ["HCO3", "CO3", "SO4", "Cl", "NO3", "F"];

/** Íons usados no diagrama de Piper (íons maiores). */
export const PIPER_IONS: IonId[] = ["Ca", "Mg", "Na", "K", "HCO3", "CO3", "SO4", "Cl"];

export type Concentracoes = Partial<Record<IonId, number>>;
