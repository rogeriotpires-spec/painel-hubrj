# Infraestrutura da área de gestão HUB RJ

Criada em 14/11/2026, conforme solicitação da coordenação.

## Publicado

- Área privada: https://hubrj-gestao-startups.rogeriotpires.chatgpt.site
- Portal público preservado: https://rogeriotpires-spec.github.io/painel-hubrj/portal/
- Aplicação Sites: appgprj_6af87abee08c8191a5edc2ee4cd5b528
- Versão inicial do código de gestão: 5dc202e47e299cbf23488489c25e31bcc48ae13c, em repositório próprio da hospedagem.
- Banco Cloudflare D1: tabelas members, invitations, projects, submissions e audit.
- 143 registros carregados e conferidos campo a campo contra a base original. API de exportação retorna 401 sem a chave da aplicação; API de gestão retorna 401 sem usuário autenticado.
- Acesso inicial privado do proprietário. Nenhuma permissão externa ou convite foi enviado.

## Funcionamento

O proprietário entra com sua conta ChatGPT. O e-mail de proprietário, confirmado pela plataforma e mantido como segredo de ambiente, vincula a primeira sessão ao perfil administrador. Os perfis são então identificados pelo ID estável da sessão.

O administrador associa o e-mail de um participante ao protocolo da startup. Além desse vínculo, a pessoa precisa de autorização para visitar a área privada. Cada startup consulta e propõe correções apenas à própria ficha. Somente a administração decide sobre as propostas.

Aprovações usam transação no banco, verificam a versão anterior e registram auditoria. Conflitos precisam ser devolvidos para correção e reenvio. Os resumos originais e protocolos não podem ser editados pela interface. A revisão abrange os seis campos editoriais da Fase 02.

## Sincronização com o GitHub Pages

Fluxo preparado: `.github/workflows/sincronizar-fichas-hubrj.yml`, execução manual ou a cada 15 minutos, sujeita ao agendamento do GitHub.

Requer dois segredos de Actions:

- `HUBRJ_SITE_SERVICE_TOKEN`: acesso de serviço à hospedagem privada.
- `HUBRJ_SYNC_KEY`: chave da API de sincronização, também mantida como segredo na hospedagem.

Sem ambos, o fluxo registra que aguarda configuração e não altera arquivos. Nenhum valor secreto consta neste documento.

A importação aceita somente versões aprovadas mais recentes. Confere protocolos, resumos originais e metadados; copia apenas os seis campos editoriais; sincroniza a base embutida da vitrine e solicita publicação do Pages. O estado em `portal/data/review-sync.json` impede regressões e detecta edições manuais concorrentes. Não modifica imagens, painel original ou conteúdo do evento.

## Validação realizada

- 6 testes de autorização, origem das requisições, aprovação atômica, conflito, rejeição e proteção do resumo original.
- TypeScript e build da aplicação aprovados.
- Migrações aplicadas na hospedagem e tabelas conferidas.
- Carga real e exportação de 143 fichas, sem divergências na base.
- 6 testes da importação no GitHub: aprovação, ausência de revisão, protocolos, original, conflito manual e regressão.
- Importação da exportação real sem produzir alterações, pois ainda não há revisões administrativas novas.

## Ainda necessário

- Cadastrar os dois segredos no GitHub e executar um ciclo real de sincronização.
- Testar login administrativo e um usuário piloto, incluindo a liberação de visitante e o vínculo ao protocolo.
- Conferência visual e móvel da área de gestão; o navegador desta sessão ainda não verificou a aplicação autenticada.
- Horários/programação e fluxos de inscrição, credenciamento e certificados do evento.
- E-mail institucional de contato somente no encerramento, conforme orientação expressa do usuário.
