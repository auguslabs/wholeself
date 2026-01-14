# Script para crear un snapshot del estado actual del proyecto
# Uso: .\scripts\crear-snapshot.ps1 [tipo] [descripcion]
# Tipos: snapshot, stable, pre-feature
# Ejemplo: .\scripts\crear-snapshot.ps1 snapshot "Estado antes de traducción"

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("snapshot", "stable", "pre-feature")]
    [string]$Tipo = "snapshot",
    
    [Parameter(Mandatory=$false)]
    [string]$Descripcion = ""
)

# Cambiar al directorio del proyecto
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "`n=== Creando Snapshot del Proyecto ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que no hay cambios sin commitear (opcional - solo advertencia)
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  ADVERTENCIA: Hay cambios sin commitear:" -ForegroundColor Yellow
    Write-Host $status
    Write-Host ""
    $continuar = Read-Host "¿Deseas continuar de todas formas? (s/n)"
    if ($continuar -ne "s" -and $continuar -ne "S") {
        Write-Host "Operación cancelada." -ForegroundColor Red
        exit 1
    }
}

# 2. Verificar que el proyecto compila
Write-Host "🔨 Verificando que el proyecto compila..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: El proyecto no compila correctamente." -ForegroundColor Red
    Write-Host "Por favor, corrige los errores antes de crear un snapshot." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Proyecto compila correctamente" -ForegroundColor Green
Write-Host ""

# 3. Generar nombre del tag
$fecha = Get-Date -Format "yyyy-MM-dd"
$hora = Get-Date -Format "HHmm"

switch ($Tipo) {
    "snapshot" {
        $tagName = "snapshot-$fecha"
        if ($Descripcion -eq "") {
            $Descripcion = "Snapshot del estado funcional del proyecto"
        }
    }
    "stable" {
        # Pedir versión si es estable
        if ($Descripcion -eq "") {
            $version = Read-Host "Ingresa el número de versión (ej: 1.0.0)"
            $tagName = "v$version-stable"
            $Descripcion = "Versión estable $version"
        } else {
            $tagName = "v$Descripcion-stable"
            $Descripcion = "Versión estable $Descripcion"
        }
    }
    "pre-feature" {
        if ($Descripcion -eq "") {
            $featureName = Read-Host "Nombre de la feature (ej: traduccion)"
            $tagName = "pre-feature-$featureName"
            $Descripcion = "Snapshot antes de implementar: $featureName"
        } else {
            $tagName = "pre-feature-$Descripcion"
            $Descripcion = "Snapshot antes de implementar: $Descripcion"
        }
    }
}

# 4. Verificar si el tag ya existe
$tagExists = git tag -l $tagName
if ($tagExists) {
    Write-Host "⚠️  El tag '$tagName' ya existe." -ForegroundColor Yellow
    $sobrescribir = Read-Host "¿Deseas sobrescribirlo? (s/n)"
    if ($sobrescribir -ne "s" -and $sobrescribir -ne "S") {
        Write-Host "Operación cancelada." -ForegroundColor Red
        exit 1
    }
    git tag -d $tagName
    git push origin :refs/tags/$tagName 2>$null
}

# 5. Asegurar que todos los cambios estén commiteados
Write-Host "📝 Verificando estado de Git..." -ForegroundColor Yellow
$uncommitted = git status --porcelain
if ($uncommitted) {
    Write-Host "Hay cambios sin commitear. ¿Deseas commitearlos ahora?" -ForegroundColor Yellow
    Write-Host $uncommitted
    $commitear = Read-Host "¿Commitear cambios? (s/n)"
    if ($commitear -eq "s" -or $commitear -eq "S") {
        $mensajeCommit = Read-Host "Mensaje del commit"
        if ($mensajeCommit -eq "") {
            $mensajeCommit = "Estado antes de snapshot $tagName"
        }
        git add .
        git commit -m $mensajeCommit
        Write-Host "✅ Cambios commiteados" -ForegroundColor Green
    }
}

# 6. Crear el tag
Write-Host ""
Write-Host "🏷️  Creando tag: $tagName" -ForegroundColor Cyan
Write-Host "   Descripción: $Descripcion" -ForegroundColor Gray

git tag -a $tagName -m $Descripcion

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tag creado localmente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al crear el tag" -ForegroundColor Red
    exit 1
}

# 7. Push del tag al remoto
Write-Host ""
Write-Host "📤 Enviando tag al repositorio remoto..." -ForegroundColor Yellow
git push origin $tagName

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tag enviado al remoto" -ForegroundColor Green
} else {
    Write-Host "⚠️  No se pudo enviar el tag al remoto (puede que no haya remoto configurado)" -ForegroundColor Yellow
}

# 8. Resumen
Write-Host ""
Write-Host "=== Snapshot Creado Exitosamente ===" -ForegroundColor Green
Write-Host ""
Write-Host "Tag: $tagName" -ForegroundColor Cyan
Write-Host "Descripción: $Descripcion" -ForegroundColor Gray
Write-Host ""
Write-Host "Para restaurar esta versión:" -ForegroundColor Yellow
Write-Host "  git checkout $tagName" -ForegroundColor White
Write-Host ""
Write-Host "O crear un branch desde esta versión:" -ForegroundColor Yellow
Write-Host "  git checkout -b restore-$tagName $tagName" -ForegroundColor White
Write-Host ""
