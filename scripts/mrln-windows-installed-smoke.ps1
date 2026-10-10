param(
  [string]$BundleDir = "src-tauri/target/release/bundle/nsis"
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$setup = Get-ChildItem -LiteralPath $BundleDir -Filter '*setup.exe' -File |
  Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
if (-not $setup) { throw "No MRLN NSIS installer exists in $BundleDir" }
if ($setup.Name -notmatch 'MRLN Agent Station') {
  throw "Unexpected installer name: $($setup.Name)"
}

# A dedicated path on this disposable CI machine avoids unintended upgrades,
# and lets the test prove an actual INSTALL, not accidentally launch target/release.
$installRoot = Join-Path $env:RUNNER_TEMP 'MRLN-Installed-CI'
if (Test-Path -LiteralPath $installRoot) {
  Remove-Item -LiteralPath $installRoot -Recurse -Force
}
$installArgs = @('/S',"/D=$installRoot") # NSIS /D=<path> MUST be the final argument.
Write-Host "Installing $($setup.Name) into $installRoot"
$run = Start-Process -FilePath $setup.FullName -ArgumentList $installArgs -PassThru -Wait
if ($run.ExitCode -ne 0) {
  throw "MRLN installer failed with exit code $($run.ExitCode)"
}

# Registry is the source of truth for machines that ignore or redirect /D.
# Prefer explicit installRoot, then MRLN-only uninstall records, never locate
# some unrelated executable elsewhere on the runner.
$roots = [System.Collections.Generic.List[string]]::new()
$roots.Add($installRoot)
foreach ($key in @(
  'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
  'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
  'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'
)) {
  foreach ($entry in @(Get-ItemProperty -Path $key -ErrorAction SilentlyContinue)) {
    $displayName = $entry.PSObject.Properties['DisplayName']
    if (-not $displayName -or $displayName.Value -notlike '*MRLN Agent Station*') { continue }
    $location = $entry.PSObject.Properties['InstallLocation']
    if ($location -and $location.Value) {
      $roots.Add(([string]$location.Value).Trim('"'))
      Write-Host "MRLN registry InstallLocation: $($location.Value)"
    }
  }
}
$roots.Add((Join-Path $env:LOCALAPPDATA 'Programs\MRLN Agent Station'))
$roots.Add((Join-Path $env:LOCALAPPDATA 'MRLN Agent Station'))
$roots.Add((Join-Path $env:ProgramFiles 'MRLN Agent Station'))

$found = $null
$inspected = [System.Collections.Generic.List[string]]::new()
foreach ($root in ($roots | Select-Object -Unique)) {
  if (-not $root) { continue }
  $inspected.Add($root)
  if (-not (Test-Path -LiteralPath $root -PathType Container)) { continue }
  $candidate = Join-Path $root 'mrln-agent-station.exe'
  if (Test-Path -LiteralPath $candidate -PathType Leaf) { $found = $candidate; break }
  # Unusual packaging can put the binary one folder down.
  $nested = Get-ChildItem -LiteralPath $root -Filter 'mrln-agent-station.exe' -File -Recurse -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if ($nested) { $found = $nested.FullName; break }
}

$receipt = @{
  kind = 'mrln-installed-windows-smoke'
  installer = $setup.Name
  installedExecutable = if ($found) { $found } else { $null }
  checkedRoots = @($inspected.ToArray())
  result = if ($found) { 'installed-exe-found' } else { 'installed-exe-missing' }
  notes = 'Unsigned internal test; does not verify AI models, interactions or graphical appearance'
}
$receipt | ConvertTo-Json -Depth 5 | Set-Content -Path 'mrln-installed-smoke.json' -Encoding utf8
if (-not $found) {
  throw ("MRLN NSIS exited 0 but executable is missing. Checked: " + ($inspected -join '; '))
}
Write-Host "Launching installed MRLN executable: $found"
$appProcess = Start-Process -FilePath $found -WorkingDirectory (Split-Path $found -Parent) -PassThru
try {
  Start-Sleep -Seconds 15
  $appProcess.Refresh()
  if ($appProcess.HasExited) {
    $receipt.result = 'exited-early'
    $receipt.exitCode = $appProcess.ExitCode
    throw "Installed MRLN executable exited during 15s smoke check: $($appProcess.ExitCode)"
  }
  $receipt.result = 'passed'
  $receipt.runningAfter15Seconds = $true
  Write-Host "PASS: Installed MRLN application stays running for 15s"
}
finally {
  $receipt | ConvertTo-Json -Depth 5 | Set-Content -Path 'mrln-installed-smoke.json' -Encoding utf8
  $appProcess.Refresh()
  if (-not $appProcess.HasExited) { Stop-Process -Id $appProcess.Id -Force -ErrorAction SilentlyContinue }
}
