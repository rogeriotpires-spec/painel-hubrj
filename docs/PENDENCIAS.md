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

- Revisão editorial dos seis campos das 143 fichas concluída a partir dos resumos originais. A primeira etapa registrou 123 alterações; a complementar, mais 647. A homologação institucional permanece pendente.
- Notícias: três publicações da FAPERJ com data, resumo e link de origem. Contato: acesso à Central de Atendimento da Fundação, identificado separadamente do canal próprio do HUB RJ.
- Exportação CSV com os seis campos revisados e origem do resultado oficial; proteção contra interpretação de conteúdo como fórmula.
- Controles de acessibilidade disponíveis também no celular; menu com estado de expansão informado a leitores de tela. Conferência visual desta alteração ainda limitada pelo bloqueio do navegador.

## Próximas entregas

| Frente | Situação observada | Trabalho necessário |
| --- | --- | --- |
| Validação do conteúdo | 143 fichas revisadas; 29 problemas, 3 diferenciais, 1 mercado, 93 estágios e 1 objetivo não confirmados nos resumos | Obter complementos dos proponentes e homologação institucional. Título “adsfa” (320018), “The Brigde” (319985), nome Avalia/Avalia360 (319752) e protocolo citado no título 319742 precisam de confirmação. A descrição foodbreak (319774) contém apenas uma frase. Notas por protocolo nos históricos de revisão. |
| Resultados e painel de execução | Seleção da Fase 3 conferida; ranking, notas e agentes não reconciliados | Conferir os documentos específicos antes de publicar notas, posições e agentes. O PDF de selecionados não fornece esses dados. |
| Administração e acesso das startups | Há funções antigas para `/api/login` e `/api/updates`, mas não há servidor nem formulários ativos | Definir hospedagem de API e banco, autenticação, vínculo entre usuário e startup, papéis de administrador e revisão, histórico de alterações e aprovação no servidor. GitHub Pages permanece como portal público. |
| Evento | Datas divergentes e programação ainda sem confirmação documental | Consolidar data, local e programação oficiais; depois implementar inscrições, credenciamento e certificados no servidor. Não abrir inscrições fictícias. |
| Internacionalização | Apenas navegação recebe tradução; demais textos e dados seguem em português | Completar interface bilíngue e revisão editorial dos conteúdos traduzidos. |
| Notícias e contato | Notícias oficiais e acesso ao atendimento da FAPERJ publicados | Confirmar o e-mail ou canal próprio da coordenação HUB RJ. Gestão de novas notícias depende da área administrativa. |
| Homologação | Testes funcionais desta entrega realizados no navegador de desktop | Completar revisão editorial, teste real em tela móvel e validação dos fluxos autenticados após implantação do servidor. |

## Preservação

Os resumos originais integrais, nomes, protocolos, municípios e áreas foram preservados. Os campos de síntese foram corrigidos conforme o histórico em `revisao-editorial-2026-11-14.json`, e `revisao-editorial-complementar-2026-11-14.json`, com valores anteriores, novos, hash do resumo de origem e trechos literais de suporte aos estágios da revisão complementar. A classificação confirmada está em `officialResult`, separada da referência documental F02. Não foram geradas novas imagens nem alterado o fluxo de geração.

## Informações necessárias da coordenação

- Data, horário e local confirmados do HUB RJ Inova 2026, além da programação oficial quando disponível. A pesquisa em fontes institucionais não resolveu a divergência.
- E-mail ou canal oficial próprio do HUB RJ que pode ser divulgado no portal.
- Para implantação da área restrita: informar se já há servidor, banco e serviço de autenticação institucionais. O repositório atual publica somente o portal estático; os dados de acesso devem permanecer fora dele.
