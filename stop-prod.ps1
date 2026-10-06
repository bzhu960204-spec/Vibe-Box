param(
  [int[]]$Ports = @(),
  [int]$Port = 0
)

# Stops the single-port prod app started by start-prod.ps1.

$ErrorActionPreference = 'Continue'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$stateFile  = Join-Path $scriptRoot '.vibebox-prod-state.json'

# Load the resolved port from the start-prod state file if present.
if (Test-Path $stateFile) {
  try {
    $state = Get-Content $stateFile -Raw | ConvertFrom-Json
    if ($Port -le 0 -and $state.port) { $Port = [int]$state.port }
  } catch {
    Write-Host "Failed to read $stateFile : $($_.Exception.Message)"
  }
}

if ($Ports.Count -eq 0) {
  if ($Port -gt 0) { $Ports = @($Port) } else { $Ports = @(8091) }
}

foreach ($p in $Ports) {
  $connections = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  if (-not $connections) {
    Write-Host "No listening process on port $p"
    continue
  }
  $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($processId in $processIds) {
    try {
      Stop-Process -Id $processId -Force -ErrorAction Stop
      Write-Host "Stopped process $processId on port $p"
    } catch {
      Write-Host "Failed to stop process $processId on port ${p}: $($_.Exception.Message)"
    }
  }
}

Get-Job -Name 'vibebox-prod-open' -ErrorAction SilentlyContinue | ForEach-Object {
  Stop-Job  $_ -Force -ErrorAction SilentlyContinue
  Remove-Job $_ -Force -ErrorAction SilentlyContinue
}

if (Test-Path $stateFile) {
  Remove-Item $stateFile -Force -ErrorAction SilentlyContinue
}

Write-Host "Prod service stopped." -ForegroundColor Yellow
