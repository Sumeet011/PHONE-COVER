#!/usr/bin/env pwsh

# Phone Wraps Frontend - Final Production Check Script
# This script performs final checks before production deployment

Write-Host "`n🔍 PHONE WRAPS FRONTEND - PRODUCTION READINESS CHECK`n" -ForegroundColor Cyan

$checksPassted = 0
$checksFailed = 0

# Change to project directory
Set-Location "b:\Phone-Wraps-main\FRONTEND"

# 1. Check for console.log statements
Write-Host "1. Checking for console statements..." -ForegroundColor Yellow
$consoleStatements = Select-String -Path "src/**/*.tsx","src/**/*.jsx","src/**/*.ts","src/**/*.js" -Pattern "console\.(log|error|warn|debug)" -CaseSensitive
if ($consoleStatements) {
    Write-Host "   ❌ Found console statements in:" -ForegroundColor Red
    $consoleStatements | ForEach-Object { Write-Host "      - $($_.Filename):$($_.LineNumber)" -ForegroundColor Red }
    $checksFailed++
} else {
    Write-Host "   ✅ No console statements found" -ForegroundColor Green
    $checksPassted++
}

# 2. Check for .env file
Write-Host "`n2. Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ⚠️  .env file found - ensure it's in .gitignore" -ForegroundColor Yellow
} 
if (Test-Path ".env.local") {
    Write-Host "   ✅ .env.local exists" -ForegroundColor Green
    $checksPassted++
} else {
    Write-Host "   ⚠️  .env.local not found - create from .env.example" -ForegroundColor Yellow
}

# 3. Check next.config.ts
Write-Host "`n3. Checking next.config.ts..." -ForegroundColor Yellow
$nextConfig = Get-Content "next.config.ts" -Raw
if ($nextConfig -match "ignoreDuringBuilds:\s*true") {
    Write-Host "   ❌ ESLint errors are being ignored!" -ForegroundColor Red
    $checksFailed++
} elseif ($nextConfig -match "ignoreBuildErrors:\s*true") {
    Write-Host "   ❌ TypeScript errors are being ignored!" -ForegroundColor Red
    $checksFailed++
} else {
    Write-Host "   ✅ Build configuration is production-ready" -ForegroundColor Green
    $checksPassted++
}

# 4. Check for security headers
if ($nextConfig -match "X-Content-Type-Options") {
    Write-Host "   ✅ Security headers configured" -ForegroundColor Green
    $checksPassted++
} else {
    Write-Host "   ❌ Security headers not found" -ForegroundColor Red
    $checksFailed++
}

# 5. Check package.json for outdated packages
Write-Host "`n4. Checking for security vulnerabilities..." -ForegroundColor Yellow
Write-Host "   Running npm audit..." -ForegroundColor Gray
$auditResult = npm audit --json 2>$null | ConvertFrom-Json
if ($auditResult.metadata.vulnerabilities.total -gt 0) {
    $critical = $auditResult.metadata.vulnerabilities.critical
    $high = $auditResult.metadata.vulnerabilities.high
    $moderate = $auditResult.metadata.vulnerabilities.moderate
    $low = $auditResult.metadata.vulnerabilities.low
    
    Write-Host "   ⚠️  Found vulnerabilities:" -ForegroundColor Yellow
    if ($critical -gt 0) { Write-Host "      - Critical: $critical" -ForegroundColor Red }
    if ($high -gt 0) { Write-Host "      - High: $high" -ForegroundColor Red }
    if ($moderate -gt 0) { Write-Host "      - Moderate: $moderate" -ForegroundColor Yellow }
    if ($low -gt 0) { Write-Host "      - Low: $low" -ForegroundColor Yellow }
    Write-Host "      Run 'npm audit fix' to resolve" -ForegroundColor Cyan
} else {
    Write-Host "   ✅ No vulnerabilities found" -ForegroundColor Green
    $checksPassted++
}

# 6. Check if build works
Write-Host "`n5. Testing production build..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Production build successful" -ForegroundColor Green
    $checksPassted++
} else {
    Write-Host "   ❌ Production build failed" -ForegroundColor Red
    Write-Host "   Check build errors above" -ForegroundColor Red
    $checksFailed++
}

# 7. Check for required environment variables
Write-Host "`n6. Checking required environment variables..." -ForegroundColor Yellow
$requiredVars = @("NEXT_PUBLIC_BACKEND_URL", "NEXT_PUBLIC_RAZORPAY_KEY_ID")
$envContent = if (Test-Path ".env.local") { Get-Content ".env.local" -Raw } else { "" }

foreach ($var in $requiredVars) {
    if ($envContent -match $var) {
        Write-Host "   ✅ $var is defined" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $var is missing" -ForegroundColor Red
        $checksFailed++
    }
}

# 8. Check for .gitignore
Write-Host "`n7. Checking .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignore = Get-Content ".gitignore" -Raw
    if ($gitignore -match "\.env") {
        Write-Host "   ✅ .env files are ignored" -ForegroundColor Green
        $checksPassted++
    } else {
        Write-Host "   ❌ .env files should be in .gitignore" -ForegroundColor Red
        $checksFailed++
    }
} else {
    Write-Host "   ❌ .gitignore not found" -ForegroundColor Red
    $checksFailed++
}

# Summary
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan
Write-Host "Checks Passed: $checksPassted" -ForegroundColor Green
Write-Host "Checks Failed: $checksFailed" -ForegroundColor $(if ($checksFailed -gt 0) { "Red" } else { "Green" })

if ($checksFailed -eq 0) {
    Write-Host "`n✅ YOUR APPLICATION IS PRODUCTION READY! 🚀" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Deploy to your hosting platform" -ForegroundColor White
    Write-Host "  2. Set up monitoring (Sentry/DataDog)" -ForegroundColor White
    Write-Host "  3. Run final manual tests" -ForegroundColor White
    Write-Host "  4. Monitor performance with Lighthouse" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Please fix the issues above before deploying" -ForegroundColor Yellow
}

Write-Host "`n"
