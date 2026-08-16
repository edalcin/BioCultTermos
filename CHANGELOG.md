# Changelog — Módulo BioCultTermos

Este é o **changelog central do módulo compartilhado**, não um changelog de release: o repositório não
tem versão própria implantável (ADR-007 F2, `Arquitetura-BioCultural`). Cada entrada documenta uma
mudança de código feita a partir do submodule de alguma unidade hospedeira, pushada para este remoto
compartilhado — para que qualquer unidade (inclusive as que ainda não têm código) veja o que mudou sem
precisar ler `git log` diretamente.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/). Toda entrada nova segue
o fluxo obrigatório do [ADR-010](https://github.com/edalcin/Arquitetura-BioCultural/blob/main/docs/architecture-decisions/ADR-010-central-documentation-and-build-verification.md)
(push + esta documentação são obrigatórios) e o [ADR-012](https://github.com/edalcin/Arquitetura-BioCultural/blob/main/docs/architecture-decisions/ADR-012-manutencao-codigo-bioculttermos.md),
que tornou o bump do submodule nas demais unidades **obrigatório e assíncrono** (G4) — não mais
opcional, como diziam o ADR-007 F3 e o ADR-010.

---

## 2026-08-16 — origem: BioCultDB (documentação, sem código)

O manual passa a citar a **referência central dos rótulos SKOS-XL da arquitetura**
([`Arquitetura-BioCultural/docs/rotulos-skos-xl.md`](https://github.com/edalcin/Arquitetura-BioCultural/blob/main/docs/rotulos-skos-xl.md)),
documento normativo que consolida tipos de rótulo, metadados, regras e exemplos das curadorias
reais — divergência entre manual e referência resolve-se lá.

- `manual/index.md`: link acrescentado ao bloco "Padrão de referência".
- `manual/03-rotulos.md`: nota de referência normativa no topo do capítulo.

---

## 2026-08-10 — origem: BioCultTermos (mudança de escopo de curadoria)

O Campo Semântico **"Nomes Científicos de Plantas"** (`comunidades.plantas.nomeCientifico`) sai do
escopo de curadoria do vocabulário controlado. Não existe decisão de curadoria legítima a tomar
sobre um binômio latino — nome aceito, sinônimo e basiônimo são regidos pelo ICN e verificáveis em
WFO/IPNI/GBIF; manter uma cópia curada local só cria dívida e superfície de erro. Decisão completa
em `BioCultDB/docs/curadoria/decisao-nomes-cientificos-fora-de-escopo.md`.

- `backend/src/services/AcquisitionService.js`: `nomeCientifico` removido de `MONITORED_FIELDS` —
  a Aquisição passa a monitorar 4 campos (`comunidades.tipo`, `comunidades.plantas.nomeVernacular`,
  `comunidades.plantas.tipoUso`, `comunidades.atividadesEconomicas`), não mais 5.
- `backend/src/contexts/admin/views/concepts/list.ejs`: a opção "Nomes Científicos de Plantas" foi
  **removida** do filtro por Campo Semântico.
- `backend/src/services/SourceService.js`: o resolvedor de Fontes do campo foi removido.
- `backend/src/contexts/admin/views/partials/help/`: a ajuda que ensinava a tratar nome científico
  como conceito (`labels.ejs`, `relations.ejs`) foi removida.
- Purga de dados no BioCultDB, com backup verificado e execução seca antes:
  **2632 → 1768 conceitos** (−864), FTS em sincronia, 1 referência órfã limpa (`aroeira`),
  0 `sourceFields` mistos. Script em
  `BioCultDB/docs/curadoria/purga-nomes-cientificos.mjs`.

**O dado de origem não foi tocado.** `biocultdb_records` manteve as 29 Evidências e as 1827
ocorrências de nome científico. O campo continua obrigatório na Planta do BioCultDB (formulário,
validação, FTS, estatísticas, etnoChat). O que saiu foi vocabulário **derivado**, reconstruível por
uma execução de aquisição.

---

## 2026-08-09 — origem: BioCultDB (documentação)

`README.md` passa a informar o **modo de operação** deste repositório, em seção própria logo abaixo
do cabeçalho, antes de qualquer coisa sobre SKOS-XL.

Motivo: quem chega por `github.com/edalcin/BioCultTermos` não tinha como saber que este repositório
não se clona, que a edição acontece dentro de uma Unidade Hospedeira, nem que desde o ADR-013 ele
carrega os tokens visuais de cinco aplicações. A regra existia nos ADRs; não estava na porta de
entrada.

A nova seção cobre: por que não se clona (ADR-012 G2, com o incidente real que originou a regra),
onde se edita, o ritual de dois comandos (`pull --ff-only` / `push`), a adoção obrigatória e
assíncrona (G4) e sua consequência — todo commit precisa ser seguro para as quatro unidades —, a
fronteira código/conteúdo, e as **duas responsabilidades** do repositório: vocabulário controlado e
identidade visual da arquitetura.

Afirmações obsoletas corrigidas no mesmo passo:

- "propagadas às demais unidades **quando cada uma decide** incorporar" → a adoção é obrigatória e
  assíncrona desde o ADR-012 G4, que supersede o ADR-007 F3 e o ADR-010 nesse ponto.
- Tabela de unidades hospedeiras dizia "repositório ainda sem código" para Relatos, Naturalistas e
  Acervos — os três têm Cópia de Trabalho e home page desde 2026-08-09. Coluna nova distingue ter a
  Cópia de Trabalho de conseguir exercitar o módulo (sem `Dockerfile.unidade`, o bump é
  escrituração).
- "ninguém sobe seu `docker-compose.yml` isoladamente" → o diretório `docker/` foi removido; não há
  o que subir.
- "Deploy: Docker (Alpine Linux)" → não há deploy próprio; o módulo vai na imagem dual-app da
  unidade.
- "Instalação e Desenvolvimento" mandava `cd backend` sem dizer de onde — contradizia a proibição de
  clone. Agora diz explicitamente que é dentro da Cópia de Trabalho de um hospedeiro.
- Bloqueio do `AcquisitionService` estava descrito como "tabela hardcoded". É mais que isso: a
  travessia usa `comunidades[].nome` como dimensão de atribuição, e generalizar exige a **Fonte de
  Atribuição** `{tipo, nome}` do ADR-012 G5, porque Comunidade Tradicional e proveniência histórica
  não são a mesma coisa.

---

## 2026-08-09 — origem: BioCultDB (mudança transversal)

Identidade visual da arquitetura passa a ter fonte única, dentro deste módulo.

- `tailwind.preset.cjs` (novo): preset Tailwind com a paleta `forest`. Consumido por
  `presets: [require('./bioculttermos/tailwind.preset.cjs')]` no `tailwind.config.js` da unidade.
- `frontend/src/styles/biocult-base.css` (novo): `@layer base` e `@layer components` compartilhados
  (`.btn*`, `.card`, `.form-*`, `.badge`). Importado pelo `main.css` da unidade.

**Motivo**: a identidade visual é exigida como idêntica em todas as unidades federadas
(`CLAUDE.md` de cada uma, `constitution.md` §III) e não era garantida por nada. A paleta já estava
copiada em dois `tailwind.config.js` e já havia divergido — BioCultDB 50–900 contra BioCultTermos
50–950, e `.btn` `px-4 py-2` contra `px-6 py-3`. Com cinco unidades, cópia vira bifurcação: o mesmo
problema que o ADR-012 resolveu para o código, na camada de apresentação.

Este módulo é o lugar porque as quatro Unidades Hospedeiras já o carregam — os tokens propagam pelo
mecanismo do ADR-012, com Atraso de Módulo medido, sem repositório novo nem registry. Que um módulo
de vocabulário hospede tokens de design é um desvio de responsabilidade assumido: o preço de não
criar um segundo módulo compartilhado para ~40 linhas. Caminho de saída registrado no cabeçalho do
preset.

**Aditivo, não muda nada do que roda**: nem o BioCultDB nem este módulo consomem os arquivos novos
ainda. Migrá-los é refatoração de UI em produção e pede verificação própria. Quem consome desde já
são BioCultRelatos, BioCultNaturalistas e BioCultAcervos, que nascem sem CSS de tema próprio.

---

## 2026-08-09 — origem: BioCultDB

**Commit**: `726fd56`

Sem mudança de código. Documentação do módulo alinhada ao
[ADR-012](https://github.com/edalcin/Arquitetura-BioCultural/blob/main/docs/architecture-decisions/ADR-012-manutencao-codigo-bioculttermos.md),
que fecha três lacunas do ADR-007/ADR-010 expostas por um sintoma real: um clone standalone deste
repositório sobrevivendo fora de qualquer unidade hospedeira, sete commits atrás deste remoto, com
trabalho não publicado preso dentro dele (duas stashes e uma seção de `CLAUDE.md`).

- `CLAUDE.md`: nova seção **Onde este código é mantido**. Clonar este repositório isoladamente passa a
  ser proibido (G2) — desde o ADR-007 F2 ele não roda nem testa fora de uma unidade hospedeira, e a
  única coisa que um clone solto faz de forma confiável é envelhecer até divergir. Toda edição acontece
  na Cópia de Trabalho da unidade que motivou a mudança.
- `README.md`: mesma advertência, na seção de distribuição.
- `CHANGELOG.md`: o cabeçalho deste arquivo ainda afirmava que o bump nas outras unidades era opcional.
  Não é mais (ADR-012 G4).
- `docs/agents/`: `domain.md` e `issue-tracker.md`, resgatados do clone obsoleto antes de removê-lo.

**Consequência para quem escreve código aqui**: como toda unidade hospedeira passa a ser obrigada a
adotar toda versão publicada, todo commit precisa ser seguro para as quatro. Nenhum comportamento
específico de uma unidade entra neste repositório (ADR-007 F5, ADR-012 G5). O bloqueio conhecido é o
`AcquisitionService`, que hardcoda a travessia documental do BioCultDB — a generalização decidida é a
**Fonte de Atribuição** `{tipo, nome}` (ADR-012 G5), ainda por implementar.

---

## 2026-08-06 — origem: BioCultDB

**Commit**: `cc309f2`

Correção de uma regressão silenciosa na aquisição, encontrada ao preparar a curadoria em massa do
campo semântico "Tipos de Usos de Plantas" (713 termos) no BioCultDB:
- `AcquisitionService.upsertConcept` verificava a existência de um termo **apenas** entre os
  `prefLabels`. Qualquer termo que o curador recolhesse como rótulo alternativo ou oculto de outro
  conceito era semeado de novo como candidato na execução seguinte do cron (03:00), desfazendo a
  fusão sem deixar rastro na interface. A verificação passa a cobrir `prefLabels`, `altLabels` e
  `hiddenLabels`.
- Idioma dos rótulos semeados: `pt` (ISO 639-1) → `por` (ISO 639-3), que é o que o modelo
  (`createLabel`), a tela de edição do admin e o `docs/Manual.md` do BioCultDB já documentavam, e o
  único que codifica as línguas indígenas que este vocabulário existe para abrigar (`tup`, `kgp`).
  `ConceptService.shortPrefLabel` ajustado; migração idempotente em
  `backend/scripts/migrate-language-pt-to-por.js` para as linhas já gravadas.
- Três testes novos em `tests/unit/acquisition-service.test.js` cobrindo a sobrevivência da curadoria
  ao ciclo de aquisição (verificado: falham com o código anterior).

## 2026-07-22 — origem: BioCultDB

**Commit**: `3d7d878`

Remoção da capacidade de gerar Docker standalone (`docker/etnotermos.Dockerfile`,
`docker/docker-compose.yml`, workflow de CI `docker-build.yml` que publicava
`ghcr.io/edalcin/bioculttermos`). Enforcement do ADR-007 F2 — o repositório nunca mais funcionará de
forma independente das instâncias hospedeiras; `docs/deployment.md` e `docs/instalacao-unraid.md`
marcados como histórico.

## 2026-07-22 — origem: BioCultDB

**Commit**: `3153f06`

Sete ajustes de interface no admin/público (BioCultDB, porta 4001/4000):
- Card "Definição e Notas": lista fontes bibliográficas do BioCultDB (APA), linkadas para
  `/referencia/:id` no BioCultDB público.
- "Navegar" público: lista todos os termos ativos com suas relações (antes redirecionava para busca
  vazia).
- "Ativar Conceito": troca de card em tempo real (sem reload) via swap HTMX + versão OOB.
- Upload de áudio: texto "Enviar áudio" + modal de ajuda sobre pronúncia comunitária.
- Rótulos preferenciais/alternativos: editáveis inline (botão "Editar" ou clique no texto).
- "Adicionar Rótulo": autocomplete de termos existentes no campo "Forma literal".
- Relações Semânticas "Adicionar": corrigido bug em que nada acontecia — resolve o conceito-alvo pelo
  nome exato digitado quando nenhuma sugestão foi clicada; "Mais específico (NT)" agora é relação
  derivada e somente-leitura.

---

**Nota sobre entradas anteriores a esta data**: não há reconstrução retroativa completa do histórico
antes de 2026-07-22 — este changelog central passa a existir a partir do ADR-010. Para o histórico
completo anterior, ver `git log` deste repositório.
