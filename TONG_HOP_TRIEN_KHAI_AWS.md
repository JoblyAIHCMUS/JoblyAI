# Hướng Dẫn Toàn Tập: Triển Khai JoblyAI lên AWS (End-to-End)

Tài liệu này cung cấp toàn bộ mã nguồn và hướng dẫn chi tiết để thiết lập hệ thống JoblyAI từ con số 0, bao gồm cả Frontend (Amplify) và Backend (EC2).

---

## 1. Giai Đoạn 1: Thiết Lập Thủ Công (AWS Console) - Từng Bước Một

### 1.1. Mạng (VPC)
1.  Vào **VPC Dashboard** -> **Create VPC**.
2.  Chọn **"VPC and more"**.
3.  **Name:** `jobly-vpc`. **IPv4 CIDR:** `10.0.0.0/16`.
4.  **Number of AZs:** 2.
5.  **Public subnets:** 2. **Private subnets:** 2.
6.  **NAT gateways:** None. **VPC Endpoints:** None.
7.  Nhấn **Create VPC**. Đợi AWS tạo xong các Route Table và Gateway.
8.  **QUAN TRỌNG:** Vào lại VPC vừa tạo, chọn **Actions** -> **Edit VPC settings** -> Đảm bảo đã tick chọn **Enable DNS resolution** và **Enable DNS hostnames** (Giúp EC2 và RDS có thể giao tiếp qua hostname nội bộ dễ dàng).

### 1.2. Lưu trữ (S3)
1.  Vào **S3** -> **Create bucket**.
2.  **Bucket name:** `jobly-assets-storage` (Đổi tên bucket rộng hơn `resumes` vì chứa cả Logos/Avatars. Thêm hậu tố ngẫu nhiên như `jobly-assets-storage-123`).
3.  **Region:** Chọn cùng region với VPC (ví dụ: `ap-southeast-1`).
4.  **Block Public Access:**
    - Bạn **BỎ CHECK** ô "Block all public access" -> Tick vào ô đồng ý "I acknowledge that the current settings might result in this bucket and the objects within becoming public." (Bởi vì Avatar và Logo cần public để hiển thị trên web).
5.  Nhấn **Create bucket**.
6.  **Cấu hình CORS để Frontend tải file:**
    - Mở Bucket vừa tạo, sang tab **Permissions**.
    - Cuộn xuống phần **Cross-origin resource sharing (CORS)**, nhấn Edit và dán:
      ```json
      [
          {
              "AllowedHeaders": ["*"],
              "AllowedMethods": ["PUT", "POST", "GET", "DELETE", "HEAD"],
              "AllowedOrigins": ["*"],
              "ExposeHeaders": ["ETag"]
          }
      ]
      ```
7.  **Cấu hình Bucket Policy (CỰC KỲ QUAN TRỌNG ĐỂ BẢO MẬT CV):**
    - Vẫn ở tab **Permissions**, cuộn xuống mục **Bucket policy**, nhấn Edit và dán cấu hình sau (Nhớ thay `jobly-assets-storage` thành tên thực tế của bucket ở Bước 2).
    - *Policy này cho phép public ai cũng xem được hình ảnh trong các thư mục định sẵn (Avatar, Logo, Public), nhưng CẤM TUYỆT ĐỐI không cho public truy cập vào `resumes/` (chứa file CV).*
      ```json
      {
          "Version": "2012-10-17",
          "Statement": [
              {
                  "Sid": "PublicReadOnlyForWebAssets",
                  "Effect": "Allow",
                  "Principal": "*",
                  "Action": "s3:GetObject",
                  "Resource": [
                      "arn:aws:s3:::jobly-assets-storage/assets/avatars/*",
                      "arn:aws:s3:::jobly-assets-storage/assets/logos/*",
                      "arn:aws:s3:::jobly-assets-storage/assets/public/*"
                  ]
              }
          ]
      }
      ```

### 1.3. Cơ sở dữ liệu (RDS)
1.  Vào **RDS** -> **Subnet groups** -> **Create DB subnet group**.
    *   Name: `jobly-rds-group`. VPC: `jobly-vpc`.
    *   Add subnets: Chọn 2 **Private Subnets** đã tạo ở bước 1.1.
2.  Vào **Databases** -> **Create database**.
    *   **Choose a database creation method:** Standard create.
    *   **Engine options:** PostgreSQL.
    *   **Templates:** Chọn **Free tier** (Rất quan trọng để không bị tính phí).
    *   **Settings:** 
        *   DB instance identifier: `jobly-db-prod`.
        *   Credentials management: Chọn **Self managed** (Tự quản lý).
        *   Master username: `postgres` -> Tự điền Master password của bạn vào.
    *   **Storage:** Để 20GB, nhớ **bỏ check mục Enable storage autoscaling** (để tránh phát sinh phí nếu db đầy).
    *   **Connectivity:** 
        *   Compute resource: *Don't connect to an EC2 compute resource*.
        *   Virtual private cloud (VPC): Chọn `jobly-vpc`.
        *   DB Subnet Group: Chọn `jobly-rds-group`.
        *   Public access: Chọn **No**.
        *   VPC security group (firewall): Chọn **Create new** -> Tên SG điền: `jobly-rds-sg`.
3.  Sau khi check kĩ các mục trên, kéo xuống dưới cùng nhấn **Create database**.
4.  **Mở port Database cho EC2 (Lưu ý: Làm bước này SAU KHI hoàn thành bước 1.4 tạo EC2):**
    *   Vào menu **Security Groups**, tìm tới nhóm `jobly-rds-sg` -> Chọn tab **Inbound rules** -> Nhấn **Edit inbound rules**.
    *   *(Xử lý lỗi)* Nếu bạn sửa đè lên rule IP cũ, AWS sẽ báo lỗi *"You may not specify a referenced group id for an existing IPv4 CIDR rule"*. Bắt buộc phải **XÓA (Delete)** rule Inbound mặc định hiện có đi.
    *   Nhấn **Add rule** để tạo lại từ đầu: Type chọn **PostgreSQL** (Port 5432) -> Source chọn **Custom** -> Click vào ô bên cạnh gõ `jobly-ec2-sg` (chọn Security Group của EC2 có dạng `sg-xxxx...`).
    *   Nhấn **Save rules**. Cấu hình này giúp chỉ con máy chủ EC2 của bạn mới được phép kết nối an toàn vào cục CSDL.

### 1.4. Máy chủ (EC2)
1.  **Tạo Key Pair (chuẩn bị SSH):**
    *   Vào menu **Key Pairs** -> **Create key pair**. Name: `jobly-ec2-key`. Tải file về (.pem) và lưu trữ an toàn.
2.  Vào **EC2** -> **Launch instance**.
    *   **Name:** `jobly-backend`. **AMI:** Ubuntu 24.04 LTS.
    *   **Instance type:** `t3.medium`.
    *   **Key pair (login):** Chọn `jobly-ec2-key` đã tạo ở trên.
    *   **Network:** VPC: `jobly-vpc`. Subnet: **Public Subnet 1**.
    *   **Auto-assign public IP:** Enable.
    *   **Security Group:** Tạo mới, đặt tên `jobly-ec2-sg`, mở cổng 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (Backend API).    *   **Configure storage:** Chỉnh dung lượng thành **30 GB** (loại **gp3**). *Lưu ý: Mặc định 8GB là không đủ để lưu trữ các Docker Image (Scylla, Redis, Nginx...). AWS Free Tier miễn phí tối đa 30GB nên cứ tận dụng.*3.  **Advanced details** -> **IAM instance profile**: (Vào IAM tạo 1 role gán policy `SecretsManagerReadWrite`, đặt tên `jobly-ec2-role` và chọn ở đây).
4.  **User Data (Rất phần quan trọng):** Cuộn xuống dưới cùng phần Advanced details tìm khung User Data và dán đoạn bash script sau vào. Đoạn script này giúp EC2 tự động cài đặt Docker và Docker Compose ngay lần đầu (First Boot) khởi động máy:
    ```bash
    #!/bin/bash
    apt update
    apt install -y docker.io docker-compose
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ubuntu
    ```
5.  Hoàn tất cấu hình, nhấn nút **Launch instance** màu cam ở góc phải màn hình.
6.  **Cấp Elastic IP (EIP) - Phải làm sau khi EC2 đã tạo xong:**
    *   Ở menu bên trái của màn hình EC2, kéo xuống mục **Network & Security** -> Chọn **Elastic IPs**.
    *   Nhấn nút **Allocate Elastic IP address** ở góc phải trên cùng -> Nhấn **Allocate**.
    *   Bạn sẽ thấy một dòng IP mới vừa được tạo. Click chọn nó.
    *   Nhấn nút **Actions** -> Chọn **Associate Elastic IP address**.
    *   **Instance:** Click vào ô trống, chọn cái máy `jobly-backend` bạn vừa tạo ở bước trên.
    *   Nhấn **Associate**. Từ bây giờ, IP của con Backend này là tĩnh (không bao giờ thay đổi mỗi khi bạn restart máy ảo). Lấy IP này để dùng cho bước ssh và setup Github Actions.

### 1.5. Frontend (Amplify)
1.  Vào **AWS Amplify** -> **Create new app** -> **GitHub**.
2.  Kết nối tài khoản GitHub, chọn repo `JoblyAI` và nhánh `main`.
3.  **Build settings:** Amplify sẽ tự động nhận diện khung làm việc Next.js.
4.  **Environment variables (Biến môi trường) - Quan Trọng:**
    *   Thêm biến `NEXT_PUBLIC_API_URL` trỏ tới API của EC2.
    *   Ví dụ: `NEXT_PUBLIC_API_URL` = `http://<ELASTIC_IP_CỦA_EC2>:3000/api`
5.  Nhấn **Save and deploy**.

---

## 2. Giai Đoạn 2: Vận Hành Tự Động bằng GitHub Actions
Thay vì phải SSH thủ công vào server mỗi lần code có tính năng mới, chúng ta sẽ thiết lập **GitHub Actions** để tự động SSH vào máy chủ EC2, cập nhật code và vận hành bằng Docker Compose.

*Lưu ý: Bạn phải tạo VPC, S3, RDS, và EC2 ở Giao Đoạn 1 thành công trước khi dùng giai đoạn này.*

### 2.1. Cấu hình Biến môi trường ban đầu cho EC2 (Làm duy nhất 1 lần)
Trước khi GitHub Action chạy, máy chủ EC2 cần được tạo sẵn file chứa các key bí mật (không được lưu trên Github). 
1. Mở Terminal máy tính, SSH vào EC2: `ssh -i "jobly-ec2-key.pem" ubuntu@<ELASTIC_IP_CỦA_EC2>`
2. Tạo thư mục và file `.env`:
   ```bash
   mkdir -p ~/joblyai/apps/backend
   nano ~/joblyai/apps/backend/.env
   ```
3. Dán các biến kết nối vào (như thông tin RDS và S3 đã tạo ở bước 1):
   ```env
   DATABASE_URL="postgresql://postgres:<mật_khẩu>@<endpoint-rds>:5432/postgres?schema=public"
   S3_BUCKET_NAME="jobly-assets-storage"
   AWS_REGION="ap-southeast-1"
   NODE_ENV="production"
   ```
4. Lưu và thoát (Nhấn `Ctrl+O`, `Enter`, `Ctrl+X`). Sau đó gõ `exit` để thoát khỏi EC2.

### 2.2. Thiết lập Github Secrets
Trên trình duyệt, vào trang Github Repository của bạn -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret** để thêm 3 biến:
1. `EC2_IP`: Lưu địa chỉ Elastic IP của EC2.
2. `SSH_PRIVATE_KEY`: Mở file `jobly-ec2-key.pem` bằng Notepad, copy toàn bộ nội dung dán vào.
3. `EC2_USERNAME`: Điền `ubuntu` (đây là user mặc định của máy ảo Ubuntu).

### 2.3. Mã nguồn Workflow của GitHub Actions 
Tiếp theo, trong source code trên máy bạn, hãy tạo (hoặc lưu) file này tại đường dẫn: `.github/workflows/deploy.yml`:

```yaml
name: Deploy Backend JoblyAI to EC2

on:
  push:
    branches: [ main ]  # Chỉ kích hoạt khi merge/push vào nhánh main

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2 via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_IP }}
          username: ${{ secrets.EC2_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          # Câu lệnh script dưới đây sẽ được chạy tự động trên máy ảo EC2
          script: |
            # 1. Kéo Source Code mới nhất
            cd ~/joblyai || (git clone https://github.com/${{ github.repository }}.git ~/joblyai && cd ~/joblyai)
            git pull origin main
            
            # 2. Chạy môi trường Production với Docker Compose
            # (Không gọi postgres vì ta đã có RDS, chỉ gọi ứng dụng Backend và DB nội bộ Scylla/Redis)
            docker-compose -f docker-compose.yml up -d --build backend nginx redis scylla scylla-init
            
            # 3. Dọn dẹp RAM (xóa các Docker Image bị thừa sau khi build)
            docker image prune -f
            
            # 4. Kích hoạt cập nhật Database (Prisma Migrate)
            docker-compose exec -T -T backend npx prisma migrate deploy
```

**Hoàn tất!**
Từ giờ về sau, quy trình của bạn sẽ rất nhàn nhã:
1. Bạn code ở nhà, test xong nghiệp vụ mới.
2. Bạn gõ `git push origin main`.
3. Server tự động lấy code mới, restart backend mới trong vòng 2 phút, RDS tự động nạp bảng biểu mới. Bạn chỉ việc ngồi uống cà phê chờ kết quả thành công hiện lên Github!

---

## 3. Giai Đoạn 3: Tự Động Hóa 100% Hạ Tầng (Terraform) - Tùy Chọn

*Đây là phần lưu trữ dành cho tương lai. Khi hệ thống lớn lên và bạn không muốn dùng chuột click thủ công trên giao diện AWS nữa, bạn có thể dùng mã nguồn Terraform dưới đây để khởi tạo 100% hạ tầng mạng, DB, EC2, và Frontend chỉ với 1 câu lệnh.*

### 3.1. Frontend - AWS Amplify (`frontend.tf`)
```hcl
resource "aws_amplify_app" "jobly_frontend" {
  name       = "jobly-frontend"
  repository = "https://github.com/[user]/joblyai" # Thay bằng repo của bạn
  access_token = var.github_token # Token để Amplify pull code

  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - npm install
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
  EOT

  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.jobly_frontend.id
  branch_name = "main"
}
```

### 3.2. Compute & IAM Role (`compute.tf`)
```hcl
# IAM Role cho phép EC2 đọc Secret
resource "aws_iam_role" "ec2_role" {
  name = "jobly-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17", Statement = [{ Action = "sts:AssumeRole", Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" } }]
  })
}

resource "aws_iam_role_policy_attachment" "sm_policy" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "jobly-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# EC2 Instance
resource "aws_instance" "backend" {
  ami           = "ami-060e2739b6905c2db" # Ubuntu 24.04 ap-southeast-1
  instance_type = "t3.medium"
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  subnet_id     = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              apt update
              apt install -y docker.io docker-compose
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu
              EOF

  tags = { Name = "jobly-backend" }
}
```

### 3.3. Database & Secrets (`data.tf`)
```hcl
# RDS Instance
resource "aws_db_instance" "db" {
  allocated_storage    = 20
  engine               = "postgres"
  instance_class       = "db.t4g.micro"
  username             = "postgres"
  password             = var.db_password
  db_subnet_group_name = aws_db_subnet_group.main.id
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  skip_final_snapshot  = true
}

# Lưu Database URL vào Secrets Manager
resource "aws_secretsmanager_secret" "env" {
  name = "jobly/prod/env"
}

resource "aws_secretsmanager_secret_version" "v1" {
  secret_id     = aws_secretsmanager_secret.env.id
  secret_string = jsonencode({
    DATABASE_URL = "postgresql://postgres:${var.db_password}@${aws_db_instance.db.endpoint}/postgres"
    GEMINI_API_KEY = var.gemini_api_key
  })
}
```

---

## Tổng Kết
1.  **Manual (Giai đoạn 1):** Dành cho quy mô vừa và nhỏ, thiết lập từng bước trên giao diện Web rất trực quan.
2.  **CI/CD (Giai đoạn 2):** Chìa khóa để không phải thao tác tay lặp đi lặp lại. GitHub Actions lo phần Backend. AWS Amplify lo phần Frontend.
3.  **Terraform (Giai đoạn 3):** Quản lý tập trung mọi tài nguyên bằng code, dễ dàng nhân bản hạ tầng sang một Region (Khu vực) khác.
