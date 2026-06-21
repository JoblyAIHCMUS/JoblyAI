# Windows PowerShell Script to build, push and deploy JoblyAI to GCP Production
# Hướng dẫn chạy: .\deploy-gcp-prod.ps1

# ==========================================
# CẤU HÌNH CÁC THÔNG SỐ TRIỂN KHAI GCP
# ==========================================
$GCP_PROJECT_ID = "steady-atlas-499014-n2" # ID dự án GCP thực tế của bạn
$GCP_REGION = "asia-southeast1" # Singapore
$AR_REPO_NAME = "joblyai-ar"

# Tên các dịch vụ Cloud Run
$RUN_API_SERVICE = "joblyai-run-svc-api"
$RUN_WEB_SERVICE = "joblyai-run-svc-web"

# Tên thực thể Cloud SQL
$CLOUDSQL_INSTANCE_NAME = "joblyai-db" # Ví dụ: joblyai-db
$CLOUDSQL_CONNECTION = "${GCP_PROJECT_ID}:${GCP_REGION}:${CLOUDSQL_INSTANCE_NAME}"

# Thông tin Máy ảo VM (Chạy ScyllaDB & Redis)
$VM_PUBLIC_IP = "34.143.182.149" # Thay bằng IP tĩnh public của VM Compute Engine

# Mật khẩu cho Database (Cần để chạy local migrations)
$DB_PASSWORD = "1234aaAA@" 

# Thông tin Domain chính thức
$DOMAIN_URL = "https://jobly.ai.vn"
$GCS_PUBLIC_BUCKET = "joblyai-public"
$GCS_PRIVATE_BUCKET = "joblyai-private"

# ==========================================
# BẮT ĐẦU KỊCH BẢN TỰ ĐỘNG
# ==========================================

# ANSI Color Codes (PowerShell styling)
Write-Host "==============================================" -ForegroundColor Green
Write-Host "       JOBLYAI GCP PRODUCTION DEPLOYER        " -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host "1. Deploy Backend API (Build + Push + Deploy Cloud Run)"
Write-Host "2. Deploy Frontend Web (Build + Push + Deploy Cloud Run)"
Write-Host "3. Deploy Cả Hai (Web + API)"
Write-Host "4. Chạy Database Migration (Prisma)"
Write-Host "5. Thoát"
$choice = Read-Host "Chọn tùy chọn (1-5)"

if ($choice -eq "5" -or [string]::IsNullOrEmpty($choice)) {
    Write-Host "Đã thoát." -ForegroundColor Yellow
    exit
}

# Cài đặt Project ID hiện tại
Write-Host "`n[1/2] Đang thiết lập GCP Project ID: $GCP_PROJECT_ID..." -ForegroundColor Cyan
gcloud config set project $GCP_PROJECT_ID

# Xác thực Docker với GCP Artifact Registry
Write-Host "[2/2] Đang xác thực Docker với GCP Artifact Registry..." -ForegroundColor Cyan
gcloud auth configure-docker "$GCP_REGION-docker.pkg.dev"

$AR_BASE_URL = "$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$AR_REPO_NAME"

if ($choice -eq "1" -or $choice -eq "3") {
    Write-Host "`n==============================================" -ForegroundColor Yellow
    Write-Host "        ĐANG BUILD & DEPLOY BACKEND API       " -ForegroundColor Yellow
    Write-Host "==============================================" -ForegroundColor Yellow
    
    $BACKEND_IMAGE = "$AR_BASE_URL/jobly-backend:latest"

    # Step 1: Build Docker Image
    Write-Host "1. Building Docker image: $BACKEND_IMAGE..." -ForegroundColor Cyan
    docker build -t $BACKEND_IMAGE -f apps/backend/Dockerfile .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Lỗi khi build image Backend Docker!"
        exit $LASTEXITCODE
    }

    # Step 2: Push to AR
    Write-Host "2. Pushing Docker image to Artifact Registry..." -ForegroundColor Cyan
    docker push $BACKEND_IMAGE
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Lỗi khi push image Backend lên Artifact Registry!"
        exit $LASTEXITCODE
    }

    # Step 3: Deploy to Cloud Run
    Write-Host "3. Đang deploy/update dịch vụ Cloud Run: $RUN_API_SERVICE..." -ForegroundColor Cyan
    
    gcloud run deploy $RUN_API_SERVICE `
        --image=$BACKEND_IMAGE `
        --region=$GCP_REGION `
        --allow-unauthenticated `
        --port=3000 `
        --add-cloudsql-instances=$CLOUDSQL_CONNECTION `
        --no-cpu-throttling `
        --session-affinity `
        --timeout=3600 `
        --min-instances=0 `
        --max-instances=5 `
        --memory=1Gi `
        --cpu=1 `
        --set-env-vars="NODE_ENV=production,SCYLLA_HOST=$VM_PUBLIC_IP,SCYLLA_PORT=9042,SCYLLA_USER=cassandra,SCYLLA_KEYSPACE=chat_app,SCYLLA_DATACENTER=datacenter1,GCS_PROJECT_ID=$GCP_PROJECT_ID,GCS_PUBLIC_BUCKET=$GCS_PUBLIC_BUCKET,GCS_PRIVATE_BUCKET=$GCS_PRIVATE_BUCKET,BETTER_AUTH_URL=$DOMAIN_URL,APP_URL=$DOMAIN_URL,WEB_URL=$DOMAIN_URL,WS_REDIS_ADAPTER=true" `
        --set-secrets="DATABASE_URL=database-url:latest,REDIS_URL=redis-url:latest,SCYLLA_PASSWORD=scylla-password:latest,GEMINI_API_KEY=gemini-api-key:latest,BETTER_AUTH_SECRET=better-auth-secret:latest"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Lỗi khi deploy Cloud Run Backend!"
        exit $LASTEXITCODE
    }
    Write-Host "Backend API đã deploy thành công!" -ForegroundColor Green
}

if ($choice -eq "2" -or $choice -eq "3") {
    Write-Host "`n==============================================" -ForegroundColor Yellow
    Write-Host "       ĐANG BUILD & DEPLOY FRONTEND WEB       " -ForegroundColor Yellow
    Write-Host "==============================================" -ForegroundColor Yellow

    $WEB_IMAGE = "$AR_BASE_URL/jobly-web:latest"

    # Step 1: Build Docker Image
    Write-Host "1. Building Docker image với NEXT_PUBLIC_API_URL=$DOMAIN_URL..." -ForegroundColor Cyan
    docker build --build-arg NEXT_PUBLIC_API_URL=$DOMAIN_URL -t $WEB_IMAGE -f apps/web/Dockerfile .

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Lỗi khi build image Frontend Docker!"
        exit $LASTEXITCODE
    }

    # Step 2: Push to AR
    Write-Host "2. Pushing Docker image to Artifact Registry..." -ForegroundColor Cyan
    docker push $WEB_IMAGE
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Lỗi khi push image Frontend lên Artifact Registry!"
        exit $LASTEXITCODE
    }

    # Step 3: Deploy to Cloud Run
    Write-Host "3. Đang deploy/update dịch vụ Cloud Run: $RUN_WEB_SERVICE..." -ForegroundColor Cyan
    gcloud run deploy $RUN_WEB_SERVICE `
        --image=$WEB_IMAGE `
        --region=$GCP_REGION `
        --allow-unauthenticated `
        --port=3000 `
        --memory=512Mi `
        --cpu=1 `
        --min-instances=0 `
        --max-instances=5 `
        --set-env-vars="NODE_ENV=production,NEXT_PUBLIC_API_URL=$DOMAIN_URL"

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Lỗi khi deploy Cloud Run Frontend!"
        exit $LASTEXITCODE
    }
    Write-Host "Frontend Web đã deploy thành công!" -ForegroundColor Green
}

if ($choice -eq "4") {
    Write-Host "`n==============================================" -ForegroundColor Yellow
    Write-Host "    ĐANG CHẠY DATABASE MIGRATIONS & SEEDING   " -ForegroundColor Yellow
    Write-Host "==============================================" -ForegroundColor Yellow
    
    Write-Host "Để kết nối, vui lòng đảm bảo IP hiện tại của bạn đã được thêm vào 'Authorized Networks' của Cloud SQL" -ForegroundColor Yellow
    Write-Host "Hoặc bạn đang chạy Cloud SQL Auth Proxy ở cổng 5432." -ForegroundColor Yellow
    
    $SQL_IP = Read-Host "Nhập IP Public của Cloud SQL (Nhấn Enter nếu đang chạy qua Proxy 127.0.0.1)"
    if ([string]::IsNullOrEmpty($SQL_IP)) {
        $SQL_IP = "127.0.0.1"
    }
    
    $LOCAL_DATABASE_URL = "postgresql://postgres:${DB_PASSWORD}@${SQL_IP}:5432/jobly_db"
    
    $confirm = Read-Host "Bạn đã sẵn sàng chạy migration & seeding? (Y/N)"
    
    if ($confirm -eq "Y" -or $confirm -eq "y") {
        $env:DATABASE_URL = $LOCAL_DATABASE_URL
        
        Write-Host "`n1. Tạo Prisma Client..." -ForegroundColor Cyan
        pnpm --filter @jobly/backend prisma:generate
        
        Write-Host "`n2. Thực thi prisma migrate deploy lên GCP Cloud SQL..." -ForegroundColor Cyan
        npx prisma migrate deploy --schema apps/backend/prisma/schema.prisma
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n3. Khởi tạo dữ liệu hệ thống (Categories & Skills) ở chế độ an toàn..." -ForegroundColor Cyan
            $env:SEED_MODE = "system"
            pnpm --filter @jobly/backend exec ts-node prisma/seed.ts
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`nDatabase migration & seeding hoàn tất thành công!" -ForegroundColor Green
            } else {
                Write-Warning "`nLỗi khi seeding dữ liệu hệ thống!"
            }
        } else {
            Write-Error "`nLỗi khi thực thi migration!"
        }
    } else {
        Write-Host "Đã hủy chạy migration." -ForegroundColor Yellow
    }
}

Write-Host "`n==============================================" -ForegroundColor Green
Write-Host "            HOÀN THÀNH TOÀN BỘ QUÁ TRÌNH THI VẬN  " -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
