---
title: hidroquimica — documentação
---

# hidroquimica

Biblioteca **open-source (MIT)** de hidroquímica em TypeScript, sem dependências. É o núcleo de cálculo das ferramentas grátis da **[Phreatica](https://phreatica.com)**, plataforma de hidroquímica e monitoramento de áreas contaminadas.

> **Prefere usar sem programar?** As mesmas funções estão disponíveis online, de graça e sem cadastro:
> - [Diagrama de Piper online](https://phreatica.com/ferramentas/diagrama-de-piper/)
> - [Diagrama de Stiff](https://phreatica.com/ferramentas/diagrama-de-stiff/)
> - [Diagrama de Schoeller](https://phreatica.com/ferramentas/diagrama-de-schoeller/)
> - [Calculadora de balanço iônico](https://phreatica.com/ferramentas/balanco-ionico/)
> - [Conversor mg/L ↔ meq/L](https://phreatica.com/ferramentas/conversor-mg-meq/)

## Instalação

```bash
npm install hidroquimica
```

## Conversões

`meq/L = mg/L × |z| ÷ M`, em que M é a massa molar (g/mol) e z a carga do íon.

```ts
import { converter, conjuntoParaMeq, durezaTotal } from "hidroquimica";

converter("Ca", 100, "mg/L", "meq/L");   // 4,990
conjuntoParaMeq({ Ca: 45, Cl: 22 });      // { Ca: 2,246, Cl: 0,621 }
durezaTotal(70, 35);                      // 318,9 mg/L de CaCO₃
```

## Balanço iônico

`erro (%) = 100 × (Σ cátions − Σ ânions) ÷ (Σ cátions + Σ ânions)`, com concentrações em meq/L.

Critérios disponíveis em `avaliarCriterio(balanco, criterio)`:

| `criterio` | Regra |
|---|---|
| `"apha-1030e"` | Σ ânions ≤ 3,0 meq/L → ±0,2 meq/L; de 3,0 a 10,0 → ±2%; de 10,0 a 800 → ±5% |
| `"fixo-5"` | ±5% |
| `"fixo-10"` | ±10% |

A função informa **dentro ou fora do critério escolhido**. Ela não declara a análise "válida".

## Diagrama de Piper

Frações em meq/L (Ca, Mg, Na+K; HCO₃+CO₃, SO₄, Cl) e coordenadas num triângulo de lado 1:

- cátions: `x = fNaK + fMg/2`, `y = fMg·√3/2`
- ânions: deslocados de `1 + d`
- losango: `P = L + a·(B − L) + b·(T − L)`, com `a = fNaK` e `b = fCl + fSO₄`

O ponto do losango é a interseção das projeções a 60° e 120° dos pontos dos triângulos, o que é verificado em teste.

```ts
const f = fracoesPiper(meq);
const g = geometria(0.2);           // d = 0,2 (vão entre os triângulos)
const p = pontoLosango(f, g);       // multiplique por um fator de escala e inverta o eixo y para SVG
```

## Stiff e Schoeller

- `poligonoStiff(eixosStiff(meq))`: seis vértices (x em meq/L, cátions negativos), nas linhas Na+K|Cl, Ca|HCO₃+CO₃ e Mg|SO₄.
- `serieSchoeller(meq)`: valores na ordem Ca, Mg, Na+K, Cl, SO₄, HCO₃+CO₃; zeros viram `null`, porque não existe log de zero.

## Leitura de dados de laboratório

`lerNumero("1.234,5")` → 1234,5 · `lerNumero("<0,5", "metade-lq")` → 0,25 (censurado) · `lerTabela(texto)` reconhece cabeçalhos como "Cálcio (mg/L)", "Mg²⁺" e "Cloreto".

## Referências
- PIPER, A. M. (1944). A graphic procedure in the geochemical interpretation of water-analyses. *Trans. AGU*, 25(6), 914–928.
- STIFF, H. A. (1951). The interpretation of chemical water analysis by means of patterns. *J. Petroleum Technology*, 3(10), 15–17.
- SCHOELLER, H. (1955). Géochimie des eaux souterraines. *Revue de l'Institut Français du Pétrole*, 10.
- APHA/AWWA/WEF. *Standard Methods for the Examination of Water and Wastewater*, 1030 E.

---

Código no GitHub: [phreatica/hidroquimica](https://github.com/phreatica/hidroquimica) · Feito pela [Phreatica](https://phreatica.com) · Do mesmo ecossistema: [Estrato Perfis](https://estratoperfis.com.br) e [Rhoa Geo](https://rhoageo.com)
