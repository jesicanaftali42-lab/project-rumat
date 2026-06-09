param(
  [string]$EnvPath = ".\backend\.env",
  [string]$OutFile = ".\rumat_db.dump"
)

if (-not (Test-Path $EnvPath)) {
  Write-Error "Env file not found: $EnvPath"
  exit 1
}

# Parse simple KEY=VALUE lines from .env
$envLines = Get-Content $EnvPath | Where-Object { $_ -match '=' }
$env = @{}
foreach ($line in $envLines) {
  if ($line -match '^\s*#') { continue }
  $parts = $line -split '=',2
  if ($parts.Count -lt 2) { continue }
  $k = $parts[0].Trim()
  $v = $parts[1].Trim()
  $env[$k] = $v
}

$DB_HOST = $env['DB_HOST'] ? $env['DB_HOST'] : '127.0.0.1'
$DB_PORT = $env['DB_PORT'] ? $env['DB_PORT'] : '5432'
$DB_USER = $env['DB_USERNAME'] ? $env['DB_USERNAME'] : 'postgres'
$DB_PASS = $env['DB_PASSWORD'] ? $env['DB_PASSWORD'] : ''
$DB_NAME = $env['DB_DATABASE'] ? $env['DB_DATABASE'] : 'rumat_db'

# Check for pg_dump
if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
  Write-Host "pg_dump not found in PATH. Please install PostgreSQL client (pg_dump) or use Docker-based command." -ForegroundColor Yellow
  exit 1
}

# Use PGPASSWORD to supply password non-interactively
$env:PGPASSWORD = $DB_PASS

Write-Host "Exporting database '$DB_NAME' from $DB_HOST:$DB_PORT as user $DB_USER to $OutFile"

& pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -F c -b -v -f $OutFile $DB_NAME

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Dump berhasil: $OutFile" -ForegroundColor Green
} else {
  Write-Error "pg_dump gagal dengan exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}
