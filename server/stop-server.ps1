# Script para detener el servidor que está corriendo en segundo plano
Write-Host "🛑 Deteniendo Safe Paw API Server..." -ForegroundColor Yellow

# Intentar leer el Job ID guardado
$jobIdFile = ".server-job-id"
if (Test-Path $jobIdFile) {
    $jobId = Get-Content $jobIdFile -Raw
    $jobId = $jobId.Trim()
    
    try {
        Stop-Job -Id $jobId -ErrorAction Stop
        Remove-Job -Id $jobId -ErrorAction Stop
        Remove-Item $jobIdFile -ErrorAction SilentlyContinue
        Write-Host "✅ Servidor detenido correctamente" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  No se pudo detener el job con ID $jobId" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  No se encontró el archivo .server-job-id" -ForegroundColor Yellow
    Write-Host "   Buscando procesos de Node en el puerto 4000..." -ForegroundColor Yellow
}

# También intentar detener procesos de Node que estén usando el puerto 4000
$processes = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "✅ Proceso $pid detenido" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  No se pudo detener el proceso $pid" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "ℹ️  No se encontraron procesos usando el puerto 4000" -ForegroundColor Cyan
}




