# Automação de imagens HUB RJ

Fluxo: `.github/workflows/gerar-imagens-hubrj.yml`.

## Execução

1. Cadastre `OPENAI_API_KEY` em **Settings → Secrets and variables → Actions**.
   Nunca coloque a chave em arquivos, commits, mensagens ou parâmetros do fluxo.
2. Em **Actions → Gerar imagens das startups HUB RJ → Run workflow**, mantenha
   `apenas_verificar` ativo para conferir sem chamar a API.
3. Para gerar, desative `apenas_verificar`. O padrão é três imagens. A opção 84
   atende todas as pendências originais e sempre pula protocolos já concluídos.

Também é possível atualizar `.github/hubrj-image-request.json` em `main`. Apenas
alterações nesse arquivo disparam a geração por push. O pedido é lido do commit
que disparou a execução, enquanto as imagens existentes são lidas do `main` atual.
`protocolos` restringe a lista; quando omitido, seleciona os próximos pendentes.
Alterar apenas `solicitacao` permite retomar o mesmo pedido após corrigir a chave.

## Preservação e validação

- A base `portal/data/projects.json` é a fonte de protocolo, título, resumo, área
  e município. Campos de proponente e pesquisadores não entram no prompt.
- Protocolos duplicados, desconhecidos ou inválidos impedem a execução.
- Imagens existentes nunca são substituídas ou apagadas. Seus hashes são conferidos.
- Cada nova imagem precisa ser WebP válido, estático, de 1536 × 1024 pixels.
- Apenas a nova imagem, o manifesto e o conjunto `aiIds` dos dois índices são publicados.
- Cada protocolo concluído recebe seu próprio commit. Push sem força; alterações
  concorrentes interrompem a publicação de forma segura.
- Erros transitórios permitem três tentativas, com pausa de dois minutos. Falhas
  de autenticação, acesso e saldo interrompem imediatamente o lote.
- Relatório e cópia das imagens ficam nos artefatos da execução por 14 dias.
- A publicação solicita explicitamente o build do GitHub Pages, preservando sua
  configuração de hospedagem. Commits feitos com `GITHUB_TOKEN` não o disparam sozinhos.

## Validação local, sem custos de API

```sh
python -m pip install 'Pillow>=11,<14'
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover -s scripts -p 'test_generate_hubrj_images.py' -v
python scripts/generate_hubrj_images.py --validate-only
python scripts/generate_hubrj_images.py --limit 3 --dry-run
```

Modelo mantido: `gpt-image-2.5-flare`, qualidade `medium`, saída WebP.
As três primeiras imagens do teste integram as 84 pendências, não são imagens extras.
