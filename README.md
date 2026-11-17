# ts-hub — site oficial

Página oficial do TS HUB, o launcher gratuito de jogos retrô.

**Autoria:** TStudio ™ | Tsuyo Studio

## Atualizar o download do site

O site usa a última release **estável e pública** deste repositório.

1. Acesse [Releases](https://github.com/TsuyoStudio/ts-downloads/releases) e clique em **Draft a new release**.
2. Crie uma tag, por exemplo, `v0.3.4`.
3. Anexe o instalador Windows, preferencialmente `TS-HUB-Setup-v0.3.4.exe` (também são aceitos arquivos .msi e .zip).
4. Publique a release como **estável**, não como rascunho/pré-lançamento.
5. O site na Vercel detectará a atualização automaticamente (cache de até alguns minutos).

O botão de download é desabilitado quando não existe instalador publicado, em vez de apontar para um arquivo inventado. A versão e as informações de release são obtidas da API do GitHub por /api/latest, sem depender de atualização manual do HTML.

## Hospedagem

Site estático sem build; API serverless em Node.js. Projeto Vercel: `ts-hub`.

O site **não oferece downloads dos jogos**: a distribuição aqui é apenas do aplicativo TS HUB.

## Execução local

Use `vercel dev` para testar a API e o site. Um servidor estático comum não executa /api/latest.

**TStudio ™ | Tsuyo Studio**