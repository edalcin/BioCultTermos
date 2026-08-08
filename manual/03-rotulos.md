# 3. Rótulos (SKOS-XL): nomes que carregam história {#s3}

No BioCultTermos, cada nome de um conceito é um **rótulo** — e um rótulo não é só texto: é um
objeto com metadados próprios. É isso que o "XL" (*eXtension for Labels*) acrescenta ao SKOS
comum, e é exatamente o que o conhecimento tradicional exige.

Por quê? Porque *quem* deu o nome, *em que língua*, e *se ele pode ser divulgado* são
informações tão importantes quanto o nome em si.

### 3.1 Os três tipos de rótulo {#s3-1}

Na tela de edição, seção **"Rótulos (SKOS-XL)"**, ao adicionar um rótulo você escolhe o **Tipo**:

| Tipo | Quando usar | Exemplo (`tipoUso.txt`) |
|---|---|---|
| **Preferencial** (`pref`) | O nome principal do conceito, num idioma. **Só pode haver um por idioma.** É o que aparece em destaque. | `febre` |
| **Alternativo** (`alt`) | Outro nome válido e visível para o **mesmo** conceito: plural, variação regional, sinônimo popular, tradução. | `febres` (plural de `febre`) |
| **Oculto** (`hidden`) | Grafia errada ou forma obsoleta que **não** deve aparecer ao público, mas ajuda a busca a encontrar o conceito. | `gazes` (grafia incorreta de `gases`) |

Exemplos reais de clusters que devem virar **um conceito com vários rótulos** — os clusters
realmente executados na curadoria do campo "Tipos de Usos de Plantas" (2026-08-07):

- Conceito **`gripe`** → alt: `gripes`, `flu`, `prevenir a gripe`.
- Conceito **`gases`** → oculto: `gazes` (grafia incorreta, `proposta.md:355`).
- Conceito **`diarreia`** → oculto: `diarréia` (`proposta.md:205`); alt: `disenteria`
  (`proposta.md:210`).
- Conceito **`hemorroidas`** → oculto: `hemorróidas` (`proposta.md:367`).
- Conceito **`icterícia`** → oculto: `ictéricia` (`proposta.md:378`).
- Conceito **`dor no estômago`** → oculto: `dor de estomago`, `dor no estomago`
  (`proposta.md:233` e `:250`).
- Conceito **`anti-inflamatório`** → alt: `antiinflamatório`; oculto: `inflamation`,
  `inflamamtion` (`proposta.md:405-406`).

Total real da campanha: **9 grafias incorretas viraram rótulo oculto**, nenhuma foi apagada.

### 3.2 Idioma {#s3-2}

Todo rótulo tem um **idioma** (código ISO 639-3 — na tela, o campo *"Idioma (ISO 639-3)"*, com
exemplos `por`, `eng`, `tup…`). Isto é o que permite um mesmo conceito ter o nome preferido em
português **e** o nome preferido numa língua indígena, cada um com seu próprio estatuto. A regra
"um preferencial por idioma" significa que você pode ter, no mesmo conceito, `pref/por` **e**
`pref/tup` ao mesmo tempo — um preferido para cada língua.

A convenção é **ISO 639-3, e só ela** — `por`, `eng`, nunca `pt`. ISO 639-1 não codifica `tup`,
`kgp`, `gub`, as línguas que este vocabulário existe para abrigar; por isso os 2601 conceitos já
gravados no BioCultTermos foram migrados de `pt` para `por`. E a regra prática que a campanha
aplicou 45 vezes: **termo em outro idioma é rótulo alternativo com `language` daquele idioma, não
conceito separado** — `headache` → alt/`eng` de `dor de cabeça`; `cough` → `tosse`;
`kidney stones` → `pedra nos rins`; `high blood pressure` → `pressão alta`;
`intestinal worms` → `verme`; `inflammed throat` → `inflamação na garganta`.

### 3.3 Nível de Acesso (accessLevel) — os Princípios CARE {#s3-3}

Cada rótulo tem um **Nível de Acesso** próprio. É aqui que o sistema materializa o princípio
**Authority to Control** dos [Princípios CARE](https://www.gida-global.org/care): a comunidade
decide o que do seu conhecimento pode ser divulgado, e em que nível.

| Nível | Significado | Uso típico no contexto tradicional |
|---|---|---|
| **Público** (`public`) | Aberto para consulta na internet (porta pública). | A maioria dos usos medicinais e materiais gerais: `febre`, `artesanato`, `madeira`. |
| **Restrito** (`restricted`) | Visível apenas a pesquisadores autorizados. | Conhecimento sensível, sob acordo (SisGen/comunidade). |
| **Sagrado** (`sacred`) | Visível apenas à comunidade detentora. | Usos rituais e cerimoniais de acesso reservado. |

Repare em termos como `ritual` (400), `litúrgico` (286), `místico` (309), `descarrego` (119),
`defumação` (111) e `olho gordo` (318). Um uso genérico como "ritual" pode ser público, mas o
**nome específico** de uma prática cerimonial numa língua indígena pode ser `sacred` — e o
sistema permite marcar isso **rótulo por rótulo**, não o conceito inteiro. Um conceito pode ter o
rótulo em português como `public` e o rótulo cerimonial na língua originária como `sacred`.

> **Na prática:** ao cadastrar o nome de um uso ritual numa língua indígena, pergunte-se sempre:
> *"a comunidade autorizou divulgar este nome na internet?"*. Se não tiver certeza, use
> `restricted` ou `sacred`. O padrão do sistema é `public` — mude conscientemente.

**O resultado honesto da campanha de "tipos de uso":** nos 713 termos deste campo **nenhuma
reclassificação de `accessLevel` se aplicou** — são termos de uso recolhidos da literatura, em
português e inglês, nenhum nome em língua indígena, todos `public`. O CARE deixa de ser teórico no
campo **`nomeVernacular`** (982 termos ainda crus), onde cada nome tem povo de origem e pode
exigir `restricted` ou `sacred`.

### 3.4 Proveniência: de quem vem o nome {#s3-4}

Ainda no formulário de rótulo, você tem:

- **Povo fonte** (`sourcePeople`) — de qual povo/comunidade vem este nome. Ex: *Guarani*.
- **Povo detentor (CARE)** (`holderPeople`) — o povo que detém o conhecimento (pode ser
  diferente de quem forneceu o dado ao pesquisador).
- **Consentimento prévio e informado registrado** (`priorInformedConsent`) — marque quando
  houver consentimento documentado (Protocolo de Nagoya).

Estes campos são o que diferencia um vocabulário **descolonizador** de uma simples lista de
palavras: o nome tradicional deixa de ser um apêndice anônimo e passa a carregar sua origem e
sua governança.

### 3.5 Quando não há nome preferido: rótulos co-iguais {#s3-5}

Muitas vezes **não existe** um nome preferido: uma comunidade chama a mesma planta por dois ou três
nomes igualmente válidos, e a academia e o público em geral também usam vernaculares sem preferência
fixa. Além disso, os nomes que chegam da coleta entram todos como `pref` em português — o que é só
**ordem de coleta**, não preferência real.

Entenda o ponto central: **o tipo `preferencial` é um âncora de exibição, não um juízo de valor.**
Ele diz apenas *"é este o nome que a tela mostra em destaque e pelo qual a busca ordena"* — nunca
*"este nome vale mais que os outros"*. A regra "um preferencial por idioma" ([§3.1](#s3-1)) é
**técnica**: a interface precisa de **uma** string estável por idioma.

Então, quando não há preferência:

1. Cadastre **todos** os nomes co-iguais do mesmo idioma como **alternativos**.
2. Eleja **um** como preferencial, com "★ Tornar Preferencial", apenas como âncora de exibição.
   Escolha por um critério neutro, nesta ordem:
   - a convenção da própria comunidade, se ela tiver uma (Princípio CARE *Authority to Control*);
   - senão, o nome mais frequente nas fontes;
   - senão, ordem alfabética.
3. Escreva na **Nota de Escopo** que a escolha do preferencial é **arbitrária, só para exibição**, e
   que os alternativos são **igualmente válidos**. Assim o próximo curador não lê hierarquia onde
   não há.

> **Idiomas diferentes não competem.** Um `pref/por` e um `pref` numa língua indígena coexistem
> ([§3.2](#s3-2)). O desempate acima só se aplica a nomes **do mesmo idioma**.

> **Não deixe o conceito sem preferencial** para "representar" a ausência de preferência: isso faz
> o nome aparecer como *(sem rótulo)* em listas, títulos e busca. A ausência de preferência se
> registra **na Nota de Escopo** — não deixando o campo vazio.
