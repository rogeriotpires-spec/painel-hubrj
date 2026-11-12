# Portal HUB RJ | Vitrine de Startups

## Endereços publicados no GitHub Pages

- Portal: https://rogeriotpires-spec.github.io/painel-hubrj/portal/
- Vitrine com fichas completas: https://rogeriotpires-spec.github.io/painel-hubrj/portal/vitrine.html

## Entrega v2

- 143 projetos extraídos da planilha `HUBRJ25_ResumoProjeto_F02.xlsx`.
- 143 ilustrações vetoriais temáticas individuais (`assets/startups/*.svg`).
- 143 fichas com problema, solução, diferencial, potencial de mercado, estágio declarado, objetivo e resumo original.
- Pesquisa em texto, filtros por município e setor, modos de galeria e catálogo.
- Download da ilustração SVG, impressão da ficha como PDF e exportação CSV sem CPF nem e-mail pessoal.
- Vitrine autônoma `vitrine.html`, com dados e ilustrações incorporados, pronta para GitHub Pages.

## Limitações documentais

- A planilha não é um resultado oficial de classificação/aprovação, nem inclui agentes de inovação ou ranking de pitch.
- Os textos são extraídos automaticamente dos resumos enviados e exigem revisão editorial antes da chancela institucional.
- As artes são ilustrações vetoriais temáticas, não imagens fotorrealistas produzidas por IA nem fotografias dos produtos.
- Stage, mercado e outros campos sem evidência nos resumos são identificados como não informados.
- Backend de login, aprovação de atualizações, inscrições, credenciamento e certificados não são oferecidos por hospedagem estática do GitHub Pages.
- As datas do evento ainda apresentam divergência entre os materiais.

## Teste local

`python3 -m http.server 8000`

Abrir `http://localhost:8000/vitrine.html`. O arquivo `vitrine.html` também pode ser aberto diretamente no navegador sem servidor.
