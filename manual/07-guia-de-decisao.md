# 7. Guia de decisão: qual mecanismo usar? {#s7}

Esta é a pergunta que mais gera dúvida: *"os termos X e Y são a mesma coisa — uso rótulo
alternativo ou relação de sinônimo? E se não forem a mesma coisa?"*

A diferença crucial é de **nível**:

- **Rótulo alternativo** = outro nome para a **MESMA linha** do banco (o mesmo conceito, o mesmo
  `id`). Não cria nada novo — só acrescenta um nome ao conceito que você está editando.
- **Relação de sinônimo** = **UMA linha apontando para outra** (dois conceitos, dois `id`s, cada
  um com sua própria definição e história).

Fluxo de decisão para dois termos parecidos:

```mermaid
graph TD
    Q1{"Os dois termos significam<br/>a mesma coisa?"}
    Q1 -->|Não| Q2{"Um é um caso<br/>específico do outro?"}
    Q1 -->|Sim| Q3{"Já existem como DOIS<br/>conceitos separados no banco?"}

    Q2 -->|Sim| R_HIER["Hierarquia:<br/>Mais amplo / Mais específico<br/>ex: dor de cabeça → dor"]
    Q2 -->|"Não, só se associam"| R_REL["Relacionado (RT)<br/>ex: gripe ↔ resfriado"]

    Q3 -->|"Não, é um conceito só"| R_LABEL["Rótulo alternativo (ou oculto)<br/>no mesmo conceito<br/>ex: gripes = alt de gripe"]
    Q3 -->|"Sim, e quero preservar<br/>a história dos dois"| R_SYN["Relação de Sinônimo (aceito)<br/>ex: tranquilizante → calmante"]
```

A mesma decisão, na ordem em que a curadoria do campo "Tipos de Usos de Plantas" aplicou cada
teste:

| Situação no corpus | Decisão | Exemplo |
|---|---|---|
| Plural do mesmo termo | rótulo **alternativo** | `gripes` → `gripe` |
| Variante de regência | rótulo **alternativo** | `dor de estômago`, `dores estomacais` → `dor no estômago` |
| Grafia incorreta ou pré-Acordo | rótulo **oculto** | `diarréia`, `gazes`, `hemorróidas` |
| Termo em inglês | rótulo **alternativo**, `language: eng` | `headache` → `dor de cabeça` |
| Caso específico de outro | **hierarquia** (`broader`) | `dor de cabeça` → `dor` |
| Distintos mas associados | **relacionado (RT)** | `gripe` ↔ `resfriado` |
| Termo composto (nomeia dois conceitos) | **rótulo oculto nos dois** + depreciar apontando o primeiro ([§7.4](#s7-4)) | `gripe e tosse` → oculto em `gripe` e em `tosse` |
| Qualificador colado (um conceito + detalhe do artefato) | **depreciar** apontando o núcleo ([§7.5](#s7-5)) | `construção (caibros e ripas…)` → `construção` |
| Sem conteúdo informativo | **depreciar** → `indeterminado` | `outros`, `dúvida` |
| Pertence a outro campo | **não tocar** ([§7.6](#s7-6)) | `fumo` |

**Preferência recomendada:** sempre que possível, prefira **um conceito com vários rótulos** em
vez de vários conceitos ligados por sinônimo. A relação de sinônimo é a **exceção** (para quando
juntar apagaria proveniência), não a regra. Um vocabulário com muitos conceitos "sinônimos" uns
dos outros, quando poderiam ser um só, é mais difícil de manter.

### 7.1 O caso clássico: trocar qual rótulo é o preferido {#s7-1}

Situação real: o conceito foi criado com o preferencial `alimentação`, mas você decide que o
termo preferido deveria ser `alimentar` (ou o inverso). Você **não** troca o tipo do rótulo
diretamente (isso deixaria o conceito sem nenhum preferencial por um instante). O fluxo correto:

1. Adicione o novo nome como rótulo **Alternativo** (formulário "+ Adicionar Rótulo").
2. No card desse novo rótulo, clique em **"★ Tornar Preferencial"**.

O sistema promove o novo a preferencial e rebaixa o antigo a alternativo **na mesma operação**,
sem nunca passar por um estado inválido. Tudo continua sendo **um conceito só**.

### 7.2 Nomes vernaculares do mesmo conceito: alternativo, não relacionado {#s7-2}

Dois ou mais nomes vernaculares para a **mesma planta** são, por padrão, **rótulos alternativos de
um único conceito** — nunca conceitos separados ligados por "Relacionado". É a regra de ouro
([§2](02-termo-e-conceito.md#s2)) aplicada a nomes populares: mesmo significado → **um conceito,
vários rótulos**.

- Ex.: `gervão`, `gervão-roxo` e `rinchão` usados pela comunidade para a mesma planta → **um**
  conceito, um `pref` (âncora de exibição, [§3.5](03-rotulos.md#s3-5)) e os demais como `alt`.
- **"Relacionado (RT)" estaria errado** aqui: RT liga dois conceitos **distintos** (como
  `gripe` ↔ `resfriado`, [§6.2](06-relacoes-semanticas.md#s6-2)). Usá-lo para nomes da mesma planta
  fragmentaria a espécie em vários conceitos e apagaria o fato de que são o mesmo.

**A exceção (etnotaxonomia).** O teste não é "mesma espécie científica" — é *"**mesma unidade de
significado para quem usa o nome**"*. Às vezes a comunidade **distingue** dois nomes como plantas
diferentes (por morfotipo, sexo, estágio ou uso), embora o botânico os agrupe numa só espécie
(sobre-diferenciação — ver [§7.3](#s7-3)).
Nesse caso são **dois etnotáxons distintos**:

- ligue-os entre si por **Relacionado (RT)** (associados, mas distintos);
- e mapeie **cada um** ao mesmo nome científico.

```mermaid
graph TD
    Q{"A comunidade trata os<br/>nomes como a MESMA planta?"}
    Q -->|Sim| A["Um conceito<br/>· 1 pref + demais alt<br/>(rótulos alternativos)"]
    Q -->|"Não, são plantas<br/>diferentes para ela"| R["Dois conceitos<br/>· ligados por Relacionado (RT)<br/>· cada um mapeado ao nome científico"]
```

> **Compartilhar a espécie científica não basta** para ser o mesmo conceito. Co-referência não é
> identidade conceitual: quem decide se é um ou dois conceitos é a distinção de significado na
> comunidade, não a determinação taxonômica.

### 7.3 Nome científico × nome vernacular: dois conceitos, não um {#s7-3}

Pergunta natural: se o nome científico e o nome vernacular apontam para "a mesma espécie", não
deveriam ser **um só conceito** (o científico como `pref/lat`, o vernacular como `pref/por`)?
**Não.** Eles **co-referem** — apontam para plantas sobrepostas no mundo real — mas **não são o
mesmo conceito**. Co-referência não é identidade conceitual ([§2](02-termo-e-conceito.md#s2)). São
**dois conceitos distintos**, cada um no seu campo, ligados por uma relação de **mapeamento** (na
paleta atual da tela, o análogo é **Relacionado (RT)**). Três razões:

**1. Etnotaxonomia ≠ taxonomia científica.** O nome vernacular denota um *etnotáxon* — uma unidade
de classificação **cultural**, que raramente casa 1:1 com a espécie lineana:

- **Sub-diferenciação:** um vernacular cobre **várias** espécies (ex.: `gervão` → várias
  *Stachytarpheta*).
- **Sobre-diferenciação:** **vários** vernaculares (por morfotipo, sexo, estágio, uso) para **uma**
  espécie — é justamente a exceção de [§7.2](#s7-2).
- **Homonímia regional:** o mesmo vernacular para espécies não aparentadas em regiões diferentes; e
  uma espécie com dezenas de vernaculares por povo/língua.

**2. O nome científico tem estrutura própria.** Sob o **ICN** (código internacional de nomenclatura
botânica), uma espécie carrega nome aceito, basiônimo, sinônimos e autoria — uma **rede de
sinonímia** que o BioCultTermos modela com "Sinônimo de (aceito)"
([§6.3](06-relacoes-semanticas.md#s6-3)) e depreciação ([§5](05-ciclo-de-vida.md#s5)).
Rebaixar o científico a um mero rótulo de um conceito fundido apagaria essa estrutura.

**3. Governanças diferentes.** O científico é regido pelo ICN (objetivo, verificável em WFO/IPNI,
público). O vernacular é regido pela **comunidade** (CARE, [§3.3](03-rotulos.md#s3-3)), com
proveniência por povo ([§3.4](03-rotulos.md#s3-4)) e podendo ser `restricted`/`sacred`. Fundir os
dois forçaria um binômio latino público e um nome tradicional (às vezes sagrado) a dividir o mesmo
`accessLevel` e a mesma autoridade — o que é incorreto.

Como fica na prática — dois conceitos, uma ponte de mapeamento:

```mermaid
graph LR
    subgraph Cientifico["Campo: Nomes Científicos (ICN)"]
        SCI["<i>Stachytarpheta cayennensis</i>"]
    end
    subgraph Vernacular["Campo: Nomes Vernaculares (etnotáxon, CARE)"]
        VER["gervão<br/>(povo, accessLevel)"]
    end
    VER -. "Relacionado (RT) / mapeamento" .-> SCI
```

> **Alinha com o Darwin Core** (referência no rodapé): DwC trata `scientificName` como identidade
> do táxon e `vernacularName` como atributo **associado** — associação, não identidade.

### 7.4 Termos compostos: preserve as duas metades {#s7-4}

Um termo que nomeia **dois** conceitos entra como rótulo **oculto em ambos**, e a depreciação
aponta o primeiro — porque a API aceita um `replacedById` só, então a escolha do "principal" é
administrativa, não perda de dado.

O caso que fixa a regra: um artigo dizia que a planta trata **gripe e tosse**; apontar só `gripe`
apagaria a tosse do registro. Os 12 termos compostos reais da campanha:

| Termo composto | Oculto em | Depreciado apontando |
|---|---|---|
| `gripe e tosse` | `gripe` + `tosse` | `gripe` |
| `gripe e resfriado` | `gripe` + `resfriado` | `gripe` |
| `asma e tosse` | `asma` + `tosse` | `asma` |
| `dor e inflamação` | `dor` + `inflamação` | `dor` |
| `dor de dente e cabeça` | `dor de dente` + `dor de cabeça` | `dor de dente` |
| `colesterol e diabetes` | `colesterol` + `diabetes` | `colesterol` |
| `fígado e estômago` | `problemas do fígado` + `problemas digestivos` | `problemas do fígado` |
| `estômago e fígado` | `problemas digestivos` + `problemas do fígado` | `problemas digestivos` |
| `fígado e rins` | `problemas do fígado` + `problemas renais` | `problemas do fígado` |
| `tratamento de fígado e rins` | `problemas do fígado` + `problemas renais` | `problemas do fígado` |
| `tratamento de rins e fígado` | `problemas renais` + `problemas do fígado` | `problemas renais` |
| `uterus, urinary and ovary infection` | `problemas ginecológicos e obstétricos` + `problemas renais` | `problemas ginecológicos e obstétricos` |

A unicidade de rótulo é **intra-conceito**: o mesmo `literalForm` em dois conceitos diferentes é
válido.

### 7.5 Qualificadores entre parênteses: só depreciar {#s7-5}

Ao contrário do [§7.4](#s7-4), aqui **não** há dois conceitos: há um conceito e um detalhe do
artefato, que pertence ao registro de origem no BioCultDB, não ao vocabulário. A operação é
depreciar apontando o núcleo.

Exemplos reais: `construção (caibros e ripas com estipe)` e `construção (esteios com estipe)` →
`construção`; `utensílios (moenda de cana e mundéu com estipe)` → `utensílio`;
`medicinal (seiva do palmito jovem para desinfecção, anestésico, coagulação do sangue)` →
`medicinal`; `alimentação (palmito)` e `alimentação (vinho dos frutos)` → `alimentar`;
`calmante (nervoso)`, `calmante infantil`, `calmante para os nervos` → `calmante`.

### 7.6 Termo do campo errado: não tocar {#s7-6}

O caso `fumo`: ele aparece no campo "tipos de uso" mas é nome vernacular; um conceito pode
pertencer a **mais de um Campo Semântico** (`fumo`, `artesanato` e `pesca` têm dois
`sourceFields`). Diante de um termo cujo lugar é outro campo, a operação correta é **nenhuma** —
não depreciar, não absorver: ele será curado quando aquele campo for curado.
