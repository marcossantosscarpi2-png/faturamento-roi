# Faturamento & ROI

Sistema web de gestão de faturamento e ROI para uso pessoal na empresa.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **Tailwind CSS**
- **Recharts** (gráficos)
- **Deploy:** Vercel

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                     │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │   Pages     │  │ Server       │  │  API Routes         │ │
│  │   (RSC)     │  │ Actions      │  │  /api/auth/*        │ │
│  │             │  │              │  │  /api/export/*      │ │
│  │  /          │  │ operations   │  │  /api/entries/*     │ │
│  │  /operacoes │  │ entries      │  │                     │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Prisma ORM                              │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL                                │
└─────────────────────────────────────────────────────────────┘
```

## Modelagem do Banco de Dados (Prisma)

```
Operation (Operação)
├── id, name, dailyBudget, pixAccount
└── DailyEntry[] (1:N)

DailyEntry (Lançamento diário)
├── id, date, operationId, observations
├── Expense[] (1:N)
└── Revenue[] (1:N)

Expense (Gasto)
├── id, dailyEntryId, category (ADS|IA|CHIPS|VARIAVEL)
├── amount, description, isMonthly, manualAdjust
└── → DailyEntry

Revenue (Receita - PIX)
├── id, dailyEntryId, amount, description
└── → DailyEntry
```

## Estrutura de Pastas

```
faturamento-roi/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── actions/           # Server Actions
│   │   │   ├── operations.ts
│   │   │   └── entries.ts
│   │   ├── api/               # API Routes
│   │   │   ├── auth/
│   │   │   ├── entries/
│   │   │   └── export/
│   │   ├── operacoes/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── editar/
│   │   │   └── nova/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── operations/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── calculations.ts
│   │   ├── data.ts
│   │   ├── prisma.ts
│   │   └── utils.ts
│   └── middleware.ts
├── .env.example
├── package.json
└── README.md
```

## Fluxo de Uso

1. **Login/Registro** (usuário e senha, `AUTH_MODE=users`)
2. **Listar Operações** → Página inicial
3. **Criar Operação** → Nome, orçamento diário, conta PIX
4. **Acessar Operação** → Dashboard com período (7/15/30 dias)
5. **Adicionar Lançamentos**:
   - **Novo dia** → Criar lançamento diário
   - **Gastos** → Ads, IA, Chips, Gastos variáveis (mensal ou diário)
   - **Receitas** → PIX
6. **Visualizar** → Gráficos, cards, insights
7. **Exportar** → Excel ou PDF

## Funcionalidades do MVP

- [x] Autenticação por usuário/senha com registro (`AUTH_MODE=users`)
- [x] CRUD de Operações
- [x] Lançamentos diários (gastos e receitas)
- [x] Categorias de gasto: Ads, IA, Chips, Gastos variáveis
- [x] Gastos mensais rateados por dia
- [x] Cálculos automáticos: total, lucro, ROI
- [x] ROI "—" quando gasto = 0
- [x] Dashboard com visão 7/15/30 dias
- [x] Gráficos: Receita x Gasto, Lucro, ROI
- [x] Insights: variação ROI, gastos acima da média
- [x] Exportação Excel e PDF
- [x] Campo de observações por dia
- [x] Responsivo (desktop e mobile)

## Banco de dados

O app usa **PostgreSQL** (Prisma ORM). Operações, lançamentos diários, gastos e receitas ficam em tabelas relacionadas. Detalhes em **[docs/BANCO-DE-DADOS.md](docs/BANCO-DE-DADOS.md)**.

## Configuração e Deploy

### Local

1. Clone e instale dependências:
```bash
cd faturamento-roi
npm install
```

2. Configure o `.env`:
```bash
cp .env.example .env
# Edite .env: DATABASE_URL (PostgreSQL) e AUTH_MODE
```

3. Tenha um PostgreSQL (Docker, Neon, Supabase, etc.) e aplique as migrações:
```bash
npx prisma migrate deploy
# ou, em desenvolvimento: npx prisma db push
```

4. Inicie o servidor:
```bash
npm run dev
```

### Deploy na Vercel

Passo a passo completo em **[docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md)**.

Resumo:
1. Crie um PostgreSQL (Vercel Postgres, Neon ou Supabase).
2. Crie o repositório no GitHub (vazio, sem README) e envie o código:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/faturamento-roi.git
   git push -u origin main
   ```
3. Na Vercel: importe o repo, configure `DATABASE_URL` e `AUTH_MODE=users` e faça o deploy.

## Sugestões de Melhorias Futuras

1. **Comparação entre operações** – gráfico comparativo de ROI
2. **Filtro por categoria** – análise de gastos por tipo
3. **Meta de orçamento** – alerta quando ultrapassar orçamento diário
4. **Notificações** – aviso de gastos acima da média
5. **Backup automático** – exportação agendada
6. **Multi-moeda** – suporte opcional a outras moedas
7. **Temas** – modo escuro
8. **PWA** – instalação como app mobile
