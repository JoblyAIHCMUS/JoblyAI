# Application Management API Documentation

## Overview

API endpoints for managing job applications in JoblyAI system. Includes both candidate-side and employer-side operations.

---

## 🎯 Candidate APIs

### 1. Create Application

Submit a new job application.

**Endpoint:** `POST /api/applications`

**Authentication:** Required (Candidate role)

**Request Body:**

```json
{
  "jobId": 1,
  "resumeId": 1
}
```

**Success Response (201):**

```json
{
  "id": 1,
  "jobId": 1,
  "candidateId": "candidate-uuid",
  "resumeId": 1,
  "status": "APPLIED",
  "matchPercentage": 85.5,
  "aiFeedback": null,
  "createdAt": "2026-03-09T13:00:00.000Z",
  "updatedAt": "2026-03-09T13:00:00.000Z",
  "job": {
    "id": 1,
    "title": "Senior Software Engineer",
    "description": "Join our team...",
    "companyName": "TechCorp",
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
      "id": "employer-uuid",
      "name": "HR Manager",
      "email": "hr@techcorp.com"
    }
  },
  "resume": {
    "id": 1,
    "fileUrl": "https://storage.example.com/resume.pdf",
    "aiScore": 90.0,
    "isDefault": true
  }
}
```

**Error Responses:**

- `400` - Validation error (missing fields)
- `404` - Job or resume not found
- `409` - Duplicate application (already applied)
- `409` - Cannot re-apply after REJECTED
- `400` - Job is not OPEN
- `403` - Resume doesn't belong to candidate

**Validations:**

- ✅ Job must exist and status = OPEN
- ✅ Resume must exist and belong to candidate
- ✅ No duplicate applications (unless previous status was WITHDRAWN)
- ✅ Cannot re-apply after REJECTED

**Re-apply Logic:**

- If previous status = WITHDRAWN → Updates existing record to APPLIED (resets matchPercentage and aiFeedback)
- If previous status = REJECTED → Returns 409 error

---

### 2. List Applications

Get paginated list of candidate's applications with optional status filter.

**Endpoint:** `GET /api/applications`

**Authentication:** Required (Candidate role)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| pageSize | number | No | 10 | Items per page |
| status | string | No | - | Filter by status (APPLIED, INTERVIEW, OFFER, REJECTED, WITHDRAWN) |

**Example Requests:**

```
GET /api/applications
GET /api/applications?page=2&pageSize=20
GET /api/applications?status=APPLIED
GET /api/applications?status=INTERVIEW&page=1&pageSize=10
```

**Success Response (200):**

```json
{
  "applications": [
    {
      "id": 1,
      "jobId": 1,
      "candidateId": "candidate-uuid",
      "resumeId": 1,
      "status": "APPLIED",
      "matchPercentage": 85.5,
      "aiFeedback": null,
      "createdAt": "2026-03-09T13:00:00.000Z",
      "updatedAt": "2026-03-09T13:00:00.000Z",
      "job": {
        /* job details */
      },
      "resume": {
        /* resume details */
      }
    }
  ],
  "total": 15,
  "page": 1,
  "pageSize": 10,
  "totalPages": 2
}
```

---

### 3. Get Application Details

Get details of a specific application.

**Endpoint:** `GET /api/applications/:id`

**Authentication:** Required (Candidate role)

**Path Parameters:**

- `id` - Application ID (number)

**Success Response (200):**

```json
{
  "id": 1,
  "jobId": 1,
  "candidateId": "candidate-uuid",
  "resumeId": 1,
  "status": "INTERVIEW",
  "matchPercentage": 85.5,
  "aiFeedback": {
    "strengths": ["Strong technical skills", "Relevant experience"],
    "improvements": ["Could highlight leadership more"]
  },
  "createdAt": "2026-03-09T13:00:00.000Z",
  "updatedAt": "2026-03-09T13:30:00.000Z",
  "job": {
    /* full job details */
  },
  "resume": {
    /* resume details */
  }
}
```

**Error Responses:**

- `404` - Application not found
- `403` - Application doesn't belong to candidate

---

### 4. Withdraw Application

Withdraw a job application (soft delete).

**Endpoint:** `PATCH /api/applications/:id`

**Authentication:** Required (Candidate role)

**Path Parameters:**

- `id` - Application ID (number)

**Request Body:** None required

**Success Response (200):**

```json
{
  "id": 1,
  "status": "WITHDRAWN",
  "updatedAt": "2026-03-09T14:00:00.000Z"
  /* other application fields */
}
```

**Error Responses:**

- `404` - Application not found
- `403` - Application doesn't belong to candidate
- `400` - Can only withdraw applications with APPLIED status

**Business Rules:**

- ✅ Only applications with status = APPLIED can be withdrawn
- ✅ Status changes to WITHDRAWN (soft delete)
- ✅ Can re-apply to the same job after withdrawing

---

## 👔 Employer APIs

### 1. List Applications for Job

View all applications for employer's job postings.

**Endpoint:** `GET /api/employers/applications`

**Authentication:** Required (Employer role)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| jobId | number | No | - | Filter by specific job |
| status | string | No | - | Filter by status |
| page | number | No | 1 | Page number |
| pageSize | number | No | 10 | Items per page |

**Example Requests:**

```
GET /api/employers/applications
GET /api/employers/applications?jobId=1
GET /api/employers/applications?status=APPLIED
GET /api/employers/applications?jobId=1&status=APPLIED&page=1&pageSize=20
```

**Success Response (200):**

```json
{
  "applications": [
    {
      "id": 1,
      "jobId": 1,
      "candidateId": "candidate-uuid",
      "resumeId": 1,
      "status": "APPLIED",
      "matchPercentage": 85.5,
      "aiFeedback": null,
      "createdAt": "2026-03-09T13:00:00.000Z",
      "updatedAt": "2026-03-09T13:00:00.000Z",
      "candidate": {
        "id": "candidate-uuid",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "job": {
        /* job details */
      },
      "resume": {
        /* resume details */
      }
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

**Key Difference from Candidate API:**

- ✅ Includes `candidate` object with applicant information
- ✅ Only returns applications for jobs owned by the employer

---

### 2. Shortlist Application

Move application to interview stage.

**Endpoint:** `PATCH /api/employers/applications/:id/shortlist`

**Authentication:** Required (Employer role)

**Path Parameters:**

- `id` - Application ID (number)

**Request Body:** None required

**Success Response (200):**

```json
{
  "id": 1,
  "status": "INTERVIEW",
  "updatedAt": "2026-03-09T14:30:00.000Z",
  "candidate": {
    "id": "candidate-uuid",
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
  /* other application fields */
}
```

**Error Responses:**

- `404` - Application not found
- `403` - Job doesn't belong to employer
- `400` - Can only shortlist applications with APPLIED status

**Business Rules:**

- ✅ Only APPLIED applications can be shortlisted
- ✅ Status changes from APPLIED → INTERVIEW
- ✅ Employer must own the job

---

### 3. Reject Application

Reject an application with feedback.

**Endpoint:** `PATCH /api/employers/applications/:id/reject`

**Authentication:** Required (Employer role)

**Path Parameters:**

- `id` - Application ID (number)

**Request Body:**

```json
{
  "feedback": "Thank you for applying. While your profile is impressive, we've decided to move forward with candidates whose experience more closely matches our requirements."
}
```

**Validation:**

- `feedback` - Required, max 1000 characters

**Success Response (200):**

```json
{
  "id": 1,
  "status": "REJECTED",
  "aiFeedback": {
    "rejectionFeedback": "Thank you for applying. While your profile is impressive..."
  },
  "updatedAt": "2026-03-09T15:00:00.000Z",
  "candidate": {
    "id": "candidate-uuid",
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
  /* other application fields */
}
```

**Error Responses:**

- `400` - Missing or invalid feedback
- `404` - Application not found
- `403` - Job doesn't belong to employer

**Business Rules:**

- ✅ Feedback is required (max 1000 characters)
- ✅ Feedback saved to `aiFeedback.rejectionFeedback` field
- ✅ Status changes to REJECTED
- ✅ Candidate cannot re-apply after rejection
- ✅ Employer must own the job

---

## 📊 Application Status Flow

```
APPLIED (Initial)
   ↓
   ├─→ WITHDRAWN (by candidate) → Can re-apply
   ├─→ INTERVIEW (shortlisted by employer)
   │      ↓
   │      ├─→ OFFER (by employer)
   │      └─→ REJECTED (by employer) → Cannot re-apply
   │
   └─→ REJECTED (by employer) → Cannot re-apply
```

**Status Definitions:**

- `APPLIED` - Initial application submitted
- `INTERVIEW` - Shortlisted for interview
- `OFFER` - Job offer extended
- `REJECTED` - Application rejected (permanent)
- `WITHDRAWN` - Candidate withdrew (can re-apply)

---

## 🔐 Authentication & Authorization

### Candidate Role

- Can create applications
- Can view own applications only
- Can withdraw own applications
- Cannot see other candidates' applications

### Employer Role

- Can view applications for own job postings only
- Can shortlist applications
- Can reject applications with feedback
- Cannot view applications for other employers' jobs

### Headers

```
Cookie: better-auth.session_token=<your_session_token>
```

---

## ⚠️ Common Error Codes

| Code | Meaning      | Common Causes                                   |
| ---- | ------------ | ----------------------------------------------- |
| 400  | Bad Request  | Invalid input, business rule violation          |
| 401  | Unauthorized | Missing or invalid session token                |
| 403  | Forbidden    | Insufficient permissions, wrong role            |
| 404  | Not Found    | Resource doesn't exist                          |
| 409  | Conflict     | Duplicate application, re-apply after rejection |
| 500  | Server Error | Internal server error                           |

---

## 📝 Notes

### Re-apply Logic

1. **After WITHDRAWN:** ✅ Allowed

   - Updates existing record
   - Resets to APPLIED status
   - Clears matchPercentage and aiFeedback

2. **After REJECTED:** ❌ Not Allowed
   - Returns 409 Conflict error
   - Prevents spam applications

### Soft Delete Pattern

- Applications are never hard-deleted
- WITHDRAWN status acts as soft delete
- Maintains application history
- Enables analytics and reporting

### AI Integration Fields

- `matchPercentage` - AI-calculated job match score (0-100)
- `aiFeedback` - JSON field for AI-generated insights
  - Can store: strengths, improvements, rejectionFeedback
  - Flexible schema for future AI features

### Pagination

- Default: 10 items per page
- All list endpoints return pagination metadata
- Consistent structure: applications, total, page, pageSize, totalPages

---

## 🧪 Testing

See [POSTMAN_TEST_GUIDE.md](./POSTMAN_TEST_GUIDE.md) for comprehensive test cases covering:

- ✅ 18 Candidate test scenarios
- ✅ 10 Employer test scenarios
- ✅ Success cases, error cases, edge cases, security tests
