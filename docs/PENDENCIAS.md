# Portal HUB RJ: acompanhamento

Atualizado em 19/11/2026. O painel original na raiz e as 143 imagens foram preservados.

## Concluído e conferido

- 143 imagens IA publicadas, incluindo as 84 que faltavam.
- Conciliação por protocolo com os 143 selecionados para a Fase 3: nenhuma ausência e nenhum excedente. Fonte oficial de 03/06/2026, link e página em cada ficha. Evidência e hash do PDF em `portal/data/official-results.json`.
- Observatório da base F02: 25 municípios e 33 áreas, listas completas com rolagem, filtros próprios, contagem do recorte e exportação correspondente.
- Ficha ampliada sem o corte adicional aplicado na galeria. Textos já resumidos na base não foram reconstruídos automaticamente.
- Downloads do portal e da vitrine apontam para as imagens WebP atuais.
- Busca do portal aceita protocolo, resumo completo e palavras sem acentos.
- 19/11/2026: seção pública "Resultados do Programa" (`#resultados`) com os resultados de execução das Fases 01 e 02 por decisão do coordenador: funil, indicadores consolidados, território por polo, capacitações, mentorias (só agregados), validação (F02), pitch final, comparativo F01 × F02 e ranking do Pitch_02. Base em `portal/data/execucao.json`, anonimizada: sem nomes de startups, proponentes ou Agentes de Inovação; ranking apenas com posição, protocolo, polo e faixa.
- 19/11/2026: melhorias de desempenho no celular: miniaturas WebP 640/960 px nos cards (originais preservados), logo externo (HTML de 277 KB para cerca de 16 KB), índice leve da base com resumos completos sob demanda, Observatório e Resultados desenhados sob demanda e `content-visibility` nas seções abaixo da dobra. Derivados gerados por `scripts/build_portal_assets.py` e conferidos pela auditoria.
- Auditoria reproduzível das duas bases e dos campos editoriais: `python scripts/audit_hubrj_portal.py`.

- Revisão editorial dos seis campos das 143 fichas concluída a partir dos resumos originais. A primeira etapa registrou 123 alterações; a complementar, mais 647. A homologação institucional permanece pendente.
- Notícias: três publicações da FAPERJ com data, resumo e link de origem. Contato: acesso à Central de Atendimento da Fundação, identificado separadamente do canal próprio do HUB RJ.
- Exportação CSV com os seis campos revisados e origem do resultado oficial; proteção contra interpretação de conteúdo como fórmula.
- Controles de acessibilidade disponíveis também no celular; menu com estado de expansão informado a leitores de tela. Conferência visual desta alteração ainda limitada pelo bloqueio do navegador.

## Próximas entregas

| Frente | Situação observada | Trabalho necessário |
| --- | --- | --- |
| Validação do conteúdo | 143 fichas revisadas; 29 problemas, 3 diferenciais, 1 mercado, 93 estágios e 1 objetivo não confirmados nos resumos | Obter complementos dos proponentes e homologação institucional. Título “adsfa” (320018), “The Brigde” (319985), nome Avalia/Avalia360 (319752) e protocolo citado no título 319742 precisam de confirmação. A descrição foodbreak (319774) contém apenas uma frase. Notas por protocolo nos históricos de revisão. |
| Resultados e painel de execução | Resultados agregados das Fases 01 e 02 e ranking anonimizado do Pitch_02 publicados em 19/11/2026, com fonte e versão por bloco (relatórios F01 v0.9, F02 v0.6, Tabela 9 do Pitch_02). Distribuição por Agente de Inovação e nomes não publicados | O relatório recebido traz só as posições 1 a 120 das 143 avaliadas no Pitch_02: obter as posições 121 a 143. Os relatórios ainda são versões preliminares (v0.9 e v0.6): substituir pelos finais quando houver. Observação: como a vitrine é pública, um protocolo do ranking pode ser cruzado com a ficha da startup. |
| Administração e acesso das startups | Área de gestão privada publicada com autenticação ChatGPT, banco D1 e 143 fichas carregadas. API com vínculos por protocolo, proposta, aprovação, devolução, auditoria e controle de versões. 6 testes de regras e transações passaram | Login do proprietário e sincronização autenticada confirmados. Ciclo 43613970965 passou com 143 protocolos e seis testes. Falta cadastrar startup piloto, liberar visitante e validar proposta, aprovação e publicação. Detalhes em `INFRAESTRUTURA.md`. |
| Evento | Datas e local atualizados conforme convite enviado pela coordenação: 3 e 4 de dezembro de 2026, Rua do Catete, 243, Rio de Janeiro. Convite original e calendário de reserva dos dois dias publicados | Horários, programação, inscrições, credenciamento e certificados ainda dependem de definição da organização e implantação do servidor. |
| Internacionalização | Portal principal: menu, seções institucionais, evento, notícias, contato, filtros e contagens com versão inglesa reversível; aviso visível sobre conteúdo original em português | Traduzir fichas, classificações e vitrine independente após revisão editorial. Dados e CSV originais permanecem em português. |
| Notícias e contato | Notícias oficiais e acesso ao atendimento da FAPERJ publicados | Confirmar o e-mail ou canal próprio da coordenação HUB RJ. Gestão de novas notícias depende da área administrativa. |
| Homologação | Testes funcionais desta entrega realizados no navegador de desktop | Completar revisão editorial, teste real em tela móvel e validação dos fluxos autenticados após implantação do servidor. |

## Preservação

Os resumos originais integrais, nomes, protocolos, municípios e áreas foram preservados. Os campos de síntese foram corrigidos conforme o histórico em `revisao-editorial-2026-11-14.json`, e `revisao-editorial-complementar-2026-11-14.json`, com valores anteriores, novos, hash do resumo de origem e trechos literais de suporte aos estágios da revisão complementar. A classificação confirmada está em `officialResult`, separada da referência documental F02. Não foram geradas novas imagens nem alterado o fluxo de geração.

## Informações necessárias da coordenação

- Horários e programação do HUB RJ Inova 2026 ainda não constam do convite. Datas e local foram confirmados pelo material enviado pela coordenação em 14/11/2026.
- **E-mail ou canal oficial próprio do HUB RJ: adiado a pedido de Rogerio em 14/11/2026. Cobrar somente no encerramento do trabalho; não bloquear as demais entregas por essa pendência.**
- Infraestrutura criada após confirmação de que não existia. Ponte automática ativa: `HUBRJ_SITE_SERVICE_TOKEN` e `HUBRJ_SYNC_KEY` configurados nos segredos Actions e testados em execução real. Nenhum valor secreto deve ser colocado no repositório.
- Para testar o acesso externo: definir uma startup piloto e o e-mail da pessoa responsável, com seu protocolo. Isso é distinto do e-mail institucional de contato, que permanece adiado.

## Acesso simplificado dos responsáveis, definido em 14/11/2026

- **Pendente: obter e-mails dos responsáveis vinculados aos protocolos.** Conferidas as seis abas de `HUB_RJ_Inova_2026_Classificacao_Integrada_144_Startups.xlsx`: nenhum endereço de e-mail encontrado. A aba Respostas_Inova contém 70 respostas, sem os contatos. Conferir a exportação original do Forms quando disponível.
- Novo fluxo solicitado: e-mail autorizado → código temporário → acesso somente à própria startup. Ainda não implementado nem ativado. Necessário configurar remetente/serviço de envio e adaptar autenticação e proteção das rotas; acesso atual permanece por ChatGPT.
- Preparada importação em lote na área administrativa: prévia com nome da startup, validação de protocolo e e-mail, bloqueio de duplicidades e proteção das contas administrativas. Nenhum contato real importado e nenhuma mensagem enviada.
- Envio de imagens implementado na área de gestão: JPG/PNG/WebP, prévia WebP 1536×1024, armazenamento privado, aprovação/devolução administrativa e histórico. Sincronizador guarda a imagem pública anterior antes de substituir o arquivo. Testes automatizados cobrem validação, conflitos e preservação. Falta homologar um envio real na sessão autenticada do administrador e de um responsável externo.
- O e-mail institucional de contato continua adiado para o encerramento, distinto da lista de responsáveis e do serviço de envio de códigos.
