# ============================================
# Hostinger Deployment Preparation Script
# معرض وحدة اليمن للسيارات
# ============================================

Write-Host "🚀 Starting Hostinger Deployment Preparation..." -ForegroundColor Cyan

# Configuration
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDir = "$projectRoot\hostinger_deploy"
$frontendDir = "$projectRoot\frontend"
$apiDir = "$projectRoot\api"

# Clean previous build
if (Test-Path $outputDir) {
    Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $outputDir
}

# Create output directory structure
Write-Host "📁 Creating directory structure..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "$outputDir\public_html\api" | Out-Null
New-Item -ItemType Directory -Force -Path "$outputDir\public_html\api\uploads\images" | Out-Null
New-Item -ItemType Directory -Force -Path "$outputDir\public_html\api\uploads\videos" | Out-Null
New-Item -ItemType Directory -Force -Path "$outputDir\public_html\api\uploads\banners" | Out-Null

# Build Frontend
Write-Host "🔨 Building Frontend (Next.js)..." -ForegroundColor Green
Set-Location $frontendDir

# Update .env for production
$envContent = @"
NEXT_PUBLIC_API_URL=https://fazaacaetg.com/api
"@
$envContent | Out-File -FilePath ".env.production" -Encoding UTF8

npm run build

# Copy Frontend files
Write-Host "📦 Copying Frontend files..." -ForegroundColor Green
Copy-Item -Recurse "$frontendDir\out\*" "$outputDir\public_html\"

# Copy API files
Write-Host "📦 Copying API files..." -ForegroundColor Green
$apiFiles = @(
    "index.php",
    "router.php",
    ".htaccess",
    "composer.json",
    "composer.lock"
)

foreach ($file in $apiFiles) {
    if (Test-Path "$apiDir\$file") {
        Copy-Item "$apiDir\$file" "$outputDir\public_html\api\"
    }
}

# Copy API directories
$apiDirs = @("config", "controllers", "middleware", "database", "utils", "vendor")
foreach ($dir in $apiDirs) {
    if (Test-Path "$apiDir\$dir") {
        Copy-Item -Recurse "$apiDir\$dir" "$outputDir\public_html\api\"
    }
}

Write-Host "✅ Deployment package ready at: $outputDir" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update api/config/database.php with Hostinger credentials"
Write-Host "2. Upload contents of hostinger_deploy/public_html to Hostinger"
Write-Host "3. Import database using phpMyAdmin"
Write-Host "4. Test the website"

Set-Location $projectRoot
