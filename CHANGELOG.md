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
