# One-shot finishing script for Windows PowerShell, run from the project folder AFTER pasting
# YOUCAM_API_KEY into .env.local:
#   powershell -ExecutionPolicy Bypass -File scripts\finalize.ps1
# 1) records the real sample (12 units, once)  2) starts the dev server
# 3) runs the Playwright e2e check  4) regenerates screenshots + demo video  5) stops the server
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
npm run record-sample
if ($LASTEXITCODE -ne 0) { throw "record-sample failed" }
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
$dev = Start-Process -FilePath "cmd.exe" -ArgumentList "/c","npx next dev -p 3000" -PassThru -WindowStyle Hidden
try {
  $ok = $false
  for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 2
    try { if ((Invoke-WebRequest -UseBasicParsing http://localhost:3000).StatusCode -eq 200) { $ok = $true; break } } catch {}
  }
  if (-not $ok) { throw "dev server did not start" }
  npm run e2e
  if ($LASTEXITCODE -ne 0) { throw "e2e failed" }
  npm run capture
} finally {
  taskkill /PID $dev.Id /T /F | Out-Null
}
Write-Host "Done. Review data/sample-result.json and submission/, then commit."
