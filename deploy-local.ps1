# Windows PowerShell Script to deploy JoblyAI to GCP locally
# Hướng dẫn chạy: .\deploy-local.ps1

$GCP_PROJECT_ID = "steady-atlas-499014-n2" # Thay bằng ID dự án GCP thực tế của bạn
$NEXT_PUBLIC_API_URL = "https://jobly.ai.vn" # Thay bằng URL chính thực tế của bạn (code tự động nối thêm /api)
$DATABASE_URL = "postgresql://postgres:PASSWORD@IP_DATABASE:5432/jobly_db" # Thay bằng DB Connection String của bạn

Write-Host "==============================================" -ForegroundColor Green
Write-Host "       JOBLYAI LOCAL GCP DEPLOYMENT TOOL      " -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host "1. Deploy Backend API"
Write-Host "2. Deploy Frontend Web"
Write-Host "3. Deploy Cả Hai (Web + API)"
Write-Host "4. Chạy Database Migration (Prisma)"
Write-Host "5. Thoát"
$choice = Read-Host "Chọn tùy chọn (1-5)"

if ($choice -eq "5" -or [string]::IsNullOrEmpty($choice)) {
    Write-Host "Đã thoát." -ForegroundColor Yellow
    exit
}

# Cài đặt Project ID hiện tại
Write-Host "`n[1/2] Đang thiết lập GCP Project ID..." -ForegroundColor Cyan
gcloud config set project $GCP_PROJECT_ID

# Xác thực Docker
Write-Host "[2/2] Đang xác thực Docker với GCP..." -ForegroundColor Cyan
gcloud auth configure-docker asia-southeast1-docker.pkg.dev

if ($choice -eq "1" -or $choice -eq "3") {
    Write-Host "`n==============================================" -ForegroundColor Yellow
    Write-Host "        ĐANG BUILD & DEPLOY BACKEND API       " -ForegroundColor Yellow
    Write-Host "==============================================" -ForegroundColor Yellow
    
    Write-Host "1. Building Docker image..." -ForegroundColor Cyan
    docker build -t asia-southeast1-docker.pkg.dev/$GCP_PROJECT_ID/joblyai-ar/jobly-backend:latest -f apps/backend/Dockerfile .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Lỗi khi build image Backend Docker!"
        exit $LASTEXITCODE
    }

    Write-Host "2. Pushing Docker image to Artifact Registry..." -ForegroundColor Cyan
    docker push asia-southeast1-docker.pkg.dev/$GCP_PROJECT_ID/joblyai-ar/jobly-backend:latest

    Write-Host "3. Cập nhật dịch vụ Cloud Run API..." -ForegroundColor Cyan
    gcloud run services update joblyai-run-svc-api --image=asia-southeast1-docker.pkg.dev/$GCP_PROJECT_ID/joblyai-ar/jobly-backend:latest --region=asia-southeast1
}

if ($choice -eq "2" -or $choice -eq "3") {
    Write-Host "`n==============================================" -ForegroundColor Yellow
    Write-Host "       ĐANG BUILD & DEPLOY FRONTEND WEB       " -ForegroundColor Yellow
    Write-Host "==============================================" -ForegroundColor Yellow

    Write-Host "1. Building Docker image với NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL..." -ForegroundColor Cyan
    docker build --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL -t asia-southeast1-docker.pkg.dev/$GCP_PROJECT_ID/joblyai-ar/jobly-web:latest -f apps/web/Dockerfile .

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Lỗi khi build image Frontend Docker!"
        exit $LASTEXITCODE
    }

    Write-Host "2. Pushing Docker image to Artifact Registry..." -ForegroundColor Cyan
    docker push asia-southeast1-docker.pkg.dev/$GCP_PROJECT_ID/joblyai-ar/jobly-web:latest

    Write-Host "3. Cập nhật dịch vụ Cloud Run Frontend..." -ForegroundColor Cyan
    gcloud run services update joblyai-run-svc-web --image=asia-southeast1-docker.pkg.dev/$GCP_PROJECT_ID/joblyai-ar/jobly-web:latest --region=asia-southeast1
}

if ($choice -eq "4") {
    Write-Host "`n==============================================" -ForegroundColor Yellow
    Write-Host "          ĐANG CHẠY DATABASE MIGRATIONS       " -ForegroundColor Yellow
    Write-Host "==============================================" -ForegroundColor Yellow
    
    $env:DATABASE_URL = $DATABASE_URL
    Write-Host "1. Tạo Prisma Client..." -ForegroundColor Cyan
    pnpm --filter @jobly/backend prisma:generate
    
    Write-Host "2. Thực thi prisma migrate deploy lên GCP Cloud SQL..." -ForegroundColor Cyan
    npx prisma migrate deploy --schema apps/backend/prisma/schema.prisma
}

Write-Host "`n==============================================" -ForegroundColor Green
Write-Host "              HOÀN THÀNH TRIỂN KHAI           " -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
