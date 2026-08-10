# 10. Curando um Campo Semântico inteiro {#s10}

Os capítulos anteriores mostram como curar **um** conceito. Este capítulo é o método para curar
**um campo inteiro** de uma vez — como foi feito com o campo "Tipos de Usos de Plantas" em
2026-08-07 (713 → 333 conceitos vivos).

## 10.1 O que é um Campo Semântico {#s10-1}

Não é um campo próprio do conceito: é o array `sourceFields`, que a aquisição preenche com o
caminho do campo de origem no registro do BioCultDB. Distribuição real hoje:

| `sourceFields` | Conceitos |
|---|---:|
| `comunidades.plantas.nomeVernacular` | 982 |
| ~~`comunidades.plantas.nomeCientifico`~~ | ~~864~~ — **removido do vocabulário em 2026-08-10** |
| `comunidades.plantas.tipoUso` | **713, já curado** |
| `comunidades.atividadesEconomicas` | 36 |
| `comunidades.tipo` | 9 |

> **`comunidades.plantas.nomeCientifico` saiu do escopo de curadoria em 2026-08-10.** Não existe
> decisão de curadoria legítima a tomar sobre um binômio latino: nome aceito, sinônimo e basiônimo
> são regidos pelo ICN e verificáveis em WFO/IPNI/GBIF. Os 864 conceitos foram **removidos** do
> `etnotermos` — e a medição feita antes confirmou a decisão: nenhum deles tinha rótulo `alt`,
> definição ou nota de escopo. O nome científico permanece **dado da Evidência no BioCultDB**, que
> não foi tocado. Ver
> `BioCultDB/docs/curadoria/decisao-nomes-cientificos-fora-de-escopo.md`.

Um conceito pode pertencer a mais de um campo ([§7.6](07-guia-de-decisao.md#s7-6)).

## 10.2 As cinco fases {#s10-2}

Cada fase é verificável antes da seguinte, e reescreve o trabalho de curador nestes termos:

1. **Criar o esqueleto** — as facetas e os conceitos-pai, com definição e nota de escopo, e
   ligá-los entre si (a campanha criou 31 pais novos e promoveu 6 que já existiam).
2. **Absorver rótulos** — para cada termo que é variante, adicionar o rótulo (`alt` ou `hidden`)
   no conceito-alvo **e** depreciar o conceito de origem apontando o alvo.
3. **Montar a hierarquia** — `broader` nos sobreviventes, com a recíproca `narrower` e a cascata
   de ancestrais automáticas; o ciclo é bloqueado pelo sistema.
4. **Definições e ativação** — definição só nos nós da taxonomia
   ([§4.1](04-definicao-e-notas.md#s4-1)), depois ativar os inequívocos.
5. **Conferir** — [§10.4](#s10-4).

Volumes reais por fase:

| Fase | Operação | Volume | Tempo |
|---|---|---:|---:|
| 1 | conceitos-pai criados | 31 | 1 s |
| 1 | `POST /broader` do esqueleto | 28 | 3 s |
| 2 | `POST /labels` — 357 `alt` + 33 `hidden` | 390 | 30 s |
| 2 | `POST /deprecate` — 357 ALT + 9 HID + 12 HID2 + 33 DEP | 411 | 87 s |
| 3 | `POST /broader` dos sobreviventes | 290 | 59 s |
| 4 | `PUT /concepts/:id` — 38 definições, 8 notas de escopo, 2 notas históricas | 48 | 6 s |
| 4 | `POST /activate` | 304 | 62 s |

## 10.3 Revisar a proposta antes de escrever {#s10-3}

A campanha produziu uma proposta termo a termo **antes** de tocar no vocabulário, com uma **lista
curta dos casos duvidosos** no topo. Por que isso paga: das quatro divergências que o curador
encontrou na revisão, três estavam na lista curta (`banho`, `quengo`, `anticorpos`) e uma estava
**fora** dela, entre as absorções tidas por óbvias (`sedação` → `sedativo`). Ou seja: a lista curta
cumpre a função, e a revisão das linhas "com confiança" ainda acha erro.

| Termo | Proposto | Executado | Por quê |
|---|---|---|---|
| `banho` | manter sem ativar, sob `ritual e espiritual` | manter sob **`forma de preparo e administração`**, `active` | não é uso ritual, é via de administração medicinal |
| `quengo` | manter sem ativar, sob `material e tecnológico` | mesma posição, **`active`**, com a definição *"cuia feita da casca do coco"* | a dúvida era de significado, não de posição |
| `anticorpos` | manter sem ativar, sob `alergias e problemas imunológicos` | **depreciar → `indeterminado`** | não nomeia um uso |
| `sedação` | → rótulo alt de `sedativo` | **conceito próprio**, sob `ação farmacológica`, `active` | `sedação` é o estado obtido, `sedativo` é a propriedade da planta |

## 10.4 O que conferir no fim {#s10-4}

Traduzida em pergunta de curador, a lista de verificação da campanha:

- As contagens batem com o plano?
- Todo conceito ativo tem `broader` ou é faceta raiz?
- Nenhum conceito é ancestral de si mesmo?
- Toda relação `broader` tem a `narrower` recíproca?
- Nenhum pai depreciado com filho ativo?
- Há entrada de auditoria para cada operação?
- **A curadoria sobrevive a uma execução de aquisição?**
- A consulta pública responde?

Resultados reais como referência: **305 ativos / 28 `candidate` / 411 depreciados**, total 744,
1509 entradas de auditoria, `criados=0` no ciclo de aquisição seguinte.

## 10.5 Os próximos campos são diferentes {#s10-5}

**`nomeVernacular` é o campo sensível.** O CARE deixa de ser teórico: povo de origem por rótulo,
possível `restricted`/`sacred`, e o desempate de preferencial entre nomes co-iguais precisa da
nota de escopo prescrita em [§3.5](03-rotulos.md#s3-5) e da regra de ouro de
[§7.2](07-guia-de-decisao.md#s7-2).

**`nomeCientifico` deixou de ser conceito neste vocabulário** — a questão da fusão com
`nomeVernacular` não se coloca mais aqui; ver [§7.3](07-guia-de-decisao.md#s7-3).

## 10.6 O que ficou em aberto na campanha dos tipos de uso {#s10-6}

Dívida declarada, não escondida:

- **Definição dos ~265 conceitos-folha.** Sai como proposta a revisar, no mesmo formato desta
  campanha.
- **Os 27 `candidate` duvidosos.** Cada um tem a razão da dúvida registrada; quatro (`panos`,
  `batidas`, `apertar os dentes`, `sustento`) seguem sem pai, de propósito.
- **Nenhuma relação RT foi criada** — o plano não as previa. `gripe` ↔ `resfriado` é o caso óbvio
  a considerar numa próxima passada.

O registro completo da campanha está em
[`docs/curadoria/tipos-de-uso`](https://github.com/edalcin/BioCultDB/tree/main/docs/curadoria/tipos-de-uso).
