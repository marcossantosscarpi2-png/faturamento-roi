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

O projeto já está com Git inicializado e um commit inicial na branch `main`. Falta só criar o repositório no GitHub e enviar o código.

1. No GitHub: **New repository** → nome (ex.: `faturamento-roi`) → **Create repository** (não marque “Add a README” se o projeto já tiver um).
2. Na pasta do projeto no seu computador, adicione o remote e faça o push:

```bash
git remote add origin https://github.com/SEU_USUARIO/faturamento-roi.git
git push -u origin main
```

(Substitua `SEU_USUARIO` pelo seu usuário do GitHub. Se o repo for criado em uma organização, use o nome da organização no lugar de `SEU_USUARIO`.)

## 3. Projeto na Vercel

1. Acesse https://vercel.com e faça login (com a conta do GitHub).
2. **Add New** → **Project**.
3. **Import** o repositório `faturamento-roi` (conecte o GitHub se pedir).
4. **Configure Project**:
   - **Framework Preset**: Next.js (já detectado).
   - **Build Command**: `npm run build` (padrão; já usa `prisma generate` e `prisma migrate deploy`).
   - **Output Directory**: deixe padrão.
5. **Environment Variables** (obrigatório para o banco e para autenticação):

   | Nome            | Valor                    | Observação                          |
   |-----------------|--------------------------|-------------------------------------|
   | `DATABASE_URL`  | `postgresql://...`       | URL do PostgreSQL (ver passo 1).    |
   | `AUTH_MODE`     | `users`                  | Habilita login/registro por usuário e senha. |

   Marque essas variáveis para **Production**, **Preview** e **Development** se for usar em todos.

6. Clique em **Deploy**.

O primeiro deploy vai:

- Rodar `prisma generate` e `prisma migrate deploy` (criar/atualizar tabelas no PostgreSQL).
- Rodar `next build` e publicar o app.

## 4. Depois do deploy

- A URL do app será algo como `https://faturamento-roi-xxx.vercel.app`.
- Você poderá **criar conta** e depois fazer login com **usuário/senha**.
- Novos pushes na branch `main` disparam um novo deploy automaticamente.

## Resumo

1. Criar PostgreSQL (Vercel Postgres, Neon ou Supabase).  
2. Criar repositório no GitHub e dar `git push`.  
3. Na Vercel: importar o repo, configurar `DATABASE_URL` e `AUTH_MODE=users` e fazer deploy.

Qualquer dúvida sobre o banco, veja `docs/BANCO-DE-DADOS.md`.
