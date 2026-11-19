# Portal HUB RJ

- Portal: https://rogeriotpires-spec.github.io/painel-hubrj/portal/
- Vitrine: https://rogeriotpires-spec.github.io/painel-hubrj/portal/vitrine.html

143 projetos, 143 imagens ilustrativas geradas por IA, 25 municípios e 33 áreas. Os protocolos foram conciliados com a lista oficial de selecionados para a Fase 3 publicada em 03/06/2026. Cada ficha ampliada contém o link para a página correspondente do PDF. Imagens são ilustrações, não fotografias dos produtos.

Os resumos e campos narrativos continuam sendo dados declarados na Fase 02, sujeitos à revisão editorial. A seleção oficial não comprova estágio de maturidade, vendas ou posição no ranking. Campos ausentes não foram inventados.

A seção Resultados do Programa (`#resultados`) mostra os resultados de execução das Fases 01 e 02 a partir de `data/execucao.json`: funil, indicadores consolidados, território, capacitações, mentorias, validação, pitch final, comparativo F01 × F02 e ranking do Pitch_02. Os dados são agregados e anonimizados: não há nomes de startups, proponentes ou Agentes de Inovação, e o ranking mostra posição, protocolo, polo e título do projeto (cruzado pelo protocolo com a base pública; "—" quando não há título), sem a faixa de desempenho e sem nomes de proponentes. Cada número indica a sua base: a vitrine usa os 143 projetos da Fase 3 (25 municípios); a Fase 01 tem 246 projetos em 31 municípios; a Fase 02, 150 startups em 26 municípios. Faixas e posições vêm do relatório de execução e não equivalem à classificação oficial da FAPERJ.

O Observatório apresenta todos os municípios e áreas, filtros independentes e contagem do recorte selecionado. A vitrine oferece galeria, catálogo e ficha ampliada. Desde 19/11/2026 o portal não oferece downloads: sem exportação CSV, sem baixar imagens e sem arquivo de calendário. A ficha ampliada mantém o botão "Salvar ficha em PDF" (impressão do navegador).

## Desempenho e arquivos derivados

- A vitrine abre com `data/projects-index.json` (campos dos cards, sem `fullSummary`). A base completa `data/projects.json` continua sendo a fonte e é buscada sob demanda: ao abrir a ficha, na busca por texto e na busca global.
- Os cards usam miniaturas WebP de 640 e 960 px (`assets/ai/640/`, `assets/ai/960/`) com `srcset`, `loading="lazy"` e `decoding="async"`; a ficha ampliada usa o original de 1536 × 1024.
- O logo fica em `assets/logo.webp` e o ícone em `assets/favicon.svg`.
- Observatório e Resultados só são desenhados ao se aproximar da área visível; as seções abaixo da dobra usam `content-visibility:auto`.
- `python scripts/build_portal_assets.py` gera miniaturas, índice leve e logo; `--check` confere se estão atualizados. O fluxo `.github/workflows/gerar-derivados-portal.yml` roda a cada push de imagens ou da base, e a sincronização de fichas e o gerador de imagens também atualizam os derivados.

## Área do proponente

- Página `proponente.html` (+ `proponente.js`), com link no rodapé do portal e da vitrine. Login = protocolo + senha; a senha inicial é provisória (distribuída pela coordenação) e a troca é obrigatória no primeiro acesso.
- Backend: Supabase, projeto `timeline-eventos` (`swznuvnqoylkekibrtij`), tabela `public.hubrj_cards` (uma linha por protocolo, vinculada ao usuário do Supabase Auth `<protocolo>@proponente.hubrj.local`) e bucket público `hubrj-cards` para imagens (até 2 MB, WebP/JPG/PNG). Esquema e regras em `../docs/supabase-area-proponente.sql`.
- O proponente edita proponente, área, setor, problema, solução, diferencial, mercado, estágio, objetivo, resumo curto, resumo completo, site e imagem. Título, protocolo e município ficam travados (não existem como colunas editáveis). Resultado oficial, fase e situação na FAPERJ não são editáveis.
- Publicação ao vivo, sem aprovação. `overrides.js` faz uma única consulta pública (chave publicável, somente leitura) e aplica os campos editados por cima de `data/projects.json`/`projects-index.json` no portal e na vitrine. Se o Supabase não responder, o portal segue com a base estática. Campos deixados em branco voltam ao texto original.
- Segurança (RLS + permissões por coluna): cada proponente só lê e altera a própria linha; o público só lê os cards já editados e apenas as colunas exibidas; ninguém insere ou apaga linhas pelo front-end; a edição e a liberação da conta só ocorrem depois da troca real da senha provisória (conferida no banco). A chave `service_role` não é usada no front-end nem no repositório.
- Senhas provisórias não ficam no repositório. Redefinir a senha de um proponente: pedir à equipe técnica (SQL no Supabase que restaura a senha provisória e volta a exigir a troca).

## Validação

```sh
python scripts/audit_hubrj_portal.py
python scripts/generate_hubrj_images.py --validate-only
python scripts/build_portal_assets.py --check
```

Executar a partir da raiz do repositório. A auditoria verifica a paridade da base JSON com a base incorporada em `vitrine.html`, os protocolos oficiais e a presença das imagens, e atualiza `docs/auditoria-editorial.json`.

## Pendências

Acompanhar `../docs/PENDENCIAS.md`. Administração, aprovação de alterações, inscrições, credenciamento e certificados ainda precisam de servidor e banco de dados. Datas do evento aguardam confirmação. A tradução atual cobre apenas a navegação. O painel existente na raiz permanece preservado e restrito; `data/execucao.json` foi derivado dele sem os campos com nomes.
