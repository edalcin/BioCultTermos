# 8. Passo a passo na tela de edição {#s8}

Juntando tudo, aqui está o percurso típico ao curar um conceito candidato. Cada seção da tela
tem um botão **?** de ajuda ao lado do título — este manual é a versão longa daquelas caixas.

> Se o trabalho é o campo semântico inteiro, e não um conceito isolado, comece por
> [§10](10-campo-semantico-inteiro.md#s10) — a ordem das operações muda.

**Passo 1 — Entenda o conceito.** Leia o rótulo que veio da coleta. Ele é um conceito de
verdade, ou é variação/parte de outro que já existe? Use a busca do sistema para verificar.

**Passo 2 — Ajuste os Rótulos (seção "Rótulos (SKOS-XL)").**
- Confirme o **preferencial** correto (um por idioma). Se precisar trocar, use "★ Tornar
  Preferencial" ([§7.1](07-guia-de-decisao.md#s7-1)).
- Adicione plurais, variações regionais e traduções como **alternativos**.
- Jogue grafias erradas em **ocultos** (ajudam a busca sem poluir a exibição).
- Para cada rótulo, defina **Nível de Acesso** e **proveniência** (Povo fonte / detentor /
  consentimento) — especialmente crítico para nomes em línguas indígenas e usos rituais.

**Passo 3 — Preencha Definição e Notas.** No mínimo a **Definição** e, se houver risco de
confusão com termos vizinhos, a **Nota de Escopo**.

**Passo 4 — Monte as Relações Semânticas.**
- Ligue ao conceito mais amplo (**Mais amplo / BT**) — ex.: `febre` → `medicinal`.
- Marque conceitos apenas associados como **Relacionado (RT)**.
- Se for um sinônimo de um conceito aceito já existente, use **Sinônimo de (aceito)**.

**Passo 5 — Ative.** Com tudo revisado, clique em **"Ativar Conceito"**. Ele passa a ser
consultável publicamente.

A regra: **ative o inequívoco, segure o duvidoso.** A campanha do campo "Tipos de Usos de
Plantas" ativou 305 conceitos e deixou 27 como `candidate`, cada um **com a razão da dúvida
escrita**. Critério dos que ficam:

1. Significado que você não consegue determinar no contexto etnobotânico.
2. Destino `indeterminado`.
3. Nome de objeto ou parte do corpo sem uso declarado.

Exemplos reais de dúvida legítima: `batidas` (palpitação cardíaca ou pancada?),
`apertar os dentes` (bruxismo ou o ato de mastigar a planta?), `frio` (calafrio, sensação térmica
ou refrescante?), `chá` (alimento ou forma de preparo?).

**Nunca absorva um termo ambíguo.** Absorver deprecia o conceito de origem e é a operação mais
difícil de desfazer sem perder proveniência. O caso que obrigou a rever a proposta: `panos`
estava classificado como revestimento têxtil, mas "pano branco" é micose — absorvê-lo em
`revestimento` esconderia uma doença de pele dentro da faceta material. Quatro termos (`panos`,
`batidas`, `apertar os dentes`, `sustento`) foram promovidos de volta a conceito próprio, **sem
pai** e `candidate`, de propósito.
