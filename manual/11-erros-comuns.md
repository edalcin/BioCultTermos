# 11. Erros comuns e boas práticas {#s11}

| ❌ Erro comum | ✅ Prática correta |
|---|---|
| Criar `gripe` e `gripes` como dois conceitos. | Um conceito `gripe` com `gripes` como rótulo **alternativo**. |
| Corrigir grafia apagando o termo errado. | Guarde a grafia errada como rótulo **oculto** — a busca ainda encontra textos que a usam. |
| Marcar `dor de cabeça` como **relacionado** a `dor`. | É hierarquia: `dor de cabeça` tem **Mais amplo** → `dor`. |
| Marcar `gripe` como **sinônimo** de `resfriado`. | São distintos: use **Relacionado (RT)**. |
| Usar sinônimo quando é a mesma linha do banco. | Se é o mesmo conceito, é **rótulo alternativo**, não relação de sinônimo. |
| Divulgar nome ritual em língua indígena como `public` por padrão. | Avalie o `accessLevel`; na dúvida sobre autorização, use `restricted` ou `sacred`. |
| Deixar o conceito como `candidate` "para depois". | Ative o que está revisado e inequívoco; o duvidoso **fica `candidate` com a razão da dúvida escrita** ([§8](08-passo-a-passo.md#s8)). |
| Trocar o tipo do único preferencial para "alternativo". | Adicione o novo rótulo e use **"★ Tornar Preferencial"** (troca atômica). |
| Deprecar sem indicar substituto. | A depreciação **exige** o conceito "Substituído por". |
| Ler o `pref` de um nome vernacular como "o nome certo". | `pref` é só âncora de exibição; nomes co-iguais são **alternativos** e a escolha do preferencial vai anotada como arbitrária na Nota de Escopo ([§3.5](03-rotulos.md#s3-5)). |
| Ligar dois nomes vernaculares da mesma planta por **Relacionado (RT)**. | Se nomeiam o mesmo conceito, são **rótulos alternativos** de um conceito ([§7.2](07-guia-de-decisao.md#s7-2)); RT só quando a comunidade os distingue como plantas diferentes. |
| Deprecar `gripe e tosse` apontando só `gripe`. | Rótulo **oculto nos dois** conceitos que o termo nomeia, depreciação apontando o primeiro ([§7.4](07-guia-de-decisao.md#s7-4)). Apontar só um apaga metade do registro. |
| Absorver um termo ambíguo para encurtar a lista. | Promova a conceito próprio, sem pai, `candidate`, com a dúvida escrita ([§8](08-passo-a-passo.md#s8)). Absorver deprecia a origem e é o mais difícil de desfazer. |
| Escrever definição em conceito-folha que ninguém revisou. | Definição só onde há revisão; folha sem definição é estado legítimo ([§4.1](04-definicao-e-notas.md#s4-1)). |
| Gravar rótulo em inglês com `language: por`. | `eng`. A convenção é ISO 639-3, e ela existe para caber `tup`, `kgp`, `gub` ([§3.2](03-rotulos.md#s3-2)). |
| Tratar `febre` e `antitérmico` como o mesmo conceito. | São ramos irmãos sob `medicinal`: indicação × ação farmacológica ([§6.5](06-relacoes-semanticas.md#s6-5)). |
| Depreciar um termo que pertence a outro Campo Semântico. | Não tocar ([§7.6](07-guia-de-decisao.md#s7-6)) — ele será curado quando aquele campo for. |
| Curar, depreciar ou criar conceito de nome científico. | Fora de escopo — ver [§7.3](07-guia-de-decisao.md#s7-3); o dado vive no BioCultDB e a autoridade é externa (WFO/IPNI). |

**Princípio geral:** na dúvida entre criar um conceito novo ou enriquecer um existente, prefira
**enriquecer** — menos conceitos, mais rótulos e relações. Um vocabulário bem curado é raso em
duplicatas e rico em conexões.
