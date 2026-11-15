# hidroquimica

[![npm](https://img.shields.io/npm/v/hidroquimica)](https://www.npmjs.com/package/hidroquimica)
[![licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue)](LICENSE)

**Hidroquímica em TypeScript, sem dependências:** conversões mg/L ↔ meq/L ↔ mmol/L, balanço iônico com critério de aceitação selecionável, coordenadas do diagrama de Piper, diagramas de Stiff e Schoeller, fácies pelo íon dominante e leitura de resultados de laboratório no formato brasileiro (`12,5`, `<0,5`, `ND`).

É o núcleo de cálculo das ferramentas grátis da **[Phreatica](https://phreatica.com)**:
- **[Diagrama de Piper online](https://phreatica.com/ferramentas/diagrama-de-piper/)**
- [Diagrama de Stiff](https://phreatica.com/ferramentas/diagrama-de-stiff/) e [Schoeller](https://phreatica.com/ferramentas/diagrama-de-schoeller/)
- [Balanço iônico](https://phreatica.com/ferramentas/balanco-ionico/)
- [Conversor mg/L ↔ meq/L](https://phreatica.com/ferramentas/conversor-mg-meq/)

📖 Documentação: **https://phreatica.github.io/hidroquimica/** · Fórmulas e validação: [phreatica.com/metodologia](https://phreatica.com/metodologia/)

*English below.*

## Instalação

```bash
npm install hidroquimica
```

## Exemplos

```ts
import {
  conjuntoParaMeq, balancoIonico, avaliarCriterio,
  fracoesPiper, geometria, pontoCations, pontoAnions, pontoLosango,
  faciesDominante, lerTabela,
} from "hidroquimica";

// 1. mg/L → meq/L
const meq = conjuntoParaMeq({ Ca: 45, Mg: 12, Na: 15, K: 3, HCO3: 180, SO4: 20, Cl: 22 });

// 2. Balanço iônico e critério (APHA 1030 E, ±5% ou ±10%)
const b = balancoIonico(meq);            // { somaCations, somaAnions, erroPercentual, ... }
avaliarCriterio(b, "apha-1030e");        // { dentro: true, limiteTexto: "±2% (...)" }

// 3. Coordenadas do Piper (triângulo de lado 1; desenhe no seu SVG/canvas)
const f = fracoesPiper(meq)!;
const g = geometria(0.2);
pontoCations(f); pontoAnions(f, g); pontoLosango(f, g);
faciesDominante(f).rotulo;               // "bicarbonatada cálcica"

// 4. Ler uma tabela colada do Excel (tab, ; ou ,), com vírgula decimal e "<LQ"
const { amostras } = lerTabela("Amostra\tCa\tMg\nPM-01\t45\t<0,5", "metade-lq");
```

## O que tem

| Módulo | Funções |
|---|---|
| Íons | `IONS` (massa molar, carga), `CATIONS`, `ANIONS` |
| Conversões | `converter`, `mgParaMeq`, `meqParaMg`, `conjuntoParaMeq`, `durezaTotal`, `meqParaCaCO3` |
| Balanço iônico | `balancoIonico`, `avaliarCriterio`, `CRITERIOS` |
| Piper | `fracoesPiper`, `geometria`, `pontoCations`, `pontoAnions`, `pontoLosango`, `faciesDominante` |
| Stiff / Schoeller | `eixosStiff`, `poligonoStiff`, `serieSchoeller`, `decadasLog` |
| Leitura | `lerNumero`, `lerTabela`, `mapearCabecalho` |

## Princípios
- **Caixa-aberta:** toda fórmula está documentada e testada. A biblioteca calcula; a interpretação é do profissional.
- **Sem dependências** e sem acesso a rede: roda no navegador, no Node, em Workers e no Deno.
- Escrita a partir da literatura (Piper, 1944; Stiff, 1951; Schoeller, 1955; APHA 1030 E), sem código de terceiros.

## Como citar
Use o arquivo [`CITATION.cff`](CITATION.cff) (o GitHub mostra "Cite this repository") ou o DOI do Zenodo de cada versão.

---

## English

**Dependency-free hydrochemistry toolkit in TypeScript:** mg/L ↔ meq/L ↔ mmol/L conversions, ion balance with selectable acceptance criteria (APHA 1030 E, ±5%, ±10%), Piper diagram coordinates, Stiff and Schoeller diagrams, dominant-ion facies and parsing of lab results (Brazilian decimal comma, `<LOQ`, `ND`). It powers the free online tools at **[phreatica.com](https://phreatica.com)** (Piper, Stiff, Schoeller, ion balance). Function names are in Portuguese; see the table above and the [documentation](https://phreatica.github.io/hidroquimica/).

## Licença / License
MIT © Phreatica
