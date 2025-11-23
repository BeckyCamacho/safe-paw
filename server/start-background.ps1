# Script para iniciar el servidor en segundo plano
Write-Host "🚀 Iniciando Safe Paw API Server en segundo plano..." -ForegroundColor Cyan

# Verificar si el puerto está en uso
$port = 4000
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$port/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ El servidor ya está corriendo en el puerto $port" -ForegroundColor Green
        exit 0
    }
} catch {
    # El servidor no está corriendo, continuar
}

# Verificar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "❌ No se encontró el archivo .env. Por favor, créalo con las variables de entorno necesarias." -ForegroundColor Red
    exit 1
}

# Cambiar al directorio del servidor
$serverPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $serverPath

# Iniciar el servidor en segundo plano
Write-Host "✅ Iniciando servidor en segundo plano..." -ForegroundColor Green
$job = Start-Job -ScriptBlock {
    Set-Location $using:serverPath
    npm run dev
}

Write-Host "✅ Servidor iniciado en segundo plano (Job ID: $($job.Id))" -ForegroundColor Green
Write-Host "📍 Para ver los logs: Receive-Job -Id $($job.Id)" -ForegroundColor Yellow
Write-Host "📍 Para detener el servidor: Stop-Job -Id $($job.Id); Remove-Job -Id $($job.Id)" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Tip: Guarda el Job ID ($($job.Id)) para poder detenerlo después" -ForegroundColor Cyan

# Guardar el Job ID en un archivo para referencia
$job.Id | Out-File -FilePath ".server-job-id" -Encoding utf8




