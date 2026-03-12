# 📚 S3 API Documentation

Complete guide for S3 file management in JoblyAI.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Authentication](#authentication)
4. [Upload Flow](#upload-flow)
5. [Delete Flow](#delete-flow)
6. [Use Cases](#use-cases)
7. [Error Handling](#error-handling)
8. [Integration Guide](#integration-guide)

---

## 🎯 Overview

JoblyAI uses **AWS S3** for file storage with **presigned URLs** for direct client-to-S3 uploads.

### **Benefits:**
- ✅ Fast uploads (direct to S3, not through backend)
- ✅ Secure (time-limited URLs, authenticated endpoints)
- ✅ Scalable (handles thousands of concurrent uploads)
- ✅ Cost-effective (reduces backend bandwidth)

### **Supported Files:**

| Folder | File Types | Use Case |
|--------|-----------|----------|
| `resumes` | PDF, DOC, DOCX | Candidate resumes |
| `avatars` | JPG, PNG, WEBP | User profile pictures |
| `logos` | JPG, PNG, SVG | Company logos |

---

## 🔌 API Endpoints

### **Base URL:** `http://localhost:3000/api`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/s3/presigned-upload` | Get presigned URL for upload | ✅ Required |
| DELETE | `/s3/file` | Delete file from S3 | ✅ Required |

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
    Backend->>Frontend: { uploadUrl, fileKey, publicUrl }
    Frontend->>S3: PUT file (direct upload)
    S3->>Frontend: 200 OK
    Frontend->>Backend: Save publicUrl to DB
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

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fileName` | string | ✅ | Original filename (e.g., "John_Resume.pdf") |
| `fileType` | string | ✅ | MIME type (e.g., "application/pdf") |
| `folder` | string | ❌ | Target folder: `resumes` \| `avatars` \| `logos` (default: `resumes`) |

**Response:**

```json
{
  "uploadUrl": "https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/resumes/abc-123.pdf?X-Amz-Signature=...",
  "fileKey": "resumes/abc-123.pdf",
  "publicUrl": "https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/resumes/abc-123.pdf",
  "expiresIn": 300
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `uploadUrl` | string | Time-limited URL for uploading (expires in 5 minutes) |
| `fileKey` | string | S3 object key (save this for deletion) |
| `publicUrl` | string | Public URL to access the file (save to DB) |
| `expiresIn` | number | Expiry time in seconds |

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

After successful upload, save `publicUrl` and `fileKey` to your database:

```typescript
// Example: Update candidate profile
PATCH /api/candidate/me
{
  "resumeUrl": "https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/resumes/abc-123.pdf",
  "resumeFileKey": "resumes/abc-123.pdf"
}
```

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

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fileKey` | string | ✅ | S3 object key (from upload response) |

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
2. Frontend: Request presigned URL
3. Frontend: Upload file to S3
4. Frontend: Call PATCH /api/candidate/me with resumeUrl
5. Backend: Save resumeUrl to database
6. Employer: View candidate profile → see resume link
```

**Frontend Code:**

```typescript
// Step 1: Get presigned URL
const response = await fetch('/api/s3/presigned-upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileName: file.name,
    fileType: file.type,
    folder: 'resumes'
  })
});

const { uploadUrl, publicUrl, fileKey } = await response.json();

// Step 2: Upload to S3
await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file
});

// Step 3: Save to DB
await fetch('/api/candidate/me', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resumeUrl: publicUrl,
    resumeFileKey: fileKey
  })
});
```

---

### **2. User Update Avatar**

**Flow:**
```
1. User uploads new avatar
2. If old avatar exists:
   → Delete old file from S3
3. Upload new avatar
4. Update User.avatarUrl in DB
```

**Frontend Code:**

```typescript
// Delete old avatar if exists
if (user.avatarFileKey) {
  await fetch('/api/s3/file', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fileKey: user.avatarFileKey })
  });
}

// Upload new avatar (same as resume flow)
const { uploadUrl, publicUrl, fileKey } = await getPresignedUrl(file, 'avatars');
await uploadToS3(uploadUrl, file);

// Update DB
await fetch('/api/user/me', {
  method: 'PATCH',
  body: JSON.stringify({
    avatarUrl: publicUrl,
    avatarFileKey: fileKey
  })
});
```

---

### **3. Employer Upload Company Logo**

**Flow:**
```
1. Employer sets up profile
2. Upload company logo
3. Logo displays on all job listings
```

**Frontend Code:**

```typescript
const { uploadUrl, publicUrl, fileKey } = await getPresignedUrl(file, 'logos');
await uploadToS3(uploadUrl, file);

await fetch('/api/employer/me', {
  method: 'PATCH',
  body: JSON.stringify({
    logoUrl: publicUrl,
    logoFileKey: fileKey
  })
});
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
  resumes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  avatars: ['image/jpeg', 'image/png', 'image/webp'],
  logos: ['image/jpeg', 'image/png', 'image/svg+xml']
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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        folder
      })
    });
    
    const { uploadUrl, publicUrl, fileKey } = await res.json();
    
    // 2. Upload to S3
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file
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

| File Extension | MIME Type | Folder |
|----------------|-----------|--------|
| `.pdf` | `application/pdf` | resumes |
| `.doc` | `application/msword` | resumes |
| `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | resumes |
| `.jpg`, `.jpeg` | `image/jpeg` | avatars, logos |
| `.png` | `image/png` | avatars, logos |
| `.webp` | `image/webp` | avatars |
| `.svg` | `image/svg+xml` | logos |

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