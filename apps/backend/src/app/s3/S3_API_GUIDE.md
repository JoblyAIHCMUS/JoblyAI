# 📚 S3 API Documentation (Migrated to GCS)

> ⚠️ **MIGRATION NOTE**: This service has been migrated to use **Google Cloud Storage (GCS)**.
> The S3 logic remains commented out in the code for fallback purposes.
> The API endpoints (`/s3/...`) remain the same to maintain frontend compatibility.

Complete guide for file management in JoblyAI.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Access Control](#access-control)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Upload Flow](#upload-flow)
6. [Download Flow](#download-flow)
7. [Delete Flow](#delete-flow)
8. [Use Cases](#use-cases)
9. [Error Handling](#error-handling)
10. [Integration Guide](#integration-guide)
11. [Testing Guide](#testing-guide)
12. [Testing Guide](#testing-guide)

---

## 🎯 Overview

JoblyAI uses **AWS S3** for file storage with **presigned URLs** for direct client-to-S3 uploads.

### **Benefits:**

- ✅ Fast uploads (direct to S3, not through backend)
- ✅ Secure (time-limited URLs, authenticated endpoints)
- ✅ Scalable (handles thousands of concurrent uploads)
- ✅ Cost-effective (reduces backend bandwidth)

### **Supported Files:**

| Folder    | File Types     | Use Case              |
| --------- | -------------- | --------------------- |
| `resumes` | PDF, DOC, DOCX | Candidate resumes     |
| `avatars` | JPG, PNG, WEBP | User profile pictures |
| `logos`   | JPG, PNG, SVG  | Company logos         |

---

## ⚠️ Access Control

### **Important: S3 Bucket Access Configuration**

The S3 URLs returned by the upload endpoint (`fileUrl`) are **S3 object URLs**, not publicly accessible URLs by default.

#### **Option 1: Public Bucket (Simple, Less Secure)**

Configure your S3 bucket for public read access:

1. **S3 Bucket Settings:**
   - Disable "Block Public Access"
   - Add bucket policy allowing public `s3:GetObject`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::jobly-dev-assets/*"
    }
  ]
}
```

✅ **Pros:** Simple URLs, no expiry, can share directly  
❌ **Cons:** Files accessible by anyone with URL, no access control

#### **Option 2: Private Bucket with Presigned URLs (Recommended)**

Keep bucket private and use presigned download URLs:

1. **S3 Bucket Settings:**

   - Keep "Block Public Access" enabled (default)
   - No bucket policy needed

2. **Access Pattern:**
   - Store `fileKey` in database (not the URL)
   - Generate presigned download URL when user requests file
   - URLs expire after set time (e.g., 1 hour)

✅ **Pros:** Secure, time-limited access, audit trail  
❌ **Cons:** URLs expire, requires extra API call

#### **Option 3: CloudFront + OAC (Production)**

Use CloudFront with Origin Access Control for best security:

- Private S3 bucket
- CloudFront serves files via CDN
- Optional: Custom domain, SSL, signed cookies
- Fastest access worldwide

---

## 🔌 API Endpoints

### **Base URL:** `http://localhost:3000/api`

| Method | Endpoint                 | Description                    | Auth        |
| ------ | ------------------------ | ------------------------------ | ----------- |
| POST   | `/s3/presigned-upload`   | Get presigned URL for upload   | ✅ Required |
| POST   | `/s3/presigned-download` | Get presigned URL for download | ✅ Required |
| DELETE | `/s3/file`               | Delete file from S3            | ✅ Required |

---

## 🔐 Authentication

All S3 endpoints require authentication using **Bearer token**.

### **Get Token:**

```bash
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Use Token:**

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📤 Upload Flow

### **Complete 2-Step Process:**

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant S3

    User->>Frontend: Select file
    Frontend->>Backend: POST /s3/presigned-upload
    Backend->>S3: Request signature
    S3->>Backend: Presigned URL
    Backend->>Frontend: { uploadUrl, fileKey, fileUrl }
    Frontend->>S3: PUT file (direct upload)
    S3->>Frontend: 200 OK
    Frontend->>Backend: Save fileKey to DB
```

---

### **Step 1: Get Presigned Upload URL**

**Endpoint:** `POST /api/s3/presigned-upload`

**Request:**

```json
{
  "fileName": "resume.pdf",
  "fileType": "application/pdf",
  "folder": "resumes"
}
```

**Request Parameters:**

| Field      | Type   | Required | Description                                                           |
| ---------- | ------ | -------- | --------------------------------------------------------------------- |
| `fileName` | string | ✅       | Original filename (e.g., "John_Resume.pdf")                           |
| `fileType` | string | ✅       | MIME type (e.g., "application/pdf")                                   |
| `folder`   | string | ❌       | Target folder: `resumes` \| `avatars` \| `logos` (default: `resumes`) |

**Response:**

```json
{
  "uploadUrl": "https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/resumes/abc-123.pdf?X-Amz-Signature=...",
  "fileKey": "resumes/abc-123.pdf",
  "fileUrl": "https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/resumes/abc-123.pdf",
  "expiresIn": 300
}
```

**Response Fields:**

| Field       | Type   | Description                                                                             |
| ----------- | ------ | --------------------------------------------------------------------------------------- |
| `uploadUrl` | string | Time-limited URL for uploading (expires in 5 minutes)                                   |
| `fileKey`   | string | S3 object key (**save this to DB** for deletion and download)                           |
| `fileUrl`   | string | S3 object URL (⚠️ requires bucket public access OR NOT RECOMMENDED for private buckets) |
| `expiresIn` | number | Upload URL expiry time in seconds (default: 300 = 5 minutes)                            |

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/s3/presigned-upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "resume.pdf",
    "fileType": "application/pdf",
    "folder": "resumes"
  }'
```

---

### **Step 2: Upload File to S3**

**Endpoint:** Use `uploadUrl` from Step 1

**Method:** `PUT`

**Headers:**

```
Content-Type: application/pdf  (must match fileType from Step 1)
```

**Body:** Binary file data

**cURL Example:**

```bash
curl -X PUT "UPLOAD_URL_FROM_STEP_1" \
  -H "Content-Type: application/pdf" \
  --data-binary "@/path/to/resume.pdf"
```

**Success Response:** `200 OK` (empty body)

---

### **Step 3: Save to Database**

After successful upload, save **only `fileKey`** to your database:

```typescript
// Example: Update candidate profile with resumeFileKey
PATCH /api/candidate/me
{
  "resumeFileKey": "resumes/abc-123.pdf"
}
```

**Important:**

- Store **only `fileKey`** in database, NOT `fileUrl`
- `fileUrl` requires bucket public access (not recommended for security)
- Generate presigned download URLs dynamically via `/s3/presigned-download` endpoint when needed

---

## 📥 Download Flow

### **Option 1: Direct S3 URL (Public Bucket)**

If your bucket is configured for public access, use the `fileUrl` directly:

```typescript
// Display resume link
<a href={candidate.fileUrl} target="_blank">View Resume</a>

// Or for avatars
<img src={user.avatarFileUrl} alt="Avatar" />
```

⚠️ **Requires:** Bucket must have public read access enabled.

---

### **Option 2: Presigned Download URL (Private Bucket - Recommended)**

For secure, time-limited file access:

**Endpoint:** `POST /api/s3/presigned-download`

**Request:**

```json
{
  "fileKey": "resumes/abc-123.pdf",
  "expiresIn": 3600
}
```

**Request Parameters:**

| Field       | Type   | Required | Description                                    |
| ----------- | ------ | -------- | ---------------------------------------------- |
| `fileKey`   | string | ✅       | S3 object key (from database)                  |
| `expiresIn` | number | ❌       | URL expiry in seconds (default: 3600 = 1 hour) |

**Response:**

```json
{
  "downloadUrl": "https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/resumes/abc-123.pdf?X-Amz-Signature=...",
  "expiresIn": 3600
}
```

**Response Fields:**

| Field         | Type   | Description                                   |
| ------------- | ------ | --------------------------------------------- |
| `downloadUrl` | string | Time-limited URL for viewing/downloading file |
| `expiresIn`   | number | URL expiry time in seconds                    |

**cURL Example:**

```bash
curl -X POST http://localhost:3000/api/s3/presigned-download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "resumes/abc-123.pdf",
    "expiresIn": 3600
  }'
```

**Frontend Integration:**

```typescript
// Generate download URL when user clicks "View Resume"
async function viewResume(fileKey: string) {
  const response = await fetch('/api/s3/presigned-download', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileKey, expiresIn: 3600 }),
  });

  const { downloadUrl } = await response.json();
  window.open(downloadUrl, '_blank');
}
```

✅ **Benefits:**

- Secure: Only authenticated users can generate URLs
- Time-limited: URLs expire after set period
- Audit trail: Backend logs all access requests
- No bucket changes needed

---

## 🗑️ Delete Flow

### **Endpoint:** `DELETE /api/s3/file`

**When to use:**

- User updates resume → delete old file
- User removes avatar → clean up storage
- Admin deletes inappropriate content

**Request:**

```json
{
  "fileKey": "resumes/abc-123.pdf"
}
```

**Request Parameters:**

| Field     | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| `fileKey` | string | ✅       | S3 object key (from upload response) |

**Response:**

```json
{
  "success": true,
  "message": "File \"resumes/abc-123.pdf\" deleted successfully"
}
```

**cURL Example:**

```bash
curl -X DELETE http://localhost:3000/api/s3/file \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileKey":"resumes/abc-123.pdf"}'
```

---

## 💼 Use Cases

### **1. Candidate Upload Resume**

**Flow:**

```
1. Candidate clicks "Upload Resume"
2. Frontend: Request presigned upload URL
3. Frontend: Upload file directly to S3
4. Frontend: Save resumeFileKey to database
5. Employer: View candidate profile → request presigned download URL
6. Backend: Generate time-limited download URL for secure access
```

**Frontend Code:**

```typescript
// Step 1: Get presigned upload URL
const response = await fetch('/api/s3/presigned-upload', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileName: file.name,
    fileType: file.type,
    folder: 'resumes',
  }),
});

const { uploadUrl, fileKey } = await response.json();

// Step 2: Upload to S3 directly
await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file,
});

// Step 3: Save ONLY fileKey to database
await fetch('/api/candidate/me', {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    resumeFileKey: fileKey, // Store only fileKey, NOT URL
  }),
});

// Step 4: Later, when employer views resume
const downloadResponse = await fetch('/api/s3/presigned-download', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ fileKey: candidate.resumeFileKey }),
});

const { downloadUrl } = await downloadResponse.json();
window.open(downloadUrl, '_blank'); // User can view/download resume
```

---

### **2. User Update Avatar**

**Flow:**

```
1. User uploads new avatar
2. If old avatar exists:
   → Delete old file from S3
3. Upload new avatar
4. Update User.avatarFileKey in DB (not the URL!)
5. Generate presigned download URL when displaying avatar
```

**Frontend Code:**

```typescript
// Delete old avatar if exists
if (user.avatarFileKey) {
  await fetch('/api/s3/file', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fileKey: user.avatarFileKey }),
  });
}

// Upload new avatar (same as resume flow)
const { uploadUrl, fileKey } = await getPresignedUrl(file, 'avatars');
await uploadToS3(uploadUrl, file);

// Update DB - store ONLY fileKey
await fetch('/api/user/me', {
  method: 'PATCH',
  body: JSON.stringify({
    avatarFileKey: fileKey, // Store fileKey only
  }),
});

// LATER: When displaying avatar, generate presigned download URL
const { downloadUrl } = await fetch('/api/s3/presigned-download', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ fileKey: user.avatarFileKey }),
});
<img src={downloadUrl} alt="User Avatar" />;
```

---

### **3. Employer Upload Company Logo**

**Flow:**

```
1. Employer sets up profile
2. Upload company logo
3. Generate presigned download URL when displaying logo
4. Logo displays on job listings with time-limited access
```

**Frontend Code:**

```typescript
// Get presigned upload URL
const { uploadUrl, fileKey } = await getPresignedUrl(file, 'logos');
await uploadToS3(uploadUrl, file);

// Save only fileKey to database
await fetch('/api/employer/me', {
  method: 'PATCH',
  body: JSON.stringify({
    logoFileKey: fileKey, // Store fileKey only, NOT URL
  }),
});

// When displaying logo on job listings
const { downloadUrl } = await fetch('/api/s3/presigned-download', {
  method: 'POST',
  body: JSON.stringify({ fileKey: employer.logoFileKey }),
});
<img src={downloadUrl} alt="Company Logo" />;
```

---

## ❌ Error Handling

### **400 Bad Request**

**Cause:** Invalid file type

```json
{
  "statusCode": 400,
  "message": "File type \"image/gif\" is not allowed for folder \"resumes\". Only the following types are allowed: application/pdf, ..."
}
```

**Solution:** Check file type before upload

```typescript
const ALLOWED_TYPES = {
  resumes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  avatars: ['image/jpeg', 'image/png', 'image/webp'],
  logos: ['image/jpeg', 'image/png', 'image/svg+xml'],
};

if (!ALLOWED_TYPES[folder].includes(file.type)) {
  alert('Invalid file type!');
  return;
}
```

---

### **401 Unauthorized**

**Cause:** Missing or invalid token

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Solution:** Ensure user is logged in and token is valid

---

### **403 Forbidden (S3)**

**Cause:**

- URL expired (> 5 minutes)
- Content-Type mismatch

**Solution:** Request new presigned URL

---

### **404 Not Found**

**Cause:** Trying to delete non-existent file

```json
{
  "statusCode": 404,
  "message": "Failed to delete file \"resumes/abc.pdf\""
}
```

**Solution:** Verify fileKey exists before deletion

---

## 🚀 Integration Guide

### **Database Schema**

Add these columns to your Prisma schema:

```prisma
model User {
  id            String   @id
  avatarUrl     String?  // Public S3 URL
  avatarFileKey String?  // For deletion
}

model Candidate {
  id             String   @id
  resumeUrl      String?
  resumeFileKey  String?
}

model Employer {
  id           String   @id
  logoUrl      String?
  logoFileKey  String?
}
```

**Migration:**

```bash
cd apps/backend
pnpm exec prisma migrate dev --name add_file_urls
```

---

### **Frontend Upload Component**

```typescript
interface UploadComponentProps {
  folder: 'resumes' | 'avatars' | 'logos';
  onSuccess: (publicUrl: string, fileKey: string) => void;
}

export function FileUpload({ folder, onSuccess }: UploadComponentProps) {
  const handleUpload = async (file: File) => {
    // 1. Get presigned URL
    const res = await fetch('/api/s3/presigned-upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        folder,
      }),
    });

    const { uploadUrl, publicUrl, fileKey } = await res.json();

    // 2. Upload to S3
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    // 3. Callback with URLs
    onSuccess(publicUrl, fileKey);
  };

  return (
    <input
      type="file"
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
    />
  );
}
```

---

### **Display Files**

```typescript
// Avatar
<img src={user.avatarUrl || '/default-avatar.png'} alt="Avatar" />

// Resume
<a href={candidate.resumeUrl} target="_blank">
  📄 Download Resume
</a>

// Logo
<img src={employer.logoUrl || '/default-logo.png'} alt="Company Logo" />
```

---

## 📊 File Type Reference

### **MIME Types:**

| File Extension  | MIME Type                                                                 | Folder         |
| --------------- | ------------------------------------------------------------------------- | -------------- |
| `.pdf`          | `application/pdf`                                                         | resumes        |
| `.doc`          | `application/msword`                                                      | resumes        |
| `.docx`         | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | resumes        |
| `.jpg`, `.jpeg` | `image/jpeg`                                                              | avatars, logos |
| `.png`          | `image/png`                                                               | avatars, logos |
| `.webp`         | `image/webp`                                                              | avatars        |
| `.svg`          | `image/svg+xml`                                                           | logos          |

---

## 🔒 Security Best Practices

1. **Validate file size on frontend** (recommend max 10MB)
2. **Check file type before upload** (don't trust extensions)
3. **Use HTTPS** in production
4. **Scan uploaded files** for viruses (optional)
5. **Set S3 lifecycle policies** to auto-delete old files
6. **Monitor S3 storage costs**

---

## 🧪 Testing

### **Manual Test:**

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}' \
  | jq -r '.token')

# 2. Get presigned URL
RESPONSE=$(curl -s -X POST http://localhost:3000/api/s3/presigned-upload \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.pdf","fileType":"application/pdf"}')

UPLOAD_URL=$(echo $RESPONSE | jq -r '.uploadUrl')
FILE_KEY=$(echo $RESPONSE | jq -r '.fileKey')

# 3. Upload file
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: application/pdf" \
  --data-binary "@test.pdf"

# 4. Delete file
curl -X DELETE http://localhost:3000/api/s3/file \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"fileKey\":\"$FILE_KEY\"}"
```

---

## 🧪 Testing Guide

### **Quick Start - Test All APIs**

Follow these steps to test all 3 endpoints in sequence.

---

### **Setup: Get Authentication Token**

First, you need a valid token. In Postman or via cURL:

```bash
# 1. Sign up / Login to get token
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@jobly.ai",
    "password": "password123"
  }'

# Response:
# {
#   "user": { "id": "...", "email": "test@jobly.ai" },
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }
```

**Save the `token` for next steps.** Replace `YOUR_TOKEN` below with actual token.

---

### **Test 1️⃣ - GET PRESIGNED UPLOAD URL**

**Purpose:** Get a time-limited URL to upload a file to S3.

**cURL:**

```bash
curl -X POST http://localhost:3000/api/s3/presigned-upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "my-resume.pdf",
    "fileType": "application/pdf",
    "folder": "resumes"
  }'
```

**Expected Response:**

```json
{
  "uploadUrl": "https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/resumes/abc-123-uuid.pdf?X-Amz-Signature=...",
  "fileKey": "resumes/abc-123-uuid.pdf",
  "fileUrl": "https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/resumes/abc-123-uuid.pdf",
  "expiresIn": 300
}
```

**✅ Success Indicators:**

- Response has `uploadUrl`, `fileKey`, `fileUrl`
- `expiresIn` is 300 (5 minutes)
- `uploadUrl` contains query parameters with signature

**⚠️ Common Errors:**

| Error                                   | Cause                            | Solution                          |
| --------------------------------------- | -------------------------------- | --------------------------------- |
| `401 Unauthorized`                      | Missing token                    | Add correct Bearer token          |
| `400 File type not allowed`             | Wrong MIME type                  | Check MIME type matches folder    |
| `400 File type not allowed for resumes` | Uploaded image to resumes folder | Use `application/pdf` for resumes |

**Save `uploadUrl` and `fileKey` for next steps!**

---

### **Test 2️⃣ - UPLOAD FILE TO S3**

**Purpose:** Upload actual file using the `uploadUrl` from Test 1.

**Create test file first:**

```bash
# On Windows (PowerShell):
Set-Content -Path "test-resume.pdf" -Value "test content"

# Or on Mac/Linux:
echo "test content" > test-resume.pdf
```

**Upload with cURL:**

```bash
curl -X PUT "UPLOAD_URL_FROM_TEST_1" \
  -H "Content-Type: application/pdf" \
  --data-binary "@test-resume.pdf"
```

**Expected Response:**

```
(empty body with 200 OK status)
```

**✅ Success Indicators:**

- HTTP Status: `200 OK`
- No error message
- Response body is empty

**⚠️ Common Errors:**

| Error                       | Cause                             | Solution                        |
| --------------------------- | --------------------------------- | ------------------------------- |
| `403 Forbidden`             | URL expired (> 5 minutes)         | Get new uploadUrl from Test 1   |
| `400 Content-Type mismatch` | Header Content-Type doesn't match | Use same MIME type as requested |

---

### **Test 3️⃣ - GET PRESIGNED DOWNLOAD URL**

**Purpose:** Get time-limited URL to download the file you just uploaded.

**cURL:**

```bash
curl -X POST http://localhost:3000/api/s3/presigned-download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "FILE_KEY_FROM_TEST_1",
    "expiresIn": 3600
  }'
```

**Example with real data:**

```bash
curl -X POST http://localhost:3000/api/s3/presigned-download \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "resumes/abc-123-uuid.pdf",
    "expiresIn": 3600
  }'
```

**Expected Response:**

```json
{
  "downloadUrl": "https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/resumes/abc-123-uuid.pdf?X-Amz-Signature=...",
  "expiresIn": 3600
}
```

**✅ Success Indicators:**

- Response has `downloadUrl` and `expiresIn`
- URL is different from `uploadUrl` (uses GET instead of PUT)
- Can open URL in browser to view/download file

**Test download (paste URL in browser):**

```
Open in browser: https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/resumes/abc-123-uuid.pdf?X-Amz-Signature=...
→ Should download or display the file
```

---

### **Test 4️⃣ - DELETE FILE**

**Purpose:** Delete the file you uploaded.

**cURL:**

```bash
curl -X DELETE http://localhost:3000/api/s3/file \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "FILE_KEY_FROM_TEST_1"
  }'
```

**Example with real data:**

```bash
curl -X DELETE http://localhost:3000/api/s3/file \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "resumes/abc-123-uuid.pdf"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "File \"resumes/abc-123-uuid.pdf\" deleted successfully"
}
```

**✅ Success Indicators:**

- `success` is `true`
- Message contains filename
- HTTP Status: `200 OK`

**Verify deletion:**

Try to download the file again using `downloadUrl` from Test 3:

- Should get `403 Forbidden` or `404 Not Found` error
- Confirms file was actually deleted from S3

---

## 🔄 Complete Workflow Test (Step-by-Step)

Here's a complete PowerShell script testing all 4 steps:

```powershell
# Save your token
$TOKEN = "your-jwt-token-here"
$BASE_URL = "http://localhost:3000/api"

# Step 1: Get presigned upload URL
Write-Host "[1/4] Getting presigned upload URL..." -ForegroundColor Green
$uploadResponse = Invoke-WebRequest -Uri "$BASE_URL/s3/presigned-upload" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
  } `
  -Body @{
    fileName = "test-resume.pdf"
    fileType = "application/pdf"
    folder = "resumes"
  } | ConvertTo-Json

$uploadJson = $uploadResponse | ConvertFrom-Json
$UPLOAD_URL = $uploadJson.uploadUrl
$FILE_KEY = $uploadJson.fileKey

Write-Host "uploadUrl: $UPLOAD_URL"
Write-Host "fileKey: $FILE_KEY"

# Step 2: Create and upload test file
Write-Host "`n[2/4] Uploading file to S3..." -ForegroundColor Green
"test resume content" | Set-Content -Path "test-resume.pdf"

$fileContent = [System.IO.File]::ReadAllBytes("test-resume.pdf")
Invoke-WebRequest -Uri $UPLOAD_URL `
  -Method PUT `
  -Headers @{"Content-Type" = "application/pdf"} `
  -Body $fileContent -OutVariable response

Write-Host "✅ File uploaded! (HTTP Status: $($response.StatusCode))"

# Step 3: Get presigned download URL
Write-Host "`n[3/4] Getting presigned download URL..." -ForegroundColor Green
$downloadResponse = Invoke-WebRequest -Uri "$BASE_URL/s3/presigned-download" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
  } `
  -Body @{
    fileKey = $FILE_KEY
    expiresIn = 3600
  } | ConvertFrom-Json

$DOWNLOAD_URL = $downloadResponse.downloadUrl
Write-Host "downloadUrl: $DOWNLOAD_URL"

# Step 4: Delete file
Write-Host "`n[4/4] Deleting file..." -ForegroundColor Green
$deleteResponse = Invoke-WebRequest -Uri "$BASE_URL/s3/file" `
  -Method DELETE `
  -Headers @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
  } `
  -Body @{
    fileKey = $FILE_KEY
  } | ConvertFrom-Json

Write-Host "✅ Complete workflow test finished!" -ForegroundColor Green
Write-Host "Response: $($deleteResponse | ConvertTo-Json)"

# Cleanup
Remove-Item "test-resume.pdf"
```

---

## 🛠️ Using Postman

### **Manual Setup:**

1. Create new request for each endpoint
2. Set `Authorization` header: `Bearer YOUR_TOKEN`
3. Set `Content-Type` header: `application/json`
4. Copy values between requests:
   - From Test 1: Use `uploadUrl` in Test 2
   - From Test 1: Use `fileKey` in Test 3 & 4
   - From Test 3: Use `downloadUrl` to test download

### **Quick Postman Workflow:**

1. **Test 1**: GET PRESIGNED UPLOAD URL

   - Method: POST
   - URL: `http://localhost:3000/api/s3/presigned-upload`
   - Body: `{"fileName":"resume.pdf","fileType":"application/pdf","folder":"resumes"}`

2. **Test 2**: UPLOAD FILE

   - Method: PUT
   - URL: (paste `uploadUrl` from Test 1 response)
   - Body: Select "File" tab, choose test file
   - Header: `Content-Type: application/pdf`

3. **Test 3**: GET PRESIGNED DOWNLOAD URL

   - Method: POST
   - URL: `http://localhost:3000/api/s3/presigned-download`
   - Body: `{"fileKey":"FILE_KEY_FROM_TEST_1","expiresIn":3600}`

4. **Test 4**: DELETE FILE
   - Method: DELETE
   - URL: `http://localhost:3000/api/s3/file`
   - Body: `{"fileKey":"FILE_KEY_FROM_TEST_1"}`

---
