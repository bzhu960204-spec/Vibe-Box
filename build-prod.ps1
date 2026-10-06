param(
  [switch]$SkipFrontend = $false
)

# Builds the production artifacts for the single-port "prod" flow:
#   1) builds the React frontend  -> frontend/dist
#   2) packages the Spring Boot fat jar -> backend/target/vibebox-backend-*.jar
# Run this after changing frontend or backend code. The dev flow (start-dev.cmd)
# is unaffected — this only produces the artifacts that start-prod.cmd runs.

$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptRoot 'backend'
$frontendDir = Join-Path $scriptRoot 'frontend'

if (-not (Test-Path $backendDir)) { throw "Backend directory not found: $backendDir" }
if (-not (Test-Path $frontendDir)) { throw "Frontend directory not found: $frontendDir" }

$mvnCmd = Get-Command mvn.cmd -ErrorAction SilentlyContinue
if (-not $mvnCmd) { $mvnCmd = Get-Command mvn -ErrorAction SilentlyContinue }
$npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npmCmd) { $npmCmd = Get-Command npm -ErrorAction SilentlyContinue }
if (-not $mvnCmd) { throw "Maven (mvn) not found on PATH. Install Maven or add it to PATH, then retry." }
if (-not $npmCmd) { throw "npm not found on PATH. Install Node.js/npm or add it to PATH, then retry." }
$mvnExe = $mvnCmd.Source
$npmExe = $npmCmd.Source

if (-not $SkipFrontend) {
  Write-Host "Building frontend..." -ForegroundColor Cyan
  Push-Location $frontendDir
  try {
    if (-not (Test-Path 'node_modules')) { & $npmExe install }
    & $npmExe run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
  } finally {
    Pop-Location
  }
} else {
  Write-Host "Skipping frontend build (-SkipFrontend)." -ForegroundColor DarkGray
}

Write-Host "Packaging backend fat jar..." -ForegroundColor Cyan
Push-Location $backendDir
try {
  & $mvnExe -q -DskipTests clean package
  if ($LASTEXITCODE -ne 0) { throw "Backend package failed" }
} finally {
  Pop-Location
}

$jar = Get-ChildItem (Join-Path $backendDir 'target') -Filter 'vibebox-backend-*.jar' -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -notlike '*.original' } |
  Select-Object -First 1
if (-not $jar) { throw "Jar not found under backend/target" }

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host " Production artifacts ready"
Write-Host "   Jar     : $($jar.FullName)"
Write-Host "   Frontend: $(Join-Path $frontendDir 'dist')"
Write-Host " Launch with start-prod.cmd"
Write-Host "===============================================" -ForegroundColor Green
