# Script para rodar o projeto em localhost
# Execute no PowerShell: .\run-local.ps1

Write-Host "Instalando dependencias..." -ForegroundColor Cyan
npm install

Write-Host "`nGerando Prisma Client e criando banco..." -ForegroundColor Cyan
npx prisma generate --schema prisma/schema.sqlite.prisma
npx prisma db push --schema prisma/schema.sqlite.prisma

Write-Host "`nIniciando servidor em http://localhost:3000" -ForegroundColor Green
npm run dev
