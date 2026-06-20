#!/bin/bash
# Shell Script to build, push and deploy JoblyAI to GCP Production
# Hướng dẫn chạy: chmod +x deploy-gcp-prod.sh && ./deploy-gcp-prod.sh

# ==========================================
# CẤU HÌNH CÁC THÔNG SỐ TRIỂN KHAI GCP
# ==========================================
GCP_PROJECT_ID="steady-atlas-499014-n2" # ID dự án GCP thực tế của bạn
GCP_REGION="asia-southeast1" # Singapore
AR_REPO_NAME="joblyai-ar"

# Tên các dịch vụ Cloud Run
RUN_API_SERVICE="joblyai-run-svc-api"
RUN_WEB_SERVICE="joblyai-run-svc-web"

# Tên thực thể Cloud SQL
CLOUDSQL_INSTANCE_NAME="joblyai-db" # Ví dụ: joblyai-db
CLOUDSQL_CONNECTION="$GCP_PROJECT_ID:$GCP_REGION:$CLOUDSQL_INSTANCE_NAME"

# Thông tin Máy ảo VM (Chạy ScyllaDB & Redis)
VM_PUBLIC_IP="YOUR_VM_PUBLIC_IP" # Thay bằng IP tĩnh public của VM Compute Engine

# Mật khẩu & API Keys (Thay bằng thông tin bảo mật thực tế của bạn)
DB_PASSWORD="YOUR_CLOUD_SQL_DB_PASSWORD"
REDIS_PASSWORD="YOUR_SUPER_STRONG_REDIS_PASSWORD"
SCYLLA_PASSWORD="YOUR_SUPER_STRONG_SCYLLA_PASSWORD"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Thông tin Domain chính thức
BETTER_AUTH_SECRET="RANDOM_LONG_SECRET_KEY" # Tạo chuỗi ngẫu nhiên dài để mã hóa session
DOMAIN_URL="https://jobly.ai.vn"
GCS_PUBLIC_BUCKET="joblyai-public"
GCS_PRIVATE_BUCKET="joblyai-private"

# ANSI Color Codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ==========================================
# BẮT ĐẦU KỊCH BẢN TỰ ĐỘNG
# ==========================================

echo -e "${GREEN}==============================================${NC}"
echo -e "${GREEN}       JOBLYAI GCP PRODUCTION DEPLOYER        ${NC}"
echo -e "${GREEN}==============================================${NC}"
echo "1. Deploy Backend API (Build + Push + Deploy Cloud Run)"
echo "2. Deploy Frontend Web (Build + Push + Deploy Cloud Run)"
echo "3. Deploy Cả Hai (Web + API)"
echo "4. Chạy Database Migration (Prisma)"
echo "5. Thoát"
read -p "Chọn tùy chọn (1-5): " choice

if [ "$choice" == "5" ] || [ -z "$choice" ]; then
    echo -e "${YELLOW}Đã thoát.${NC}"
    exit 0
fi

# Cài đặt Project ID hiện tại
echo -e "\n${CYAN}[1/2] Đang thiết lập GCP Project ID: $GCP_PROJECT_ID...${NC}"
gcloud config set project "$GCP_PROJECT_ID"

# Xác thực Docker với GCP Artifact Registry
echo -e "${CYAN}[2/2] Đang xác thực Docker với GCP Artifact Registry...${NC}"
gcloud auth configure-docker "$GCP_REGION-docker.pkg.dev"

AR_BASE_URL="$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$AR_REPO_NAME"

if [ "$choice" == "1" ] || [ "$choice" == "3" ]; then
    echo -e "\n${YELLOW}==============================================${NC}"
    echo -e "${YELLOW}        ĐANG BUILD & DEPLOY BACKEND API       ${NC}"
    echo -e "${YELLOW}==============================================${NC}"
    
    BACKEND_IMAGE="$AR_BASE_URL/jobly-backend:latest"

    # Step 1: Build Docker Image
    echo -e "${CYAN}1. Building Docker image: $BACKEND_IMAGE...${NC}"
    docker build -t "$BACKEND_IMAGE" -f apps/backend/Dockerfile .
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Lỗi khi build image Backend Docker!${NC}"
        exit 1
    fi

    # Step 2: Push to AR
    echo -e "${CYAN}2. Pushing Docker image to Artifact Registry...${NC}"
    docker push "$BACKEND_IMAGE"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Lỗi khi push image Backend lên Artifact Registry!${NC}"
        exit 1
    fi

    # Step 3: Deploy to Cloud Run
    echo -e "${CYAN}3. Đang deploy/update dịch vụ Cloud Run: $RUN_API_SERVICE...${NC}"
    
    DATABASE_URL="postgresql://postgres:$DB_PASSWORD@/jobly_db?host=/cloudsql/$CLOUDSQL_CONNECTION"
    REDIS_URL="redis://:$REDIS_PASSWORD@$VM_PUBLIC_IP:6379"

    gcloud run deploy "$RUN_API_SERVICE" \
        --image="$BACKEND_IMAGE" \
        --region="$GCP_REGION" \
        --allow-unauthenticated \
        --port=3000 \
        --add-cloudsql-instances="$CLOUDSQL_CONNECTION" \
        --no-cpu-throttling \
        --session-affinity \
        --timeout=3600 \
        --min-instances=0 \
        --max-instances=5 \
        --memory=1Gi \
        --cpu=1 \
        --set-env-vars="NODE_ENV=production,DATABASE_URL=$DATABASE_URL,REDIS_URL=$REDIS_URL,SCYLLA_HOST=$VM_PUBLIC_IP,SCYLLA_PORT=9042,SCYLLA_USER=cassandra,SCYLLA_PASSWORD=$SCYLLA_PASSWORD,SCYLLA_KEYSPACE=chat_app,SCYLLA_DATACENTER=datacenter1,GCS_PROJECT_ID=$GCP_PROJECT_ID,GCS_PUBLIC_BUCKET=$GCS_PUBLIC_BUCKET,GCS_PRIVATE_BUCKET=$GCS_PRIVATE_BUCKET,GEMINI_API_KEY=$GEMINI_API_KEY,BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET,BETTER_AUTH_URL=$DOMAIN_URL,APP_URL=$DOMAIN_URL,WEB_URL=$DOMAIN_URL,WS_REDIS_ADAPTER=true"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Lỗi khi deploy Cloud Run Backend!${NC}"
        exit 1
    fi
    echo -e "${GREEN}Backend API đã deploy thành công!${NC}"
fi

if [ "$choice" == "2" ] || [ "$choice" == "3" ]; then
    echo -e "\n${YELLOW}==============================================${NC}"
    echo -e "${YELLOW}       ĐANG BUILD & DEPLOY FRONTEND WEB       ${NC}"
    echo -e "${YELLOW}==============================================${NC}"

    WEB_IMAGE="$AR_BASE_URL/jobly-web:latest"

    # Step 1: Build Docker Image
    echo -e "${CYAN}1. Building Docker image với NEXT_PUBLIC_API_URL=$DOMAIN_URL...${NC}"
    docker build --build-arg NEXT_PUBLIC_API_URL="$DOMAIN_URL" -t "$WEB_IMAGE" -f apps/web/Dockerfile .

    if [ $? -ne 0 ]; then
        echo -e "${RED}Lỗi khi build image Frontend Docker!${NC}"
        exit 1
    fi

    # Step 2: Push to AR
    echo -e "${CYAN}2. Pushing Docker image to Artifact Registry...${NC}"
    docker push "$WEB_IMAGE"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Lỗi khi push image Frontend lên Artifact Registry!${NC}"
        exit 1
    fi

    # Step 3: Deploy to Cloud Run
    echo -e "${CYAN}3. Đang deploy/update dịch vụ Cloud Run: $RUN_WEB_SERVICE...${NC}"
    gcloud run deploy "$RUN_WEB_SERVICE" \
        --image="$WEB_IMAGE" \
        --region="$GCP_REGION" \
        --allow-unauthenticated \
        --port=3000 \
        --memory=512Mi \
        --cpu=1 \
        --min-instances=0 \
        --max-instances=5 \
        --set-env-vars="NODE_ENV=production,NEXT_PUBLIC_API_URL=$DOMAIN_URL"

    if [ $? -ne 0 ]; then
        echo -e "${RED}Lỗi khi deploy Cloud Run Frontend!${NC}"
        exit 1
    fi
    echo -e "${GREEN}Frontend Web đã deploy thành công!${NC}"
fi

if [ "$choice" == "4" ]; then
    echo -e "\n${YELLOW}==============================================${NC}"
    echo -e "${YELLOW}          ĐANG CHẠY DATABASE MIGRATIONS       ${NC}"
    echo -e "${YELLOW}==============================================${NC}"
    
    # Ở local cần kết nối qua TCP công cộng (phải mở IP local ở phần Cloud SQL Authorized Networks)
    # Hoặc chạy Cloud SQL Auth Proxy để bảo mật.
    LOCAL_DATABASE_URL="postgresql://postgres:$DB_PASSWORD@YOUR_CLOUD_SQL_IP:5432/jobly_db"
    
    echo -e "${YELLOW}Để chạy migration, vui lòng đảm bảo IP hiện tại của bạn đã được add vào 'Authorized Networks' của Cloud SQL${NC}"
    echo -e "${YELLOW}Hoặc sử dụng Cloud SQL Auth Proxy.${NC}"
    read -p "Bạn đã sẵn sàng chạy migration? (Y/N): " confirm
    
    if [ "$confirm" == "Y" ] || [ "$confirm" == "y" ]; then
        export DATABASE_URL="$LOCAL_DATABASE_URL"
        echo -e "${CYAN}1. Tạo Prisma Client...${NC}"
        pnpm --filter @jobly/backend prisma:generate
        
        echo -e "${CYAN}2. Thực thi prisma migrate deploy lên GCP Cloud SQL...${NC}"
        npx prisma migrate deploy --schema apps/backend/prisma/schema.prisma
    else
        echo -e "${YELLOW}Đã hủy chạy migration.${NC}"
    fi
fi

echo -e "\n${GREEN}==============================================${NC}"
echo -e "${GREEN}            HOÀN THÀNH TOÀN BỘ QUÁ TRÌNH THI VẬN  ${NC}"
echo -e "${GREEN}==============================================${NC}"
