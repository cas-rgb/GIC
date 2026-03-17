
$sourceDir = "C:\Users\Dell\Downloads\drive-download-20260312T032905Z-1-001"
$destDir = "c:\Users\Dell\Desktop\Sparc Innovation\gic-app\public\projects"

if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir
}

Write-Host "Migrating GIC Project Assets..." -ForegroundColor Cyan

Get-ChildItem -Path $sourceDir -Include *.webp, *.jpg, *.png -Recurse | ForEach-Object {
    $destFile = Join-Path $destDir $_.Name
    Copy-Item -Path $_.FullName -Destination $destFile -Force
    Write-Host "  [OK] Migrated: $($_.Name)" -ForegroundColor Green
}

Write-Host "Migration Complete." -ForegroundColor Cyan
