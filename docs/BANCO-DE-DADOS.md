# Como funciona o banco de dados

## Visão geral

O projeto usa **Prisma ORM** para falar com o banco. Em **produção (Vercel)** o banco é **PostgreSQL**. Os dados ficam em tabelas relacionadas: operações → lançamentos diários → gastos e receitas.

## Fluxo dos dados

1. **Operação** (`operations`)  
   Cada “negócio” ou linha que você controla (ex.: Loja A, Canal B).  
   Guarda: nome, orçamento diário, conta PIX, categorias de gasto (JSON).

2. **Lançamento diário** (`daily_entries`)  
   Um dia de uma operação.  
   Uma operação tem vários dias; cada dia tem uma única entrada por data (único por `operation_id` + `date`).  
   Guarda: data, observações do dia.

3. **Gastos** (`expenses`)  
   Gastos daquele dia.  
   Cada gasto pertence a um lançamento diário.  
   Guarda: categoria (Ads, IA, etc.), valor, se é mensal (rateado), ajuste manual, descrição.

4. **Receitas** (`revenues`)  
   Receitas PIX daquele dia.  
   Cada receita pertence a um lançamento diário.  
   Guarda: valor, descrição, horário (opcional).

## Relacionamentos

```
Operation (1) ──► (N) DailyEntry
DailyEntry (1) ──► (N) Expense
DailyEntry (1) ──► (N) Revenue
```

- Ao apagar uma **operação**, todos os lançamentos (e gastos/receitas) são apagados em cascata.
- Ao apagar um **lançamento diário**, todos os gastos e receitas daquele dia são apagados em cascata.

## Onde os dados são usados

- **Prisma** (`prisma/schema.prisma`): define as tabelas e relações.
- **Server Actions** (`src/app/actions/`): criam, atualizam e apagam operações, lançamentos, gastos e receitas.
- **API Routes** (`src/app/api/`): login, criação de lançamento, export e backup usam o mesmo banco via Prisma.
- **Lib** (`src/lib/data.ts`, `prisma.ts`): leituras e agregações (estatísticas, insights, resumo por categoria).

## Produção (Vercel)

- O banco em produção é **PostgreSQL** (Vercel Postgres, Neon, Supabase, etc.).
- A URL do banco vem da variável **`DATABASE_URL`** no ambiente da Vercel.
- No deploy, o comando de build roda **`prisma migrate deploy`**, que aplica as migrações em `prisma/migrations/` e deixa o schema do banco alinhado com o código.

Resumo: o “banco” é o PostgreSQL que você conecta pela `DATABASE_URL`; o Prisma só traduz o que o app faz (criar operação, lançar gasto, etc.) em SQL nesse banco.
