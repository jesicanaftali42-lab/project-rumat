Database dump / migration helper

This document explains how to export the local PostgreSQL database used by the backend and restore it on another PostgreSQL server.

Files included:
- `../scripts/dump-db.ps1` - PowerShell script to create a dump using local `pg_dump`.
- `../scripts/dump-db.sh` - Bash script for Linux/macOS.

Prerequisites
- Either `pg_dump` (Postgres client) installed, or Docker installed (to run a Postgres container for dumping).
- Access to the local database (see `backend/.env` for connection values).

Quick export using PowerShell
1. Open PowerShell in project root.
2. Run:

```powershell
# optional: specify env path and output path
.
\scripts\dump-db.ps1 -EnvPath .\backend\.env -OutFile .\rumat_db.dump
```

Quick export using Bash (Linux / WSL / macOS)
```bash
bash scripts/dump-db.sh backend/.env rumat_db.dump
```

Docker alternative (if you don't have pg_dump locally)
```powershell
# PowerShell example
$DB_HOST = "127.0.0.1"
$DB_PORT = "5433"
$DB_USER = "postgres"
$DB_NAME = "rumat_db"
$OUT = "rumat_db.dump"

docker run --rm -v ${PWD}:/backup --network host postgres:15 \
  pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -F c -b -v -f /backup/$OUT $DB_NAME
```

Restore to target server (using pg_restore)
1. Copy `rumat_db.dump` to the target server or make it accessible.
2. Run:
```bash
PGPASSWORD=yourpassword pg_restore -h <HOST> -p <PORT> -U <USER> -d <DBNAME> -v rumat_db.dump
```

Notes
- The scripts expect a simple `.env` with `DB_` prefixed variables (as already present in `backend/.env`).
- Do NOT commit dumps or `.env` with real passwords into source control. Keep them out of Git.
- For production, prefer configuring a managed DB and use migrations instead of `synchronize: true`.
