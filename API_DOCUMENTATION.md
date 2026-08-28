# CareerLife API Documentation

## Introduction

CareerLife provides APIs for authentication, career analytics, resume analysis and AI mock interviews.

### Base URL

```text
$API_BASE_URL
```

### Request format

```text
Content-Type: application/json
```

### Authorization

Protected endpoints require:

```text
Authorization: Bearer <ACCESS_TOKEN>
```

## Authentication flow

### 1. Register or login

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "logesh@example.com",
  "password": "StrongPassword123"
}
```

Response:

```json
{
  "accessToken": "<ACCESS_TOKEN>",
  "refreshToken": "<REFRESH_TOKEN>",
  "email": "logesh@example.com",
  "name": "Logesh Ramesh"
}
```

### 2. Store tokens

```text
localStorage.accessToken = accessToken
localStorage.refreshToken = refreshToken
```

### 3. Call protected APIs

```http
Authorization: Bearer <ACCESS_TOKEN>
```

### 4. Refresh after 401

```http
POST /auth/refresh
Content-Type: application/json
```

```json
{
  "refreshToken": "<REFRESH_TOKEN>"
}
```

Response:

```json
{
  "accessToken": "<NEW_ACCESS_TOKEN>",
  "refreshToken": "<NEW_REFRESH_TOKEN>"
}
```

### 5. Retry the failed request

```http
Authorization: Bearer <NEW_ACCESS_TOKEN>
```

### 6. Refresh failure

Remove the stored session and route the user to `/login`.

## Authentication API

### POST /auth/register

Creates a user account and returns an authenticated session.

Request:

```json
{
  "name": "Logesh Ramesh",
  "email": "logesh@example.com",
  "password": "StrongPassword123"
}
```

Response:

```json
{
  "accessToken": "<ACCESS_TOKEN>",
  "refreshToken": "<REFRESH_TOKEN>",
  "email": "logesh@example.com",
  "name": "Logesh Ramesh"
}
```

### POST /auth/login

Authenticates an existing user.

Request:

```json
{
  "email": "logesh@example.com",
  "password": "StrongPassword123"
}
```

Response:

```json
{
  "accessToken": "<ACCESS_TOKEN>",
  "refreshToken": "<REFRESH_TOKEN>",
  "email": "logesh@example.com",
  "name": "Logesh Ramesh"
}
```

### POST /auth/refresh

Exchanges a valid refresh token for a new token pair.

Request:

```json
{
  "refreshToken": "<REFRESH_TOKEN>"
}
```

Response:

```json
{
  "accessToken": "<NEW_ACCESS_TOKEN>",
  "refreshToken": "<NEW_REFRESH_TOKEN>"
}
```

### POST /auth/logout

Invalidates the refresh session.

Request:

```json
{
  "refreshToken": "<REFRESH_TOKEN>"
}
```

Response:

```json
{
  "message": "Logged out successfully"
}
```

## Dashboard API

### GET /dashboard

Returns the complete career progress dashboard.

Optional query:

```text
?days=30
```

Response:

```json
{
  "interview": {
    "totalSessions": 12,
    "completedSessions": 10,
    "averageScore": 7.8,
    "bestScore": 9.4,
    "totalQuestionsAnswered": 48
  },
  "resume": {
    "resumesUploaded": 3,
    "averageMatchScore": 82,
    "averageAtsScore": 88,
    "analysesRun": 7
  },
  "scoreTrend": [],
  "domainBreakdown": [],
  "topMissingSkills": [],
  "topStrengths": []
}
```

### GET /dashboard/interview

Returns interview performance.

```text
GET /dashboard/interview?days=30
Authorization: Bearer <ACCESS_TOKEN>
```

Response:

```json
{
  "days": 30,
  "totalSessions": 8,
  "completedSessions": 7,
  "averageScore": 7.9,
  "bestScore": 9.2,
  "totalQuestionsAnswered": 35
}
```

### GET /dashboard/resume

Returns resume performance.

```text
GET /dashboard/resume?days=30
Authorization: Bearer <ACCESS_TOKEN>
```

Response:

```json
{
  "days": 30,
  "resumesUploaded": 3,
  "analysesRun": 7,
  "averageMatchScore": 82,
  "averageAtsScore": 88
}
```

### GET /dashboard/suggestions

Returns personalized career suggestions.

Response:

```json
{
  "careerStage": "JOB_SEEKER",
  "suggestions": [
    "Strengthen system design fundamentals",
    "Increase interview practice frequency"
  ]
}
```

### GET /dashboard/missing-skills

Returns recurring missing skills.

Response:

```json
{
  "skills": [
    {
      "skill": "System Design",
      "occurrences": 4
    },
    {
      "skill": "Docker",
      "occurrences": 2
    }
  ]
}
```

### GET /dashboard/improvement-areas

Returns recurring improvement areas.

Response:

```json
{
  "recurringResumeWeaknesses": [
    {
      "skill": "System Design",
      "occurrences": 4
    }
  ],
  "lowestScoringInterviewFeedback": [
    "Provide clearer trade-offs and implementation details."
  ]
}
```

### GET /dashboard/essentials

Returns career-readiness indicators.

Response:

```json
{
  "resumeReady": true,
  "interviewReady": false,
  "profileComplete": true
}
```

### GET /dashboard/benchmark

Returns benchmark comparisons.

Response:

```json
{
  "yourAverageScore": 7.8,
  "typicalAverageScore": 7.2,
  "yourAverageAtsScore": 88,
  "typicalAverageAtsScore": 80
}
```

### PUT /dashboard/career-stage

Updates the user's career stage.

Request:

```json
{
  "careerStage": "JOB_SEEKER"
}
```

Response:

```json
{
  "careerStage": "JOB_SEEKER"
}
```

## Resume API

### GET /resumes

Lists authenticated-user resumes.

Response:

```json
[
  {
    "id": 14,
    "fileName": "logesh-backend-resume.pdf",
    "uploadedAt": "2026-08-27T09:15:00Z"
  }
]
```

### POST /resumes/upload

Uploads a PDF or DOCX resume.

```http
POST /resumes/upload
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: multipart/form-data
```

Form field:

```text
file=<resume.pdf>
```

Response:

```json
{
  "id": 14,
  "fileName": "logesh-backend-resume.pdf",
  "uploadedAt": "2026-08-27T09:15:00Z"
}
```

### POST /resumes/{resumeId}/analyze

Analyzes a resume against a job description.

Request:

```json
{
  "jobDescription": "We are hiring a Backend Engineer with Java, Spring Boot, PostgreSQL and Docker experience."
}
```

Response:

```json
{
  "analysisId": 2,
  "matchScore": 86,
  "atsScore": 91,
  "matchedSkills": ["Java", "Spring Boot", "PostgreSQL"],
  "missingSkills": ["Docker"],
  "keywordGaps": ["containerization"],
  "strengths": ["REST APIs", "Microservices"],
  "weaknesses": ["Limited Docker evidence"],
  "recommendations": ["Add production Docker experience"]
}
```

### GET /resumes/{resumeId}/analyses

Lists analysis history.

Response:

```json
[
  {
    "analysisId": 2,
    "matchScore": 86,
    "atsScore": 91,
    "createdAt": "2026-08-27T10:00:00Z"
  }
]
```

### GET /resumes/{resumeId}/analyses/{analysisId}

Returns one complete analysis.

Response:

```json
{
  "analysisId": 2,
  "matchScore": 86,
  "atsScore": 91,
  "matchedSkills": ["Java", "Spring Boot"],
  "missingSkills": ["Docker"],
  "keywordGaps": ["containerization"],
  "strengths": ["REST APIs"],
  "weaknesses": ["Limited Docker evidence"],
  "recommendations": ["Add Docker project evidence"]
}
```

## Interview API

### POST /interview/start

Creates a mock interview session.

Request:

```json
{
  "role": "Backend Engineer",
  "domain": "Java, System Design",
  "difficulty": "MEDIUM",
  "totalQuestions": 5
}
```

Response:

```json
{
  "sessionId": 42,
  "question": "Explain how you would design a scalable notification service.",
  "questionIndex": 0,
  "totalQuestions": 5
}
```

### POST /interview/{sessionId}/answer

Evaluates an answer and returns the next question.

Request:

```json
{
  "answer": "I would use an event-driven architecture with a durable queue..."
}
```

Response:

```json
{
  "score": 8.5,
  "feedback": "Good architecture choice. Explain retry and delivery guarantees in more detail.",
  "status": "IN_PROGRESS",
  "nextQuestion": "How would you handle duplicate notifications?",
  "nextQuestionIndex": 1
}
```

### GET /interview/{sessionId}/summary

Returns the completed interview summary.

Response:

```json
{
  "sessionId": 42,
  "role": "Backend Engineer",
  "status": "COMPLETED",
  "averageScore": 8.1,
  "overallSummary": "Strong backend fundamentals with room for deeper system design trade-offs.",
  "turns": [
    {
      "questionIndex": 0,
      "question": "Explain how you would design a scalable notification service.",
      "answer": "I would use an event-driven architecture...",
      "score": 8.5,
      "feedback": "Good architecture choice."
    }
  ]
}
```

## Common errors

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
413 Payload Too Large
415 Unsupported Media Type
429 Too Many Requests
500 Internal Server Error
```

Error body:

```json
{
  "message": "Human-readable error message"
}
```

## Frontend token implementation

`src/api/tokenStore.js` owns session persistence.

`src/api/client.js` owns:

1. Bearer token injection.
2. Access-token failure detection.
3. Single-flight refresh handling.
4. Refresh-token rotation.
5. Original request retry.
6. Session cleanup after refresh failure.

`src/context/AuthContext.jsx` owns:

1. Login session creation.
2. Registration session creation.
3. User persistence.
4. Logout.
5. React authentication state.
