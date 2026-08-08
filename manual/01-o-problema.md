# 1. O problema que estamos resolvendo {#s1}

O conhecimento tradicional associado à biodiversidade é **plural**. A mesma planta pode ser
chamada de dez jeitos diferentes por dez povos diferentes; o mesmo uso medicinal aparece na
literatura escrito de formas inconsistentes ("diarréia", "diarreia"), no singular e no plural
("gripe", "gripes"), de modo genérico e específico ("dor", "dor de cabeça").

Se guardarmos cada grafia como se fosse uma coisa isolada, perdemos a capacidade de responder
perguntas simples como *"quais plantas tratam problemas respiratórios?"* — porque "asma",
"bronquite", "tosse" e "gripe" ficariam soltas, sem nada dizendo que todas são problemas
respiratórios.

## 1.1 O que a coleta realmente deposita {#s1-1}

O campo "tipos de uso" parece uma lista simples, mas o corpus real mistura seis naturezas
diferentes de informação na mesma coluna:

| Natureza | Exemplos |
|---|---|
| Finalidade de uso | `alimentício`, `construção`, `artesanato`, `ritual` |
| Enfermidade ou sintoma (a maioria) | `asma`, `dor de cabeça`, `febre` |
| Ação farmacológica atribuída | `diurético`, `expectorante`, `cicatrizante` |
| Parte do corpo sem enfermidade | `fígado`, `rins`, `peito` |
| Objeto produzido | `cesto`, `ponta de flecha`, `velas` |
| Ruído | `outros`, `dúvida`, `não especificado`, `enferrujado` |

E os números do mesmo corpus: dos 713 termos coletados, **44 rótulos em inglês estavam gravados
como português**, **9 tinham grafia incorreta**, **17 eram termos compostos** (`gripe e tosse`) e
**~120 eram variantes de regência ou número da mesma ideia** (`dor de estômago` / `dor no
estômago` / `dores estomacais` / `stomache`).

O BioCultTermos resolve isso organizando os termos segundo o padrão internacional
**SKOS-XL** (*Simple Knowledge Organization System — eXtension for Labels*). Antes de mexer na
tela, você precisa entender três palavras: **termo**, **conceito** e **rótulo**.

Depois da curadoria real deste campo, executada em 2026-08-07, o resultado foi **713 → 333
conceitos vivos** (305 ativos, 411 depreciados, redução de 53%), com 357 rótulos alternativos, 33
ocultos e 318 relações hierárquicas. E a pergunta do começo passa a ter resposta: `problemas
respiratórios` devolve **14 filhos**, entre eles `asma`, `tosse` e `gripe`.
