# Lumen Conecta API

backend (Fastify + Zod + Supabase + Firebase Admin).

## Estrutura
- apps/api: API Fastify com middlewares de auth/roles e rotas de eventos, galerias e backoffice (mockadas).

## Requisitos
- Node.js 18+
- pnpm/yarn conforme preferência

## Setup rápido
```sh
pnpm install
pnpm dev   # backend em http://localhost:3333
```

Configure `.env` em `apps/web` e `apps/api` a partir dos arquivos `.env.example` para Firebase e Supabase.

## Scripts principais
- pnpm dev — inicia o Fastify com tsx.
- pnpm build — executa build.
- pnpm lint — lint em todos os arquivos.
- pnpm format — formata código (Prettier) em todos os arquivos.
