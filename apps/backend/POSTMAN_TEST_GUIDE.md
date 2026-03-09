# 🚀 Postman Test Guide - Applications API (Candidate Side)

## 📋 Chuẩn bị

### 1. Start Backend & Database
```bash
# Terminal 1: Start Docker services
docker compose up postgres redis -d

# Terminal 2: Start backend
pnpm --filter @jobly/backend run start:dev
```

### 2. Seed Database
```bash
pnpm --filter @jobly/backend exec prisma db seed
```

### 3. Mở Postman
- Download Postman: https://www.postman.com/downloads/
- Hoặc dùng Web version: https://web.postman.com/

---

## 🔧 Setup Postman

### Tạo Environment Variables

1. Click **Environments** (bên trái)
2. Click **+** để tạo environment mới
3. Đặt tên: `JoblyAI Local`
4. Thêm variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `baseUrl` | `http://localhost:3000/api` | `http://localhost:3000/api` |
| `accessToken` | (để trống) | (để trống) |

5. Click **Save**
6. Chọn environment `JoblyAI Local` ở góc trên bên phải

---

## 🧪 Test Cases với Postman

### ✅ Test 1: Đăng nhập Candidate (Alice)

**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/auth/sign-in/email`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "email": "alice@example.com",
    "password": "password123"
  }
  ```

**Click Send**

**Response mẫu:**
```json
{
  "user": {
    "id": "clxxxx...",
    "email": "alice@example.com",
    "name": "Alice Johnson",
    "role": "candidate"
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-03-03T..."
  }
}
```

**LƯU TOKEN:**
1. Copy giá trị `session.token` từ response
2. Vào **Environment** `JoblyAI Local`
3. Paste vào `accessToken` → **Current value**
4. Click **Save**

---

### ✅ Test 2: Apply to Job thành công

**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/applications`
- Headers:
  ```
  Content-Type: application/json
  Authorization: Bearer {{accessToken}}
  ```
- Body (raw JSON):
  ```json
  {
    "jobId": 2,
    "resumeId": 1
  }
  ```

**Click Send**

**Expected Response (201 Created):**
```json
{
  "id": 6,
  "jobId": 2,
  "candidateId": "clxxxx...",
  "resumeId": 1,
  "matchPercentage": null,
  "aiFeedback": null,
  "status": "APPLIED",
  "createdAt": "2026-02-24T...",
  "updatedAt": "2026-02-24T...",
  "job": {
    "id": 2,
    "title": "Data Scientist",
    "description": "Join our data science team...",
    "location": "New York, NY",
    "salaryMin": "110000",
    "salaryMax": "160000",
    "currency": "USD",
    "status": "OPEN",
    "remote": false,
    "type": "FULL_TIME",
    "companyName": "DataFlow Inc",
    "category": {
      "id": 2,
      "name": "Data Science",
      "slug": "data-science"
    }
  },
  "resume": {
    "id": 1,
    "candidateId": "clxxxx...",
    "fileUrl": "https://example.com/resumes/alice-senior-dev.pdf",
    "parsedText": "Alice Johnson - Senior Full Stack Developer...",
    "aiScore": 0.92,
    "isDefault": true,
    "createdAt": "2026-02-24T...",
    "updatedAt": "2026-02-24T..."
  }
}
```

✅ **SUCCESS!** Application created

---

### ❌ Test 3: Apply duplicate (Error 400)

**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/applications`
- Headers: Same as above
- Body:
  ```json
  {
    "jobId": 1,
    "resumeId": 1
  }
  ```
  
**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Already applied to this job"
}
```

---

### ❌ Test 4: Job không tồn tại (Error 404)

**Request:**
- Body:
  ```json
  {
    "jobId": 999,
    "resumeId": 1
  }
  ```
  
**Expected Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Job not found"
}
```

---

### ❌ Test 5: Job DRAFT - không OPEN (Error 400)

**Request:**
- Body:
  ```json
  {
    "jobId": 7,
    "resumeId": 1
  }
  ```
  
**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Job is not open for applications"
}
```

---

### ❌ Test 6: Resume không tồn tại (Error 404)

**Request:**
- Body:
  ```json
  {
    "jobId": 2,
    "resumeId": 999
  }
  ```
  
**Expected Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Resume not found"
}
```

---

### ❌ Test 7: Resume không thuộc về candidate (Error 403)

**Request:**
- Body:
  ```json
  {
    "jobId": 2,
    "resumeId": 3
  }
  ```
  *(resumeId: 3 là của Bob, không phải Alice)*
  
**Expected Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Resume does not belong to you"
}
```

---

### ❌ Test 8: Employer không được apply

**Step 1: Đăng nhập Employer (Carol)**
- Method: `POST`
- URL: `{{baseUrl}}/auth/sign-in/email`
- Body:
  ```json
  {
    "email": "carol@example.com",
    "password": "password123"
  }
  ```

**LƯU TOKEN MỚI** vào `accessToken`

**Step 2: Carol cố apply**
- Method: `POST`
- URL: `{{baseUrl}}/applications`
- Body:
  ```json
  {
    "jobId": 2,
    "resumeId": 1
  }
  ```

**Expected Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```
*(Bị chặn bởi RoleGuard - chỉ candidate được phép)*

---

### ✅ Test 9: Get My Applications (List)

**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/applications`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```

**Click Send**

**Expected Response (200 OK):**
```json
{
  "applications": [
    {
      "id": 1,
      "jobId": 1,
      "candidateId": "clxxxx...",
      "resumeId": 1,
      "status": "APPLIED",
      "matchPercentage": 0.92,
      "aiFeedback": {
        "summary": "Excellent match!",
        "strengths": ["TypeScript expertise", "React experience"],
        "gaps": []
      },
      "createdAt": "2026-02-24T...",
      "updatedAt": "2026-02-24T...",
      "job": {
        "id": 1,
        "title": "Senior Full Stack Engineer",
        "description": "We are looking for...",
        "companyName": "Tech Corp",
        "location": "San Francisco, CA",
        "salaryMin": 120000,
        "salaryMax": 180000,
        "currency": "USD",
        "remote": true,
        "type": "FULL_TIME",
        "status": "OPEN",
        "category": {
          "id": 1,
          "name": "Software Development",
          "slug": "software-development"
        },
        "postedBy": {
          "id": "clyyy...",
          "name": "Carol White",
          "email": "carol@example.com"
        }
      },
      "resume": {
        "id": 1,
        "fileUrl": "https://example.com/resumes/alice-senior-dev.pdf",
        "aiScore": 0.92,
        "isDefault": true
      }
    },
    {
      "id": 2,
      "jobId": 3,
      "candidateId": "clxxxx...",
      "resumeId": 2,
      "status": "INTERVIEW",
      "matchPercentage": 0.78,
      "aiFeedback": {
        "summary": "Good match with some DevOps experience.",
        "strengths": ["Docker knowledge"],
        "gaps": ["Limited Kubernetes experience"]
      },
      "createdAt": "2026-02-23T...",
      "updatedAt": "2026-02-23T...",
      "job": {
        "id": 3,
        "title": "DevOps Engineer",
        "companyName": "CloudStack",
        "location": "Remote",
        "remote": true,
        "type": "FULL_TIME",
        "status": "OPEN",
        "category": {
          "id": 3,
          "name": "DevOps",
          "slug": "devops"
        },
        "postedBy": {
          "id": "clzzz...",
          "name": "Frank Miller",
          "email": "frank@example.com"
        }
      },
      "resume": {
        "id": 2,
        "fileUrl": "https://example.com/resumes/alice-fullstack.pdf",
        "aiScore": 0.88,
        "isDefault": false
      }
    }
  ],
  "total": 2,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

✅ **SUCCESS!** Applications list returned

---

### ✅ Test 10: Filter by Status

**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/applications?status=APPLIED`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```

**Expected Response:** Chỉ trả về applications có status = APPLIED

---

### ✅ Test 11: Pagination

**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/applications?page=1&pageSize=1`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```

**Expected Response:**
```json
{
  "applications": [
    // Only 1 application
  ],
  "total": 2,
  "page": 1,
  "pageSize": 1,
  "totalPages": 2
}
```

---

### ✅ Test 12: Get Application Detail by ID

**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/applications/1`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```

**Click Send**

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "jobId": 1,
  "candidateId": "clxxxx...",
  "resumeId": 1,
  "status": "APPLIED",
  "matchPercentage": 0.92,
  "aiFeedback": {
    "summary": "Excellent match!",
    "strengths": ["TypeScript expertise", "React experience"],
    "gaps": []
  },
  "createdAt": "2026-02-24T...",
  "updatedAt": "2026-02-24T...",
  "job": {
    "id": 1,
    "title": "Senior Full Stack Engineer",
    "description": "We are looking for...",
    "companyName": "Tech Corp",
    "location": "San Francisco, CA",
    "salaryMin": 120000,
    "salaryMax": 180000,
    "currency": "USD",
    "remote": true,
    "type": "FULL_TIME",
    "status": "OPEN",
    "category": {
      "id": 1,
      "name": "Software Development",
      "slug": "software-development"
    },
    "postedBy": {
      "id": "clyyy...",
      "name": "Carol White",
      "email": "carol@example.com"
    }
  },
  "resume": {
    "id": 1,
    "fileUrl": "https://example.com/resumes/alice-senior-dev.pdf",
    "aiScore": 0.92,
    "isDefault": true
  }
}
```

✅ **SUCCESS!** Application detail returned with full job and resume information

---

### ❌ Test 13: Cannot View Other Candidate's Application

**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/applications/3`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```
  (Alice's token trying to view Bob's application #3)

**Expected Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "This application does not belong to you"
}
```

---

### ❌ Test 14: Application Not Found

**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/applications/999`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```

**Expected Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Application not found"
}
```

---

### ✅ Test 15: Withdraw Application

**Request:**
- Method: `PATCH`
- URL: `{{baseUrl}}/applications/1`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```

**Click Send**

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "jobId": 1,
  "candidateId": "clxxxx...",
  "resumeId": 1,
  "status": "WITHDRAWN",
  "matchPercentage": 0.92,
  "aiFeedback": {
    "summary": "Excellent match!",
    "strengths": ["TypeScript expertise", "React experience"],
    "gaps": []
  },
  "createdAt": "2026-02-24T...",
  "updatedAt": "2026-03-09T...",
  "job": { ... },
  "resume": { ... }
}
```

✅ **SUCCESS!** Application status changed from APPLIED → WITHDRAWN

**Note:** Chỉ applications với status = APPLIED mới có thể withdraw.

---

### ✅ Test 16: Re-apply After Withdraw

**Setup:** Sau Test 15, application #1 đã WITHDRAWN

**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/applications`
- Headers:
  ```
  Content-Type: application/json
  Authorization: Bearer {{accessToken}}
  ```
- Body (raw JSON):
  ```json
  {
    "jobId": 1,
    "resumeId": 1
  }
  ```

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "jobId": 1,
  "candidateId": "clxxxx...",
  "resumeId": 1,
  "status": "APPLIED",
  "matchPercentage": null,
  "aiFeedback": null,
  "createdAt": "2026-02-24T...",
  "updatedAt": "2026-03-09T...",
  "job": { ... },
  "resume": { ... }
}
```

✅ **SUCCESS!** Re-applied by updating WITHDRAWN record back to APPLIED

**Note:** 
- Backend **UPDATE** record cũ thay vì tạo mới
- `matchPercentage` và `aiFeedback` được reset về null
- Chỉ status WITHDRAWN mới được phép apply lại
- Status REJECTED không được apply lại

---

### ❌ Test 17: Cannot Withdraw if Status Not APPLIED

**Setup:** Với application #2 đang có status = INTERVIEW (từ seed data)

**Request:**
- Method: `PATCH`
- URL: `{{baseUrl}}/applications/2`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```

**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Only applications with APPLIED status can be withdrawn"
}
```

**Note:** Candidate chỉ có thể withdraw khi status = APPLIED. Nếu đã chuyển sang INTERVIEW, OFFER, REJECTED thì không thể withdraw.

---

### ❌ Test 18: Cannot Withdraw Other's Application

**Request:**
- Method: `PATCH`
- URL: `{{baseUrl}}/applications/3`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```
  (Alice's token trying to withdraw Bob's application)

**Expected Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "This application does not belong to you"
}
```

---

## 🏢 Employer Side - Application Management

### ✅ Test 19: Login as Employer (Carol)

**Setup:** Đăng xuất Alice, đăng nhập Carol

**Request:**
- Method: `POST`
- URL: `{{baseUrl}}/auth/sign-in/email`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "email": "carol@example.com",
    "password": "password123"
  }
  ```

**LƯU TOKEN MỚI** vào `accessToken`

---

### ✅ Test 20: Get Applications for My Jobs

**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/employers/applications`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```

**Expected Response (200 OK):**
```json
{
  "applications": [
    {
      "id": 1,
      "jobId": 1,
      "candidateId": "clxxxx...",
      "resumeId": 1,
      "status": "APPLIED",
      "matchPercentage": 0.92,
      "aiFeedback": {
        "summary": "Excellent match!",
        "strengths": ["TypeScript expertise", "React experience"],
        "gaps": []
      },
      "createdAt": "2026-02-24T...",
      "updatedAt": "2026-02-24T...",
      "job": {
        "id": 1,
        "title": "Senior Full Stack Engineer",
        "companyName": "Tech Corp",
        "location": "San Francisco, CA",
        "category": {
          "id": 1,
          "name": "Software Development"
        },
        "postedBy": {
          "id": "clyyy...",
          "name": "Carol White",
          "email": "carol@example.com"
        }
      },
      "resume": {
        "id": 1,
        "fileUrl": "https://example.com/resumes/alice-senior-dev.pdf",
        "aiScore": 0.92,
        "isDefault": true
      }
    }
  ],
  "total": 2,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

✅ **SUCCESS!** Carol sees applications for Job #1 (Senior Full Stack Engineer) which she posted

---

### ✅ Test 21: Filter by Specific Job

**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/employers/applications?jobId=1`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```

**Expected Response:** Only applications for Job #1

---

### ✅ Test 22: Filter by Status

**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/employers/applications?status=APPLIED`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```

**Expected Response:** Only applications with APPLIED status for Carol's jobs

---

### ✅ Test 23: Shortlist Application (Move to INTERVIEW)

**Request:**
- Method: `PATCH`
- URL: `{{baseUrl}}/employers/applications/1/shortlist`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "jobId": 1,
  "candidateId": "clxxxx...",
  "resumeId": 1,
  "status": "INTERVIEW",
  "matchPercentage": 0.92,
  "aiFeedback": { ... },
  "createdAt": "2026-02-24T...",
  "updatedAt": "2026-03-09T...",
  "job": { ... },
  "resume": { ... }
}
```

✅ **SUCCESS!** Status changed from APPLIED → INTERVIEW

**Note:** After shortlist, candidate CANNOT withdraw this application anymore.

---

### ✅ Test 24: Reject Application with Feedback

**Request:**
- Method: `PATCH`
- URL: `{{baseUrl}}/employers/applications/5/reject`
- Headers:
  ```
  Content-Type: application/json
  Authorization: Bearer {{accessToken}}
  ```
- Body (raw JSON):
  ```json
  {
    "feedback": "Thank you for your application. However, we are looking for someone with more DevOps experience. We encourage you to apply for other positions that match your skills better."
  }
  ```

**Expected Response (200 OK):**
```json
{
  "id": 5,
  "jobId": 1,
  "candidateId": "clzzz...",
  "resumeId": 4,
  "status": "REJECTED",
  "matchPercentage": 0.68,
  "aiFeedback": {
    "summary": "Some match",
    "strengths": ["Basic programming skills"],
    "gaps": ["No TypeScript experience"],
    "rejectionFeedback": "Thank you for your application. However, we are looking for someone with more DevOps experience. We encourage you to apply for other positions that match your skills better.",
    "rejectedAt": "2026-03-09T..."
  },
  "createdAt": "2026-02-24T...",
  "updatedAt": "2026-03-09T...",
  "job": { ... },
  "resume": { ... }
}
```

✅ **SUCCESS!** Application rejected with feedback stored in `aiFeedback.rejectionFeedback`

**Note:** 
- Feedback is **required** when rejecting
- Rejected applications CANNOT be re-applied by candidate
- Feedback should be professional and constructive

---

### ❌ Test 25: Cannot Shortlist Non-APPLIED Application

**Setup:** Application #1 đã shortlist ở Test 23, status = INTERVIEW

**Request:**
- Method: `PATCH`
- URL: `{{baseUrl}}/employers/applications/1/shortlist`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```

**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Only applications with APPLIED status can be shortlisted"
}
```

---

### ❌ Test 26: Cannot Reject Without Feedback

**Request:**
- Method: `PATCH`
- URL: `{{baseUrl}}/employers/applications/4/reject`
- Headers:
  ```
  Content-Type: application/json
  Authorization: Bearer {{accessToken}}
  ```
- Body (raw JSON):
  ```json
  {
    "feedback": ""
  }
  ```

**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": ["feedback should not be empty"]
}
```

---

### ❌ Test 27: Cannot Manage Other Employer's Applications

**Setup:** Login David (another employer)
```json
POST {{baseUrl}}/auth/sign-in/email
{
  "email": "david@example.com",
  "password": "password123"
}
```

**LƯU TOKEN MỚI**

**Request:**
- Method: `PATCH`
- URL: `{{baseUrl}}/employers/applications/1/shortlist`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```
  (David's token trying to manage Carol's job application)

**Expected Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "You can only manage applications for your own jobs"
}
```

---

### ❌ Test 28: Candidate Cannot Access Employer Endpoints

**Setup:** Login Alice (candidate)

**Request:**
- Method: `GET`
- URL: `{{baseUrl}}/employers/applications`
- Headers:
  ```
  Authorization: Bearer {{accessToken}}
  ```

**Expected Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

## 📊 Seed Data Reference

### Available Test Data

**Jobs (OPEN):**
- Job #1: Senior Full Stack Engineer (Tech Corp)
- Job #2: Data Scientist (DataFlow Inc)
- Job #3: DevOps Engineer (CloudStack)
- Job #4: UI/UX Designer (Design Studios)
- Job #5: Product Manager (Innovation Labs)
- Job #6: Junior React Developer (StartUp Hub)

**Job #7:** Backend Engineer (DRAFT) ❌ Not open

**Candidates:**
- Alice (alice@example.com) - Resumes: #1, #2
- Bob (bob@example.com) - Resume: #3
- Eve (eve@example.com) - Resume: #4

**Employers:**
- Carol (carol@example.com)
- David (david@example.com)
- Frank (frank@example.com)

---

## 💡 Tips

### 1. Tạo Collection để tái sử dụng

**Tạo Collection:**
1. Click **Collections** → **+** → Đặt tên: `JoblyAI - Applications`
2. Add các requests vào collection
3. Sử dụng **Pre-request Scripts** để auto set token

**Auto set token từ signup response:**
```javascript
// Trong tab "Tests" của signup request
pm.test("Save token", function () {
    var jsonData = pm.response.json();
    pm.environment.set("accessToken", jsonData.session.token);
});
```

### 2. Test tự động với Scripts

**Trong tab "Tests" của create application request:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Application created successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("APPLIED");
    pm.expect(jsonData.jobId).to.be.a('number');
    pm.expect(jsonData.resumeId).to.be.a('number');
});
```

### 3. Import/Export Collection

**Export để share:**
1. Click **...** trên collection
2. **Export** → Save file JSON
3. Share file với team

### 4. Query Parameters cho GET /applications

**Available parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10)
- `status` - Filter by status: APPLIED, INTERVIEW, OFFER, REJECTED, WITHDRAWN

**Examples:**
```
GET {{baseUrl}}/applications
GET {{baseUrl}}/applications?status=APPLIED
GET {{baseUrl}}/applications?page=1&pageSize=5
GET {{baseUrl}}/applications?status=INTERVIEW&page=1&pageSize=10
```

### 5. Query Parameters cho GET /employers/applications

**Available parameters:**
- `jobId` - Filter by specific job ID
- `status` - Filter by status: APPLIED, INTERVIEW, OFFER, REJECTED, WITHDRAWN
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10)

**Examples:**
```
GET {{baseUrl}}/employers/applications
GET {{baseUrl}}/employers/applications?jobId=1
GET {{baseUrl}}/employers/applications?status=APPLIED
GET {{baseUrl}}/employers/applications?jobId=1&status=APPLIED&page=1&pageSize=5
```

---

## 🎯 Xem Database

Sau khi test, xem data trong database:

```bash
# Prisma Studio (GUI)
pnpm --filter @jobly/backend exec prisma studio
```

Hoặc truy cập: http://localhost:5555

---

## ✅ Checklist

### Step 1: POST /applications (Create)
- [ ] Backend đang chạy (http://localhost:3000/api)
- [ ] Database đã seed data
- [ ] Postman environment đã setup
- [ ] Test 1: Login Alice ✅
- [ ] Test 2: Apply to Job #2 ✅
- [ ] Test 3: Apply duplicate → Error 400 ✅
- [ ] Test 4: Job không tồn tại → Error 404 ✅
- [ ] Test 5: Job DRAFT → Error 400 ✅
- [ ] Test 6: Resume không tồn tại → Error 404 ✅
- [ ] Test 7: Resume của người khác → Error 403 ✅
- [ ] Test 8: Employer apply → Error 403 ✅

### Step 2: GET /applications (List)
- [ ] Test 9: Get my applications ✅
- [ ] Test 10: Filter by status ✅
- [ ] Test 11: Pagination ✅

### Step 3: GET /applications/:id (Detail)
- [ ] Test 12: Get application detail by ID ✅
- [ ] Test 13: Cannot view other's application → Error 403 ✅
- [ ] Test 14: Application not found → Error 404 ✅

### Step 4: PATCH /applications/:id (Withdraw)
- [ ] Test 15: Withdraw application ✅
- [ ] Test 16: Re-apply after withdraw ✅
- [ ] Test 17: Cannot withdraw if not APPLIED → Error 400 ✅
- [ ] Test 18: Cannot withdraw other's application → Error 403 ✅

### Step 5: Employer - View Applications
- [ ] Test 19: Login as Employer (Carol) ✅
- [ ] Test 20: Get applications for my jobs ✅
- [ ] Test 21: Filter by specific job ✅
- [ ] Test 22: Filter by status ✅
- [ ] Test 28: Candidate cannot access employer endpoints → Error 403 ✅

### Step 6: Employer - Manage Applications
- [ ] Test 23: Shortlist application (APPLIED → INTERVIEW) ✅
- [ ] Test 24: Reject application with feedback ✅
- [ ] Test 25: Cannot shortlist non-APPLIED application → Error 400 ✅
- [ ] Test 26: Cannot reject without feedback → Error 400 ✅
- [ ] Test 27: Cannot manage other employer's applications → Error 403 ✅

---

## 🚀 Next Steps

Sau khi test thành công:

```bash
git add .
git commit -m "feat(applications): complete candidate and employer application management

Candidate Side:
- POST /applications: Create application with full validations
- GET /applications: List with pagination & status filter
- GET /applications/:id: Get application detail
- PATCH /applications/:id: Withdraw application
- Support re-apply after WITHDRAWN status
- Block re-apply if REJECTED by employer

Employer Side:
- GET /employers/applications: View applications for employer's jobs
- PATCH /employers/applications/:id/shortlist: Move to INTERVIEW status
- PATCH /employers/applications/:id/reject: Reject with feedback
- Filter by jobId and status
- Job ownership validation

Features:
- Add WITHDRAWN status to ApplicationStatus enum
- Store rejection feedback in aiFeedback field
- Role-based access control (candidate vs employer)
- Comprehensive Postman test guide with 28 test cases"
```

**Tiếp theo**: AI Integration - Auto-match candidates with jobs and generate feedback
