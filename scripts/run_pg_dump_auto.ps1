# Auto-run pg_dump using backend\.env
Set-Location -Path (Join-Path $PSScriptRoot '..')
$paths = @('C:\Program Files\PostgreSQL','D:\postgres','D:\web development','D:\')
$found = @()
foreach ($p in $paths) {
    if (Test-Path $p) {
        $found += Get-ChildItem -Path $p -Filter pg_dump.exe -Recurse -ErrorAction SilentlyContinue | Select-Object FullName,DirectoryName,LastWriteTime
    }
}
if (-not $found) {
    Write-Host 'NO_PGDUMP_FOUND'
    exit 2
}
$pref = $found | Where-Object { $_.FullName -match '\\16\\' }
if ($pref) { $pg = $pref | Sort-Object LastWriteTime -Descending | Select-Object -First 1 } else { $pg = $found | Sort-Object LastWriteTime -Descending | Select-Object -First 1 }
$pgPath = $pg.FullName
Write-Host "PGDUMP_FOUND:$pgPath"
$envFile = Join-Path (Get-Location) 'backend\.env'
if (-not (Test-Path $envFile)) { Write-Host 'NO_ENV'; exit 3 }
$content = Get-Content $envFile
function GetVal($key, $default) {
    $line = $content | Where-Object { $_ -match "^$key=" }
    if ($line) { return ($line -replace "^$key=","") } else { return $default }
}
$dbHost = GetVal 'DB_HOST' '127.0.0.1'
$dbPort = GetVal 'DB_PORT' '5432'
$dbUser = GetVal 'DB_USERNAME' 'postgres'
$dbPass = GetVal 'DB_PASSWORD' ''
$dbName = GetVal 'DB_DATABASE' 'rumat_db'
Write-Host "Using DB: $dbName@$($dbHost):$($dbPort) as $dbUser"
$env:PGPASSWORD = $dbPass
$out = Join-Path (Get-Location) 'rumat_db.dump'
Write-Host "Dump path: $out"
& "$pgPath" -h $dbHost -p $dbPort -U $dbUser -F c -b -v -f "$out" $dbName
$ec = $LASTEXITCODE
Write-Host "EXIT:$ec"
if ($ec -eq 0) { Write-Host 'DUMP_OK' } else { Write-Host 'DUMP_FAILED'; exit $ec }
