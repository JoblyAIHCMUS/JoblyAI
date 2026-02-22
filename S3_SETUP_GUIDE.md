# S3 Upload Setup Guide - JoblyAI

Hướng dẫn setup S3 bucket với Presigned URL upload từ đầu đến cuối.

## Bước 1: Tạo S3 Bucket trên Console

### 1.1. Login AWS Console
```powershell
$HOME\aws-login.ps1 <MFA_code>
```
Sau đó mở: https://console.aws.amazon.com/

### 1.2. Tạo S3 Bucket

1. Mở **S3 Console**: https://s3.console.aws.amazon.com/s3/
2. Click **"Create bucket"**
3. Điền thông tin:
   - **Bucket name**: `jobly-dev-assets` (hoặc tên khác, phải unique toàn cầu)
   - **AWS Region**: `Asia Pacific (Singapore) ap-southeast-1`
4. **Object Ownership**: 
   - Chọn **"ACLs disabled (recommended)"**
5. **Block Public Access settings**:
   - ✅ **Giữ TẤT CẢ checkboxes ENABLED** (Block all public access)
   - Lý do: Dùng presigned URL, không cần public access
6. **Bucket Versioning**: Disabled (hoặc Enabled nếu cần)
7. **Default encryption**: 
   - Chọn **"Server-side encryption with Amazon S3 managed keys (SSE-S3)"**
8. Click **"Create bucket"**

### 1.3. Cấu hình CORS

1. Vào bucket vừa tạo: Click vào **`jobly-dev-assets`**
2. Tab **"Permissions"**
3. Scroll xuống **"Cross-origin resource sharing (CORS)"**
4. Click **"Edit"**
5. Paste config này:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": [
         "http://localhost:5173",
         "http://localhost:3000",
         "http://localhost:4200"
       ],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
6. Click **"Save changes"**

✅ **Bucket đã sẵn sàng!** Lưu lại tên bucket và region.

---

## Bước 2: Tạo IAM User cho Development trên Console

### 2.1. Tạo IAM Policy (Quyền truy cập S3)

1. Mở **IAM Console**: https://console.aws.amazon.com/iam/
2. Click **"Policies"** (menu bên trái)
3. Click **"Create policy"**
4. Chọn tab **"JSON"**
5. Paste policy này (thay `jobly-dev-assets` bằng tên bucket của bạn):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "JoblyS3Access",
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket",
           "s3:GetObjectAttributes"
         ],
         "Resource": [
           "arn:aws:s3:::jobly-dev-assets",
           "arn:aws:s3:::jobly-dev-assets/*"
         ]
       }
     ]
   }
   ```
6. Click **"Next"**
7. **Policy name**: `JoblyDevS3Access`
8. **Description**: `S3 access for JoblyAI development`
9. Click **"Create policy"**

### 2.2. Tạo IAM User

1. Trong IAM Console, click **"Users"** (menu trái)
2. Click **"Create user"**
3. **User name**: `jobly-dev-s3`
4. Click **"Next"**
5. **Permissions options**: Chọn **"Attach policies directly"**
6. Tìm và chọn policy **`JoblyDevS3Access`** (vừa tạo ở bước 2.1)
7. Click **"Next"**
8. Click **"Create user"**

### 2.3. Tạo Access Keys

1. Click vào user **`jobly-dev-s3`** vừa tạo
2. Tab **"Security credentials"**
3. Scroll xuống **"Access keys"**
4. Click **"Create access key"**
5. **Use case**: Chọn **"Application running outside AWS"**
6. Check ✅ **"I understand..."**
7. Click **"Next"**
8. **Description tag** (optional): `JoblyAI Backend Dev`
9. Click **"Create access key"**

### ⚠️ QUAN TRỌNG - Lưu credentials:

**Copy và lưu 2 thông tin này ngay (chỉ hiện 1 lần):**
- **Access key ID**: `AKIA...` (bắt đầu bằng AKIA)
- **Secret access key**: String dài

Click **"Download .csv file"** để backup.

✅ **IAM User đã sẵn sàng!**

---

## Bước 3: Cấu hình Backend

1. **Thêm vào `apps/backend/.env`:**
   ```env
   # AWS S3
   AWS_ACCESS_KEY_ID=AKIA... (từ bước 2)
   AWS_SECRET_ACCESS_KEY=... (từ bước 2)
   AWS_REGION=ap-southeast-1
   S3_BUCKET_NAME=jobly-dev-assets
   S3_UPLOAD_EXPIRY=300
   ```

2. **Thêm vào `apps/backend/.env.example`** (để team biết):
   ```env
   # AWS S3
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   AWS_REGION=ap-southeast-1
   S3_BUCKET_NAME=jobly-dev-assets
   S3_UPLOAD_EXPIRY=300
   ```

3. **Cập nhật `apps/backend/package.json`** - thêm AWS SDK:
   ```json
   "dependencies": {
     "@aws-sdk/client-s3": "^3.716.0",
     "@aws-sdk/s3-request-presigner": "^3.716.0",
     ...
   }
   ```

4. **Cài packages:**
   ```bash
   docker compose exec backend sh -c "cd /app && pnpm install"
   ```

---

## Bước 4: Tạo S3 Service (Backend)

File: `apps/backend/src/lib/s3.ts`

---

## Bước 5: Tạo Upload Module & Controller (Backend)

File: `apps/backend/src/app/upload/upload.service.ts`
File: `apps/backend/src/app/upload/upload.controller.ts`
File: `apps/backend/src/app/upload/upload.module.ts`

---

## Bước 6: Tạo Upload Component (Frontend)

File: `apps/web/src/components/FileUpload.tsx`
File: `apps/web/src/lib/upload.ts`

---

## Bước 7: Test

1. **Restart backend:**
   ```bash
   docker compose restart backend
   ```

2. **Kiểm tra env variables:**
   ```bash
   docker compose exec backend sh -c 'echo $AWS_REGION'
   # Phải hiển thị: ap-southeast-1
   ```

3. **Test API:**
   ```bash
   curl -X POST http://localhost:3000/api/upload/presigned-url \
     -H "Content-Type: application/json" \
     -d '{"fileName":"test.jpg","fileType":"image/jpeg"}'
   ```
   
   Response mẫu:
   ```json
   {
     "uploadUrl": "https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/uploads/...",
     "fileKey": "uploads/uuid.jpg",
     "expiresIn": 300
   }
   ```

4. **Test upload từ frontend:**
   - Start web: `pnpm nx serve @jobly/web`
   - Mở http://localhost:5173
   - Dùng FileUpload component
   - Check S3 console: https://s3.console.aws.amazon.com/s3/buckets/jobly-dev-assets

---

## Security Notes

- ⚠️ **KHÔNG commit `.env` lên Git!** (đã có trong `.gitignore`)
- ⚠️ Presigned URL có expiry (5 phút default)
- ⚠️ Validation file type/size ở backend trước khi tạo URL
- ⚠️ Production: Dùng separate bucket + IAM role thay vì user
- ✅ CORS chỉ allow localhost - nhớ update cho production domain

---

## Troubleshooting

**Backend không kết nối S3:**
```bash
docker compose logs backend | grep -i aws
```

**CORS errors:**
- Kiểm tra CORS config của bucket
- Verify origin trong request header

**Upload failed:**
- Check presigned URL chưa expire
- Verify file type match với presigned URL
- Check network tab trong browser DevTools

---

## Next Steps

Sau khi setup xong:
- [ ] Thêm file size validation
- [ ] Thêm virus scanning (ClamAV)
- [ ] Setup CloudFront CDN cho delivery
- [ ] Implement delete endpoint
- [ ] Add image optimization (Sharp/ImageMagick)
