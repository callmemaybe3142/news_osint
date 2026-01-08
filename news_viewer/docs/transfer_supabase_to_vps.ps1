# ============================================================================
# Transfer Person Data from Supabase to VPS PostgreSQL
# ============================================================================
# This script automates the transfer of person-related data from Supabase
# to your VPS PostgreSQL database
# ============================================================================

# ============================================================================
# CONFIGURATION - EDIT THESE VALUES
# ============================================================================

# Supabase Configuration
$SUPABASE_HOST = "db.xxxxxxxxxxxxx.supabase.co"  # Your Supabase host
$SUPABASE_PORT = "5432"                          # 5432 or 6543 for pooling
$SUPABASE_DB = "postgres"                        # Usually 'postgres'
$SUPABASE_USER = "postgres"                      # Usually 'postgres'
$SUPABASE_PASSWORD = "your-supabase-password"    # Your Supabase password

# VPS Configuration
$VPS_HOST = "your.vps.ip.address"                # Your VPS IP or domain
$VPS_SSH_USER = "your_ssh_user"                  # SSH username
$VPS_DB_USER = "your_db_user"                    # PostgreSQL username on VPS
$VPS_DB_NAME = "telegram_news"                   # Target database name
$VPS_DB_PASSWORD = "your_vps_db_password"        # VPS database password

# File paths
$LOCAL_DUMP_FILE = "person_data.dump"
$VPS_TEMP_DIR = "/tmp"
$VPS_DUMP_FILE = "$VPS_TEMP_DIR/person_data.dump"
$VPS_SCHEMA_FILE = "$VPS_TEMP_DIR/schema_person.sql"

# Tables to transfer
$TABLES = @(
    "person",
    "addresses",
    "countries",
    "country_join",
    "departments",
    "educations",
    "education_join",
    "ministries",
    "md_join",
    "positions",
    "position_join",
    "punishments",
    "punishment_join",
    "trainings"
)

# ============================================================================
# Functions
# ============================================================================

function Write-Step {
    param([string]$Message, [int]$Step)
    Write-Host "`n" -NoNewline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " Step $Step : $Message" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Yellow
}

# ============================================================================
# Main Script
# ============================================================================

Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     Transfer Person Data: Supabase → VPS PostgreSQL          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Info "Source: Supabase ($SUPABASE_HOST)"
Write-Info "Target: VPS ($VPS_HOST)"
Write-Info "Database: $VPS_DB_NAME"
Write-Host ""

# Verify prerequisites
Write-Step "Verifying Prerequisites" 1

$hasErrors = $false

# Check if pg_dump exists
try {
    $null = Get-Command pg_dump -ErrorAction Stop
    Write-Success "pg_dump found"
} catch {
    Write-Error "pg_dump not found. Please install PostgreSQL client tools."
    $hasErrors = $true
}

# Check if scp exists
try {
    $null = Get-Command scp -ErrorAction Stop
    Write-Success "scp found"
} catch {
    Write-Error "scp not found. Please install OpenSSH or use WinSCP."
    $hasErrors = $true
}

# Check if schema file exists
if (Test-Path "schema_person.sql") {
    Write-Success "schema_person.sql found"
} else {
    Write-Error "schema_person.sql not found in current directory"
    $hasErrors = $true
}

if ($hasErrors) {
    Write-Host "`n"
    Write-Error "Please fix the errors above before continuing."
    exit 1
}

# Step 2: Export data from Supabase
Write-Step "Exporting Data from Supabase" 2

Write-Info "Connecting to Supabase..."
Write-Info "This may take several minutes for large datasets..."

# Set password environment variable
$env:PGPASSWORD = $SUPABASE_PASSWORD

# Build table arguments
$tableArgs = $TABLES | ForEach-Object { "--table=$_" }
$tableArgsString = $tableArgs -join " "

$exportCmd = "pg_dump -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB --data-only --format=custom --file=$LOCAL_DUMP_FILE $tableArgsString"

Write-Host "Executing: pg_dump from Supabase..." -ForegroundColor Gray

try {
    Invoke-Expression $exportCmd
    if (Test-Path $LOCAL_DUMP_FILE) {
        $fileSize = (Get-Item $LOCAL_DUMP_FILE).Length / 1MB
        Write-Success "Data exported successfully"
        Write-Info "Dump file size: $([math]::Round($fileSize, 2)) MB"
    } else {
        Write-Error "Dump file was not created"
        exit 1
    }
} catch {
    Write-Error "Failed to export data from Supabase: $_"
    exit 1
}

# Step 3: Upload files to VPS
Write-Step "Uploading Files to VPS" 3

Write-Info "Uploading schema file..."
try {
    scp schema_person.sql "${VPS_SSH_USER}@${VPS_HOST}:${VPS_SCHEMA_FILE}"
    Write-Success "Schema file uploaded"
} catch {
    Write-Error "Failed to upload schema file: $_"
    exit 1
}

Write-Info "Uploading dump file (this may take a while)..."
try {
    scp $LOCAL_DUMP_FILE "${VPS_SSH_USER}@${VPS_HOST}:${VPS_DUMP_FILE}"
    Write-Success "Dump file uploaded"
} catch {
    Write-Error "Failed to upload dump file: $_"
    exit 1
}

# Step 4: Create schema on VPS
Write-Step "Creating Schema on VPS" 4

$createSchemaCmd = "export PGPASSWORD='$VPS_DB_PASSWORD' && psql -U $VPS_DB_USER -d $VPS_DB_NAME -f $VPS_SCHEMA_FILE"

Write-Info "Creating person tables in $VPS_DB_NAME..."

try {
    ssh "${VPS_SSH_USER}@${VPS_HOST}" $createSchemaCmd
    Write-Success "Schema created successfully"
} catch {
    Write-Error "Failed to create schema: $_"
    Write-Info "Tables might already exist. Continuing..."
}

# Step 5: Import data to VPS
Write-Step "Importing Data to VPS" 5

$importCmd = "export PGPASSWORD='$VPS_DB_PASSWORD' && pg_restore -U $VPS_DB_USER -d $VPS_DB_NAME --data-only --disable-triggers --no-owner --verbose $VPS_DUMP_FILE"

Write-Info "Importing data to $VPS_DB_NAME..."
Write-Info "This may take several minutes..."

try {
    ssh "${VPS_SSH_USER}@${VPS_HOST}" $importCmd
    Write-Success "Data imported successfully"
} catch {
    Write-Error "Import completed with some errors (this may be normal)"
    Write-Info "Check the output above for details"
}

# Step 6: Reset sequences
Write-Step "Resetting Auto-Increment Sequences" 6

$resetSeqCmd = @"
export PGPASSWORD='$VPS_DB_PASSWORD' && psql -U $VPS_DB_USER -d $VPS_DB_NAME -c "
SELECT setval('addresses_id_seq', COALESCE((SELECT MAX(id) FROM addresses), 1));
SELECT setval('countries_country_id_seq', COALESCE((SELECT MAX(country_id) FROM countries), 1));
SELECT setval('departments_department_id_seq', COALESCE((SELECT MAX(department_id) FROM departments), 1));
SELECT setval('educations_education_id_seq', COALESCE((SELECT MAX(education_id) FROM educations), 1));
SELECT setval('ministries_ministry_id_seq', COALESCE((SELECT MAX(ministry_id) FROM ministries), 1));
SELECT setval('positions_position_id_seq', COALESCE((SELECT MAX(position_id) FROM positions), 1));
SELECT setval('punishments_punishment_id_seq', COALESCE((SELECT MAX(punishment_id) FROM punishments), 1));
SELECT setval('trainings_id_seq', COALESCE((SELECT MAX(id) FROM trainings), 1));
"
"@

Write-Info "Resetting sequences..."

try {
    ssh "${VPS_SSH_USER}@${VPS_HOST}" $resetSeqCmd
    Write-Success "Sequences reset successfully"
} catch {
    Write-Error "Failed to reset sequences: $_"
}

# Step 7: Verify data transfer
Write-Step "Verifying Data Transfer" 7

$verifyCmd = @"
export PGPASSWORD='$VPS_DB_PASSWORD' && psql -U $VPS_DB_USER -d $VPS_DB_NAME -c "
SELECT 'person' as table_name, COUNT(*) as records FROM person
UNION ALL SELECT 'addresses', COUNT(*) FROM addresses
UNION ALL SELECT 'countries', COUNT(*) FROM countries
UNION ALL SELECT 'country_join', COUNT(*) FROM country_join
UNION ALL SELECT 'departments', COUNT(*) FROM departments
UNION ALL SELECT 'educations', COUNT(*) FROM educations
UNION ALL SELECT 'education_join', COUNT(*) FROM education_join
UNION ALL SELECT 'ministries', COUNT(*) FROM ministries
UNION ALL SELECT 'md_join', COUNT(*) FROM md_join
UNION ALL SELECT 'positions', COUNT(*) FROM positions
UNION ALL SELECT 'position_join', COUNT(*) FROM position_join
UNION ALL SELECT 'punishments', COUNT(*) FROM punishments
UNION ALL SELECT 'punishment_join', COUNT(*) FROM punishment_join
UNION ALL SELECT 'trainings', COUNT(*) FROM trainings;
"
"@

Write-Info "Checking record counts..."

try {
    ssh "${VPS_SSH_USER}@${VPS_HOST}" $verifyCmd
    Write-Success "Verification complete"
} catch {
    Write-Error "Failed to verify data: $_"
}

# Step 8: Cleanup
Write-Step "Cleanup" 8

Write-Host "Do you want to delete temporary files? (Y/N): " -NoNewline -ForegroundColor Yellow
$cleanup = Read-Host

if ($cleanup -eq "Y" -or $cleanup -eq "y") {
    # Delete local dump file
    if (Test-Path $LOCAL_DUMP_FILE) {
        Remove-Item $LOCAL_DUMP_FILE -Force
        Write-Success "Local dump file deleted"
    }
    
    # Delete files on VPS
    $cleanupCmd = "rm -f $VPS_DUMP_FILE $VPS_SCHEMA_FILE"
    try {
        ssh "${VPS_SSH_USER}@${VPS_HOST}" $cleanupCmd
        Write-Success "VPS temporary files deleted"
    } catch {
        Write-Error "Failed to delete VPS files: $_"
    }
} else {
    Write-Info "Temporary files kept"
    Write-Info "Local: $LOCAL_DUMP_FILE"
    Write-Info "VPS: $VPS_DUMP_FILE, $VPS_SCHEMA_FILE"
}

# Summary
Write-Host "`n`n"
Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                  ✅ TRANSFER COMPLETE ✅                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Info "Data has been transferred from Supabase to your VPS"
Write-Info "Database: $VPS_DB_NAME on $VPS_HOST"
Write-Host ""
Write-Info "Next steps:"
Write-Host "  1. Verify the data in your application" -ForegroundColor White
Write-Host "  2. Update your backend .env file to use VPS database" -ForegroundColor White
Write-Host "  3. Test the application with the new database" -ForegroundColor White
Write-Host ""
