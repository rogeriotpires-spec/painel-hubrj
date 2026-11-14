# Portal HUB RJ

- Portal: https://rogeriotpires-spec.github.io/painel-hubrj/portal/
- Vitrine: https://rogeriotpires-spec.github.io/painel-hubrj/portal/vitrine.html

143 projetos, 143 imagens ilustrativas geradas por IA, 25 municípios e 33 áreas. Os protocolos foram conciliados com a lista oficial de selecionados para a Fase 3 publicada em 03/06/2026. Cada ficha ampliada contém o link para a página correspondente do PDF. Imagens são ilustrações, não fotografias dos produtos.

Os resumos e campos narrativos continuam sendo dados declarados na Fase 02, sujeitos à revisão editorial. A seleção oficial não comprova estágio de maturidade, vendas ou posição no ranking. Campos ausentes não foram inventados.

O Observatório apresenta todos os municípios e áreas, filtros independentes e exportação CSV do recorte selecionado. A vitrine oferece galeria, catálogo, ficha ampliada, impressão e download da imagem atual.

## Validação

```sh
python scripts/audit_hubrj_portal.py
python scripts/generate_hubrj_images.py --validate-only
```

Executar a partir da raiz do repositório. A auditoria verifica a paridade da base JSON com a base incorporada em `vitrine.html`, os protocolos oficiais e a presença das imagens, e atualiza `docs/auditoria-editorial.json`.

## Pendências

Acompanhar `../docs/PENDENCIAS.md`. Administração, acesso individual, aprovação de alterações, inscrições, credenciamento e certificados ainda precisam de servidor e banco de dados. Datas do evento aguardam confirmação. A tradução atual cobre apenas a navegação. O painel existente na raiz permanece preservado.
