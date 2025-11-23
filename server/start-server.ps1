# Script para iniciar el servidor de forma robusta
Write-Host "🚀 Iniciando Safe Paw API Server..." -ForegroundColor Cyan

# Verificar si el puerto está en uso
$port = 4000
$portInUse = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue

if ($portInUse) {
    Write-Host "⚠️  El puerto $port ya está en uso. Verificando si es nuestro servidor..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ El servidor ya está corriendo en el puerto $port" -ForegroundColor Green
            exit 0
        }
    } catch {
        Write-Host "❌ El puerto está en uso pero no responde. Por favor, detén el proceso que usa el puerto $port" -ForegroundColor Red
        exit 1
    }
}

# Verificar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "❌ No se encontró el archivo .env. Por favor, créalo con las variables de entorno necesarias." -ForegroundColor Red
    Write-Host "   Revisa el archivo README.md para más información." -ForegroundColor Yellow
    exit 1
}

# Verificar que las dependencias estén instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Iniciar el servidor
Write-Host "✅ Iniciando servidor en modo desarrollo..." -ForegroundColor Green
npm run dev




