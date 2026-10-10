param(
  [string]$BundleDir = "src-tauri/target/release/bundle/nsis"
)
$ErrorActionPreference = "Stop"
$setup = Get-ChildItem -Path $BundleDir -Filter "*.exe" -File |
  Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $setup) { throw "No NSIS installer was built" }

Write-Host "MRLN installed smoke: $($setup.Name)"
$started = Start-Process -FilePath $setup.FullName -ArgumentList "/S" -PassThru -Wait
if ($started.ExitCode -ne 0) { throw "NSIS install returned $($started.ExitCode)" }

$candidates = @(
  (Join-Path $env:LOCALAPPDATA "Programs\MRLN Agent Station\mrln-agent-station.exe"),
  (Join-Path $env:ProgramFiles "MRLN Agent Station\mrln-agent-station.exe")
)
$binary = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $binary) {
  # Tauri may include a publisher name or platform architecture in the install directory.
  $roots = @((Join-Path $env:LOCALAPPDATA "Programs"), $env:ProgramFiles)
  $found = @()
  foreach ($root in $roots) {
    if (-not (Test-Path $root)) { continue }
    $found += @(Get-ChildItem -Path $root -Filter "mrln-agent-station.exe" -Recurse -File -ErrorAction SilentlyContinue |
      Select-Object -First 1 -ExpandProperty FullName)
  }
  $binary = $found | Select-Object -First 1
}
if (-not $binary) { throw "Installed MRLN executable not found" }
Write-Host "Launching MRLN: $binary"
$process = Start-Process -FilePath $binary -WorkingDirectory (Split-Path $binary -Parent) -PassThru
try {
  Start-Sleep -Seconds 20
  $process.Refresh()
  if ($process.HasExited) { throw "MRLN exited during installed launch (code: $($process.ExitCode))" }
  $receipt = @{
    build = "mrln-windows-installed-smoke"
    installer = $setup.Name
    executable = Split-Path $binary -Leaf
    processId = $process.Id
    runningAfter20Seconds = $true
    separateApplicationId = "com.mrln.agentstation"
    notes = "Launch/installer smoke only; model calls and human UI interactions were not tested"
  }
  $receipt | ConvertTo-Json -Depth 5 | Set-Content -Path "mrln-installed-smoke.json" -Encoding utf8
  Write-Host "MRLN installed executable remained running for 20 seconds"
}
finally {
  $process.Refresh()
  if (-not $process.HasExited) { Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue }
}
