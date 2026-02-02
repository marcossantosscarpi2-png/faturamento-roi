# Script para rodar o projeto em localhost
# Execute no PowerShell: .\run-local.ps1

Write-Host "Instalando dependencias..." -ForegroundColor Cyan
npm install

Write-Host "`nGerando Prisma Client e criando banco..." -ForegroundColor Cyan
npx prisma generate
npx prisma db push

Write-Host "`nIniciando servidor em http://localhost:3000" -ForegroundColor Green
npm run dev
