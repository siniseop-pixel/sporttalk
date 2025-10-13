param(
  [string]$Source = "src",                  # Source folder
  [string]$OutDir = "_export_txt",          # Output folder
  [string[]]$Include = @("*.js","*.jsx","*.ts","*.tsx","*.css","*.json","*.md"),
  [string[]]$ExcludeDirs = @("node_modules",".next","out","dist",".git")
)

if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# Build exclude regex
$excludeRegex = ($ExcludeDirs | ForEach-Object { [regex]::Escape($_) }) -join "|"

Get-ChildItem -Path $Source -Recurse -File -Include $Include | Where-Object {
  $_.FullName -notmatch "\\($excludeRegex)\\"
} | ForEach-Object {
  $rel = $_.FullName.Substring((Resolve-Path $Source).Path.Length).TrimStart("\","/")
  $relDir = Split-Path $rel -Parent
  $outDirPath = Join-Path $OutDir $relDir
  New-Item -ItemType Directory -Force -Path $outDirPath | Out-Null

  $outFile = Join-Path $outDirPath ("{0}.txt" -f ($_.BaseName))
  Copy-Item -Path $_.FullName -Destination $outFile -Force
  Write-Host "→ $outFile"
}

Write-Host ""
Write-Host "Done. Folder:" (Resolve-Path $OutDir).Path
Write-Host "Now zip this folder and upload it here."
