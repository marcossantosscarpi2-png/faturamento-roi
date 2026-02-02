# Deploy na Vercel

Siga estes passos para publicar o projeto na Vercel e conectar ao GitHub.

## 1. Banco de dados (PostgreSQL)

A Vercel não hospeda arquivo de banco (SQLite). Você precisa de um **PostgreSQL**:

- **Vercel Postgres** (no painel do projeto Vercel: Storage > Create Database > Postgres)  
  ou  
- **Neon** (https://neon.tech), **Supabase** (https://supabase.com) ou outro provedor.

Crie um banco e copie a **connection string** (URL) no formato:

```text
postgresql://usuario:senha@host:5432/nome_do_banco?sslmode=require
```

Guarde essa URL; você vai colocar na Vercel como `DATABASE_URL`.

## 2. Repositório no GitHub

1. Crie um repositório novo no GitHub (ex.: `faturamento-roi`).
2. No seu computador, na pasta do projeto, adicione o remote e envie o código:

```bash
git remote add origin https://github.com/SEU_USUARIO/faturamento-roi.git
git branch -M main
git push -u origin main
```

(Substitua `SEU_USUARIO` pelo seu usuário do GitHub.)

## 3. Projeto na Vercel

1. Acesse https://vercel.com e faça login (com a conta do GitHub).
2. **Add New** → **Project**.
3. **Import** o repositório `faturamento-roi` (conecte o GitHub se pedir).
4. **Configure Project**:
   - **Framework Preset**: Next.js (já detectado).
   - **Build Command**: `npm run build` (padrão; já usa `prisma generate` e `prisma migrate deploy`).
   - **Output Directory**: deixe padrão.
5. **Environment Variables** (obrigatório para o banco e opcional para senha):

   | Nome            | Valor                    | Observação                          |
   |-----------------|--------------------------|-------------------------------------|
   | `DATABASE_URL`  | `postgresql://...`       | URL do PostgreSQL (ver passo 1).    |
   | `APP_PASSWORD`  | (opcional) sua senha    | Se não definir, o app fica sem login. |

   Marque essas variáveis para **Production**, **Preview** e **Development** se for usar em todos.

6. Clique em **Deploy**.

O primeiro deploy vai:

- Rodar `prisma generate` e `prisma migrate deploy` (criar/atualizar tabelas no PostgreSQL).
- Rodar `next build` e publicar o app.

## 4. Depois do deploy

- A URL do app será algo como `https://faturamento-roi-xxx.vercel.app`.
- Se definiu `APP_PASSWORD`, use essa senha na tela de login.
- Novos pushes na branch `main` disparam um novo deploy automaticamente.

## Resumo

1. Criar PostgreSQL (Vercel Postgres, Neon ou Supabase).  
2. Criar repositório no GitHub e dar `git push`.  
3. Na Vercel: importar o repo, configurar `DATABASE_URL` (e opcionalmente `APP_PASSWORD`) e fazer deploy.

Qualquer dúvida sobre o banco, veja `docs/BANCO-DE-DADOS.md`.
