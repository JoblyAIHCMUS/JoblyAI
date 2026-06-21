#!/bin/bash
# Shell Script to deploy JoblyAI to GCP locally
# Hướng dẫn chạy: chmod +x deploy-local.sh && ./deploy-local.sh

GCP_PROJECT_ID="steady-atlas-499014-n2" # Thay bằng ID dự án GCP thực tế của bạn
NEXT_PUBLIC_API_URL="https://jobly.ai.vn" # Thay bằng URL chính thực tế của bạn (code tự động nối thêm /api)
DATABASE_URL="postgresql://postgres:PASSWORD@IP_DATABASE:5432/jobly_db" # Thay bằng DB Connection String của bạn

# ANSI Color Codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}==============================================${NC}"
echo -e "${GREEN}       JOBLYAI LOCAL GCP DEPLOYMENT TOOL      ${NC}"
echo -e "${GREEN}==============================================${NC}"
echo "1. Deploy Backend API"
echo "2. Deploy Frontend Web"
echo "3. Deploy Cả Hai (Web + API)"
echo "4. Chạy Database Migration (Prisma)"
echo "5. Thoát"
read -p "Chọn tùy chọn (1-5): " choice

if [ "$choice" == "5" ] || [ -z "$choice" ]; then
    echo -e "${YELLOW}Đã thoát.${NC}"
    exit 0
fi

# Cài đặt Project ID hiện tại
echo -e "\n${CYAN}[1/2] Đang thiết lập GCP Project ID...${NC}"
gcloud config set project "$GCP_PROJECT_ID"

# Xác thực Docker
echo -e "${CYAN}[2/2] Đang xác thực Docker với GCP...${NC}"
gcloud auth configure-docker asia-southeast1-docker.pkg.dev

if [ "$choice" == "1" ] || [ "$choice" == "3" ]; then
    echo -e "\n${YELLOW}==============================================${NC}"
    echo -e "${YELLOW}        ĐANG BUILD & DEPLOY BACKEND API       ${NC}"
    echo -e "${YELLOW}==============================================${NC}"
    
    echo -e "${CYAN}1. Building Docker image...${NC}"
    docker build -t asia-southeast1-docker.pkg.dev/"$GCP_PROJECT_ID"/joblyai-ar/jobly-backend:latest -f apps/backend/Dockerfile .
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Lỗi khi build image Backend Docker!${NC}"
        exit 1
    fi

    echo -e "${CYAN}2. Pushing Docker image to Artifact Registry...${NC}"
    docker push asia-southeast1-docker.pkg.dev/"$GCP_PROJECT_ID"/joblyai-ar/jobly-backend:latest

    echo -e "${CYAN}3. Cập nhật dịch vụ Cloud Run API...${NC}"
    gcloud run services update joblyai-run-svc-api --image=asia-southeast1-docker.pkg.dev/"$GCP_PROJECT_ID"/joblyai-ar/jobly-backend:latest --region=asia-southeast1
fi

if [ "$choice" == "2" ] || [ "$choice" == "3" ]; then
    echo -e "\n${YELLOW}==============================================${NC}"
    echo -e "${YELLOW}       ĐANG BUILD & DEPLOY FRONTEND WEB       ${NC}"
    echo -e "${YELLOW}==============================================${NC}"

    echo -e "${CYAN}1. Building Docker image với NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL...${NC}"
    docker build --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" -t asia-southeast1-docker.pkg.dev/"$GCP_PROJECT_ID"/joblyai-ar/jobly-web:latest -f apps/web/Dockerfile .

    if [ $? -ne 0 ]; then
        echo -e "${RED}Lỗi khi build image Frontend Docker!${NC}"
        exit 1
    fi

    echo -e "${CYAN}2. Pushing Docker image to Artifact Registry...${NC}"
    docker push asia-southeast1-docker.pkg.dev/"$GCP_PROJECT_ID"/joblyai-ar/jobly-web:latest

    echo -e "${CYAN}3. Cập nhật dịch vụ Cloud Run Frontend...${NC}"
    gcloud run services update joblyai-run-svc-web --image=asia-southeast1-docker.pkg.dev/"$GCP_PROJECT_ID"/joblyai-ar/jobly-web:latest --region=asia-southeast1
fi

if [ "$choice" == "4" ]; then
    echo -e "\n${YELLOW}==============================================${NC}"
    echo -e "${YELLOW}          ĐANG CHẠY DATABASE MIGRATIONS       ${NC}"
    echo -e "${YELLOW}==============================================${NC}"
    
    export DATABASE_URL="$DATABASE_URL"
    echo -e "${CYAN}1. Tạo Prisma Client...${NC}"
    pnpm --filter @jobly/backend prisma:generate
    
    echo -e "${CYAN}2. Thực thi prisma migrate deploy lên GCP Cloud SQL...${NC}"
    npx prisma migrate deploy --schema apps/backend/prisma/schema.prisma
fi

echo -e "\n${GREEN}==============================================${NC}"
echo -e "${GREEN}              HOÀN THÀNH TRIỂN KHAI           ${NC}"
echo -e "${GREEN}==============================================${NC}"
