# Me Emprega · Frontend

Construtor de currículo em React, Next.js App Router e TypeScript. Interface própria em português, com fluxo por etapas inspirado em plataformas de candidatura, sem dependência ou integração com a Gupy.

## Docker

Para subir frontend + FastAPI + PostgreSQL, clone este repositório ao lado de `memprega-backend` e execute no backend:

```sh
docker compose --profile full up --build -d
```

Para subir apenas o frontend neste diretório:

```sh
docker compose up --build -d
```

Acesse http://localhost:3000. A API deve estar em http://localhost:8000. `NEXT_PUBLIC_API_URL` é a URL acessível pelo navegador, não o hostname interno `api` do Docker. Para outro ambiente, defina essa variável antes do build; Next.js incorpora variáveis públicas no bundle.

## Desenvolvimento

```sh
npm ci
# Copie .env.example para .env.local se precisar mudar a URL da API
npm run dev
```

## Recursos

- Dados pessoais e contatos, resumo e links profissionais.
- Experiências e formações repetíveis, com períodos e estado atual.
- Habilidades e idiomas, revisão e prévia ao vivo.
- Rascunho automático neste navegador, exemplo fictício e exclusão.
- Validação, estados de carregamento/erro e download real do PDF da API.
- Layout responsivo, labels acessíveis e navegação por teclado.

Nenhum dado é enviado ao servidor antes de salvar/baixar. O armazenamento local contém dados pessoais e a credencial do currículo; use apagar ao terminar em computadores compartilhados. O botão de exemplo substitui os campos, mediante confirmação. As fontes web possuem fallback local. Prévia HTML e PDF têm a mesma informação, mas paginação e métricas tipográficas podem diferir.

## Verificação

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Os testes E2E exigem a API em `localhost:8000` e iniciam o frontend automaticamente. Com frontend já rodando em Docker, reutilizam `localhost:3000`.

O modelo de CI está em `.github/workflow-templates/ci.yml`, desativado porque a credencial de publicação não possui o escopo `workflow`. Para ativar, mova para `.github/workflows/ci.yml` usando uma credencial com essa permissão.

Backend: https://github.com/Eric-LDo/memprega-backend

Referência: [Next.js App Router](https://nextjs.org/docs/app/getting-started/installation).
