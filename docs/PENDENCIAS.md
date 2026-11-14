# Portal HUB RJ: acompanhamento

Atualizado em 14/11/2026. O painel original na raiz e as 143 imagens foram preservados.

## Concluído e conferido

- 143 imagens IA publicadas, incluindo as 84 que faltavam.
- Conciliação por protocolo com os 143 selecionados para a Fase 3: nenhuma ausência e nenhum excedente. Fonte oficial de 03/06/2026, link e página em cada ficha. Evidência e hash do PDF em `portal/data/official-results.json`.
- Observatório da base F02: 25 municípios e 33 áreas, listas completas com rolagem, filtros próprios, contagem do recorte e exportação correspondente.
- Ficha ampliada sem o corte adicional aplicado na galeria. Textos já resumidos na base não foram reconstruídos automaticamente.
- Downloads do portal e da vitrine apontam para as imagens WebP atuais.
- Busca do portal aceita protocolo, resumo completo e palavras sem acentos.
- Auditoria reproduzível das duas bases e dos campos editoriais: `python scripts/audit_hubrj_portal.py`.

- Primeira revisão editorial: 47 fichas corrigidas, sendo 16 com os seis campos revisados, totalizando 123 alterações rastreáveis. A homologação institucional permanece pendente.

## Próximas entregas

| Frente | Situação observada | Trabalho necessário |
| --- | --- | --- |
| Revisão editorial | 56 problemas, 25 diferenciais, 31 mercados e 115 estágios sem confirmação; 16 fichas com os seis campos revisados e correções em 47 fichas | Concluir a revisão integral das outras 127 fichas e submeter conteúdo à homologação. Etapas futuras e declarações históricas foram separadas na primeira revisão. Fila por protocolo em `auditoria-editorial.json`. Não inferir maturidade por seleção para a Fase 3. |
| Resultados e painel de execução | Seleção da Fase 3 conferida; ranking, notas e agentes não reconciliados | Conferir os documentos específicos antes de publicar notas, posições e agentes. O PDF de selecionados não fornece esses dados. |
| Administração e acesso das startups | Há funções antigas para `/api/login` e `/api/updates`, mas não há servidor nem formulários ativos | Definir hospedagem de API e banco, autenticação, vínculo entre usuário e startup, papéis de administrador e revisão, histórico de alterações e aprovação no servidor. GitHub Pages permanece como portal público. |
| Evento | Datas divergentes e programação ainda sem confirmação documental | Consolidar data, local e programação oficiais; depois implementar inscrições, credenciamento e certificados no servidor. Não abrir inscrições fictícias. |
| Internacionalização | Apenas navegação recebe tradução; demais textos e dados seguem em português | Completar interface bilíngue e revisão editorial dos conteúdos traduzidos. |
| Notícias e contato | Seções em preparação, sem canal institucional configurado | Vincular publicações e contatos oficiais confirmados. |
| Homologação | Testes funcionais desta entrega realizados no navegador de desktop | Completar revisão editorial, teste real em tela móvel e validação dos fluxos autenticados após implantação do servidor. |

## Preservação

Os resumos originais integrais, nomes, protocolos, municípios e áreas foram preservados. Os campos de síntese foram corrigidos conforme o histórico em `revisao-editorial-2026-11-14.json`, com valores anteriores, novos e hash do resumo de origem. A classificação confirmada está em `officialResult`, separada da referência documental F02. Não foram geradas novas imagens nem alterado o fluxo de geração.
