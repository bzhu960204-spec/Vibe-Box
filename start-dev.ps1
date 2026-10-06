param(
  [int]$BackendPort = 8091,
  [int]$FrontendPort = 5173,
  [switch]$StopExisting = $false
)

$ErrorActionPreference = 'Stop'
# Don't let non-zero exit codes from probe-style native commands abort the script.
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -Scope Global -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $false
}

function Stop-ListeningProcessByPort {
  param([int]$Port)
  $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if (-not $connections) {
    Write-Host "No listening process on port $Port"
    return
  }
  $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($processId in $processIds) {
    try {
      Stop-Process -Id $processId -Force -ErrorAction Stop
      Write-Host "Stopped process $processId on port $Port"
    } catch {
      Write-Host "Failed to stop process $processId on port ${Port}: $($_.Exception.Message)"
    }
  }
}

function Test-PortListening {
  param([int]$Port)
  $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  return $null -ne $connections
}

function Get-NextAvailablePort {
  param(
    [int]$StartPort,
    [int[]]$ReservedPorts = @(),
    [int]$MaxSteps = 100
  )
  $candidate = $StartPort
  for ($i = 0; $i -le $MaxSteps; $i++) {
    if (($ReservedPorts -contains $candidate) -or (Test-PortListening -Port $candidate)) {
      $candidate++
      continue
    }
    return $candidate
  }
  throw "Could not find an available port after checking $MaxSteps ports from $StartPort"
}

$scriptRoot  = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir  = Join-Path $scriptRoot 'backend'
$frontendDir = Join-Path $scriptRoot 'frontend'

if (-not (Test-Path $backendDir))  { throw "Backend directory not found: $backendDir" }
if (-not (Test-Path $frontendDir)) { throw "Frontend directory not found: $frontendDir" }

# Resolve the native launchers (npm.ps1 is blocked by execution policy on this box).
$mvnCmd = Get-Command mvn.cmd -ErrorAction SilentlyContinue
if (-not $mvnCmd) { $mvnCmd = Get-Command mvn -ErrorAction SilentlyContinue }
$npmCmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npmCmd) { $npmCmd = Get-Command npm -ErrorAction SilentlyContinue }
if (-not $mvnCmd) { throw "Maven (mvn) not found on PATH. Install Maven or add it to PATH, then retry." }
if (-not $npmCmd) { throw "npm not found on PATH. Install Node.js/npm or add it to PATH, then retry." }
$mvnExe = $mvnCmd.Source
$npmExe = $npmCmd.Source

if ($StopExisting) {
  Stop-ListeningProcessByPort -Port $BackendPort
  Stop-ListeningProcessByPort -Port $FrontendPort
}

$requestedBackendPort  = $BackendPort
$requestedFrontendPort = $FrontendPort

$BackendPort  = Get-NextAvailablePort -StartPort $BackendPort
$FrontendPort = Get-NextAvailablePort -StartPort $FrontendPort -ReservedPorts @($BackendPort)

if ($BackendPort  -ne $requestedBackendPort)  { Write-Host "Backend port $requestedBackendPort is occupied. Switched to $BackendPort" }
if ($FrontendPort -ne $requestedFrontendPort) { Write-Host "Frontend port $requestedFrontendPort is occupied. Switched to $FrontendPort" }

# Persist resolved ports so stop-dev.ps1 can target the right ones.
$stateFile = Join-Path $scriptRoot '.vibebox-dev-state.json'
@{
  backendPort  = $BackendPort
  frontendPort = $FrontendPort
  startedAt    = (Get-Date).ToString('o')
} | ConvertTo-Json | Set-Content -Path $stateFile -Encoding UTF8

Write-Host ""
Write-Host "=== VibeBox - Dev Start ===" -ForegroundColor Cyan
Write-Host "  Database  : embedded H2 file (backend/data/vibebox.mv.db)" -ForegroundColor DarkGray
Write-Host "  Backend   : http://localhost:$BackendPort" -ForegroundColor Green
Write-Host "  H2 console: http://localhost:$BackendPort/h2-console" -ForegroundColor DarkGray
Write-Host "  Frontend  : http://localhost:$FrontendPort" -ForegroundColor Green
Write-Host ""

# --- Start backend ---
$backendJob = Start-Job -Name 'vibebox-backend' -ScriptBlock {
  param([string]$Dir, [int]$Port, [string]$MvnExe)
  Set-Location $Dir
  $env:SERVER_PORT = $Port.ToString()
  $jvmArgs = "-Dserver.port=$Port -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8"
  & $MvnExe spring-boot:run "-Dspring-boot.run.jvmArguments=$jvmArgs" "-Dspring-boot.run.fork=true" 2>&1 | ForEach-Object { $_.ToString() }
} -ArgumentList $backendDir, $BackendPort, $mvnExe

# --- Wait for backend ---
Write-Host "Waiting for backend on port $BackendPort..." -ForegroundColor Yellow
$maxWait = 180
$waited  = 0
$ready   = $false

while ($waited -lt $maxWait) {
  Receive-Job -Job $backendJob -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "[backend] $_"
  }
  if (Test-PortListening -Port $BackendPort) { $ready = $true; break }
  Start-Sleep -Seconds 1
  $waited++
  if ($waited % 10 -eq 0) {
    Write-Host "  still waiting... ($waited s)" -ForegroundColor DarkGray
  }
}

if (-not $ready) {
  Write-Host "Backend did not start within $maxWait seconds. Starting frontend anyway." -ForegroundColor Yellow
} else {
  Write-Host "Backend ready after $waited s." -ForegroundColor Green
}

# --- Start frontend (Vite proxy targets the resolved backend port) ---
$frontendJob = Start-Job -Name 'vibebox-frontend' -ScriptBlock {
  param([string]$Dir, [int]$ApiPort, [int]$Port, [string]$NpmExe)
  Set-Location $Dir
  $env:VITE_API_PORT = $ApiPort.ToString()
  $env:VITE_PORT = $Port.ToString()
  # Install deps on first run so the local 'vite' binary exists.
  if (-not (Test-Path 'node_modules')) {
    Write-Host 'Installing frontend dependencies (npm install)...'
    & $NpmExe install
  }
  & $NpmExe run dev -- --port $Port 2>&1 | ForEach-Object { $_.ToString() }
} -ArgumentList $frontendDir, $BackendPort, $FrontendPort, $npmExe

Write-Host ""
Write-Host "Both services started. Press Ctrl+C to stop." -ForegroundColor Cyan
Write-Host "  To stop without Ctrl+C: .\stop-dev.ps1" -ForegroundColor DarkGray
Write-Host ""

try {
  while ($true) {
    $hadOutput = $false

    Receive-Job -Job $backendJob -ErrorAction SilentlyContinue | ForEach-Object {
      $hadOutput = $true
      Write-Host "[backend] $_"
    }

    Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue | ForEach-Object {
      $hadOutput = $true
      Write-Host "[frontend] $_"
    }

    $backendDone  = $backendJob.State  -in @('Completed', 'Failed', 'Stopped')
    $frontendDone = $frontendJob.State -in @('Completed', 'Failed', 'Stopped')

    if ($backendDone -and -not $frontendDone) {
      Write-Host ""
      Write-Host "[!] Backend process stopped unexpectedly. Check output above." -ForegroundColor Red
    }
    if ($frontendDone -and -not $backendDone) {
      Write-Host ""
      Write-Host "[!] Frontend process stopped unexpectedly." -ForegroundColor Red
    }

    if ($backendDone -and $frontendDone) { break }

    if (-not $hadOutput) { Start-Sleep -Milliseconds 250 }
  }
}
finally {
  Write-Host ""
  Write-Host "Process states: backend=$($backendJob.State), frontend=$($frontendJob.State)" -ForegroundColor DarkGray

  if ($backendJob.State -notin @('Completed', 'Failed', 'Stopped')) {
    Stop-Job -Job $backendJob -Force -ErrorAction SilentlyContinue
  }
  if ($frontendJob.State -notin @('Completed', 'Failed', 'Stopped')) {
    Stop-Job -Job $frontendJob -Force -ErrorAction SilentlyContinue
  }

  Remove-Job -Job $backendJob, $frontendJob -Force -ErrorAction SilentlyContinue

  if (Test-Path $stateFile) { Remove-Item $stateFile -Force -ErrorAction SilentlyContinue }

  Write-Host "Services stopped." -ForegroundColor Yellow
}
