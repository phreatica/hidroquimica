import type { IonId } from "./ions";

export type TratamentoND = "zero" | "metade-lq" | "lq";

export interface ValorLido {
  valor: number | null; // null = vazio ou inválido
  censurado: boolean; // true quando veio como "<LQ"
  original: string;
}

/**
 * Lê um número no formato brasileiro ou internacional.
 * Aceita "12,5", "12.5", "1.234,5", "1,234.5", "<0,5", "< 0.5", "ND", "n.d.", "-", "" e notação científica.
 */
export function lerNumero(texto: string, tratamento: TratamentoND = "zero"): ValorLido {
  const original = texto;
  let t = texto.trim();
  if (t === "" || t === "-" || t === "—") return { valor: null, censurado: false, original };
  if (/^(n\.?\s?d\.?|nd|<\s*lq|<\s*ld)$/i.test(t)) return { valor: 0, censurado: true, original };

  let censurado = false;
  if (t.startsWith("<")) {
    censurado = true;
    t = t.slice(1).trim();
  }
  t = t.replace(/\s/g, "");

  const temVirgula = t.includes(",");
  const temPonto = t.includes(".");
  if (temVirgula && temPonto) {
    // o último separador é o decimal
    if (t.lastIndexOf(",") > t.lastIndexOf(".")) t = t.replace(/\./g, "").replace(",", ".");
    else t = t.replace(/,/g, "");
  } else if (temVirgula) {
    t = t.replace(",", ".");
  }

  const n = Number(t);
  if (!Number.isFinite(n)) return { valor: null, censurado: false, original };
  if (!censurado) return { valor: n, censurado, original };

  const valor = tratamento === "zero" ? 0 : tratamento === "metade-lq" ? n / 2 : n;
  return { valor, censurado, original };
}

const SINONIMOS: Record<IonId, RegExp> = {
  Ca: /^(ca|ca2\+|ca\+\+|c[aá]lcio)$/i,
  Mg: /^(mg|mg2\+|mg\+\+|magn[eé]sio)$/i,
  Na: /^(na|na\+|s[oó]dio)$/i,
  K: /^(k|k\+|pot[aá]ssio)$/i,
  Fe: /^(fe|fe2\+|ferro)$/i,
  NH4: /^(nh4|nh4\+|am[oô]nio|amônia)$/i,
  HCO3: /^(hco3|hco3-|bicarbonato)$/i,
  CO3: /^(co3|co3--|co32-|co3 2-|carbonato)$/i,
  SO4: /^(so4|so4--|so42-|so4 2-|sulfato)$/i,
  Cl: /^(cl|cl-|cloreto)$/i,
  NO3: /^(no3|no3-|nitrato)$/i,
  F: /^(f|f-|fluoreto)$/i,
};

export type ColunaMapeada = { tipo: "ion"; ion: IonId } | { tipo: "amostra" } | { tipo: "grupo" } | { tipo: "ignorar" };

function limparCabecalho(h: string): string {
  return h
    .trim()
    .replace(/\(.*?\)/g, "") // remove "(mg/L)"
    .replace(/mg\/l|meq\/l/gi, "")
    .replace(/[⁺⁻²³₂₃₄]/g, (c) => ({ "⁺": "+", "⁻": "-", "²": "2", "³": "3", "₂": "2", "₃": "3", "₄": "4" })[c] ?? c)
    .trim();
}

export function mapearCabecalho(h: string): ColunaMapeada {
  const c = limparCabecalho(h);
  if (/^(amostra|ponto|po[cç]o|id|nome|sample|c[oó]digo)$/i.test(c)) return { tipo: "amostra" };
  if (/^(grupo|campanha|aqu[ií]fero|group|classe)$/i.test(c)) return { tipo: "grupo" };
  for (const [ion, re] of Object.entries(SINONIMOS) as [IonId, RegExp][]) {
    if (re.test(c)) return { tipo: "ion", ion };
  }
  return { tipo: "ignorar" };
}

/** Detecta o separador de uma tabela colada (tab > ponto e vírgula > vírgula). */
export function detectarSeparador(texto: string): string {
  const linha = texto.split(/\r?\n/).find((l) => l.trim() !== "") ?? "";
  if (linha.includes("\t")) return "\t";
  if (linha.includes(";")) return ";";
  return ",";
}

export interface AmostraLida {
  nome: string;
  grupo: string;
  valores: Partial<Record<IonId, number>>;
  censurados: IonId[];
}

export interface ResultadoLeitura {
  amostras: AmostraLida[];
  colunas: { cabecalho: string; mapa: ColunaMapeada }[];
  avisos: string[];
}

/** Lê uma tabela colada do Excel/CSV com cabeçalho na primeira linha. */
export function lerTabela(texto: string, tratamento: TratamentoND = "zero"): ResultadoLeitura {
  const sep = detectarSeparador(texto);
  const linhas = texto
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+$/, ""))
    .filter((l) => l.trim() !== "");
  const avisos: string[] = [];
  if (linhas.length < 2) return { amostras: [], colunas: [], avisos: ["Cole ao menos o cabeçalho e uma linha de dados."] };

  const cab = linhas[0].split(sep);
  const colunas = cab.map((c) => ({ cabecalho: c.trim(), mapa: mapearCabecalho(c) }));
  if (!colunas.some((c) => c.mapa.tipo === "ion")) {
    avisos.push("Nenhuma coluna de íon reconhecida. Use cabeçalhos como Ca, Mg, Na, K, HCO3, CO3, SO4, Cl.");
  }

  const amostras: AmostraLida[] = [];
  linhas.slice(1).forEach((linha, i) => {
    const cel = linha.split(sep);
    const a: AmostraLida = { nome: `Amostra ${i + 1}`, grupo: "", valores: {}, censurados: [] };
    colunas.forEach((col, j) => {
      const v = (cel[j] ?? "").trim();
      if (col.mapa.tipo === "amostra" && v) a.nome = v;
      else if (col.mapa.tipo === "grupo") a.grupo = v;
      else if (col.mapa.tipo === "ion") {
        const lido = lerNumero(v, tratamento);
        if (lido.valor !== null) a.valores[col.mapa.ion] = lido.valor;
        else if (v) avisos.push(`Linha ${i + 2}: valor "${v}" em ${col.cabecalho} não reconhecido e ignorado.`);
        if (lido.censurado) a.censurados.push(col.mapa.ion);
      }
    });
    amostras.push(a);
  });
  return { amostras, colunas, avisos };
}
