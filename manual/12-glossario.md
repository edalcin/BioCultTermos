# 12. Glossário rápido {#s12}

| Termo | Significado no BioCultTermos |
|---|---|
| **Termo** | Uma palavra/expressão crua (ex.: uma linha do `tipoUso.txt`). |
| **Conceito** | Uma unidade de significado com identidade própria, que reúne rótulos, notas e relações. |
| **Rótulo (SKOS-XL)** | Um nome do conceito, com metadados próprios (idioma, tipo, acesso, proveniência). |
| **Preferencial / Alternativo / Oculto** | Os três tipos de rótulo: nome principal / variação visível / forma escondida (para busca). |
| **accessLevel** | Nível de acesso de um rótulo: `public`, `restricted`, `sacred` (Princípios CARE). |
| **sourcePeople / holderPeople** | Povo de origem do nome / povo detentor do conhecimento. |
| **Definição / Nota de Escopo / Nota Histórica / Exemplo** | Campos de texto que descrevem o conceito. |
| **Mais amplo (BT) / Mais específico (NT)** | Relação hierárquica entre conceitos (pai/filho), recíproca automática. |
| **Relacionado (RT)** | Associação simétrica entre dois conceitos distintos e igualmente válidos. |
| **Sinônimo de (aceito) / Sinônimos deste conceito** | Relação direcionada entre dois conceitos separados, marcando qual é o preferido. |
| **Status: candidato / ativo / depreciado** | Ciclo de vida do conceito. |
| **CARE** | Princípios de governança de dados indígenas: *Collective benefit, Authority to control, Responsibility, Ethics*. |
| **Campo Semântico** | O conjunto de conceitos que vieram do mesmo campo de origem do BioCultDB; tecnicamente, o array `sourceFields` do conceito. Um conceito pode pertencer a mais de um. |
| **Aquisição** | A operação que confronta o BioCultDB com o vocabulário e semeia como `candidate` os termos ainda inexistentes. Roda só sob demanda ([§5.2](05-ciclo-de-vida.md#s5-2)). |
| **Faceta** | Conceito de 1º nível da árvore, que abre um eixo de significado (`medicinal`, `alimentar`, `ritual e espiritual`…). |
| **`indeterminado`** | Faceta terminal para termos que não nomeiam uso algum e não têm substituto legítimo ([§5](05-ciclo-de-vida.md#s5)). |
| **Termo composto** | Termo cru que nomeia dois conceitos (`gripe e tosse`); vira rótulo oculto em ambos ([§7.4](07-guia-de-decisao.md#s7-4)). |
| **Trilha de auditoria** | Registro de toda escrita no vocabulário, por conceito e por usuário responsável. |

---

> **Padrão de referência:** [W3C SKOS-XL](https://www.w3.org/TR/skos-reference/skos-xl.html) ·
> [Princípios CARE](https://www.gida-global.org/care) ·
> [Darwin Core (TDWG)](https://dwc.tdwg.org/) ·
> [Protocolo de Nagoya](https://www.cbd.int/abs/)
>
> Este manual documenta o comportamento atual da tela de edição do BioCultTermos. As caixas de
> ajuda (**?**) dentro do sistema trazem versões resumidas destes mesmos conceitos.
