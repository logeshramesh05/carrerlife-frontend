import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const BASE = "/api/v1";

const groups = [
  {
    title: "Authentication",
    items: [
      ["register", "POST", "/auth/register"],
      ["login", "POST", "/auth/login"],
      ["refresh", "POST", "/auth/refresh"],
      ["logout", "POST", "/auth/logout"],
    ],
  },
  {
    title: "Dashboard",
    items: [
      ["dashboard", "GET", "/dashboard"],
      ["interview-performance", "GET", "/dashboard/interview"],
      ["resume-performance", "GET", "/dashboard/resume"],
      ["suggestions", "GET", "/dashboard/suggestions"],
      ["missing-skills", "GET", "/dashboard/missing-skills"],
      ["improvement-areas", "GET", "/dashboard/improvement-areas"],
      ["essentials", "GET", "/dashboard/essentials"],
      ["benchmark", "GET", "/dashboard/benchmark"],
      ["career-stage", "PUT", "/dashboard/career-stage"],
    ],
  },
  {
    title: "Resumes",
    items: [
      ["list-resumes", "GET", "/resumes"],
      ["upload-resume", "POST", "/resumes/upload"],
      ["analyze-resume", "POST", "/resumes/{resumeId}/analyze"],
      ["list-analyses", "GET", "/resumes/{resumeId}/analyses"],
      ["get-analysis", "GET", "/resumes/{resumeId}/analyses/{analysisId}"],
    ],
  },
  {
    title: "Interviews",
    items: [
      ["start-interview", "POST", "/interview/start"],
      ["submit-answer", "POST", "/interview/{sessionId}/answer"],
      ["interview-summary", "GET", "/interview/{sessionId}/summary"],
    ],
  },
];

const docs = {
  register: {
    title: "Register a user",
    summary: "Creates a CareerLife account, hashes the password, creates a refresh-token record and returns an authenticated token pair.",
    method: "POST",
    path: "/auth/register",
    auth: false,
    body: `{
  "name": "Logesh Ramesh",
  "email": "logesh@example.com",
  "password": "StrongPassword123"
}`,
    response: `{
  "name": "Logesh Ramesh",
  "email": "logesh@example.com",
  "accessToken": "<ACCESS_TOKEN>",
  "refreshToken": "<REFRESH_TOKEN>"
}`,
    notes: ["Email is normalized to lowercase.", "Password is stored as a BCrypt hash.", "A refresh token is stored as a hash in the database.", "The returned refresh token is the only value the client needs to persist."],
  },
  login: {
    title: "Login",
    summary: "Authenticates credentials and creates a new refresh-token session.",
    method: "POST",
    path: "/auth/login",
    auth: false,
    body: `{
  "email": "logesh@example.com",
  "password": "StrongPassword123"
}`,
    response: `{
  "name": "Logesh Ramesh",
  "email": "logesh@example.com",
  "accessToken": "<ACCESS_TOKEN>",
  "refreshToken": "<REFRESH_TOKEN>"
}`,
    notes: ["The access token is a signed JWT.", "The refresh token is rotated whenever /auth/refresh is called.", "Invalid credentials return an authentication failure."],
  },
  refresh: {
    title: "Refresh access token",
    summary: "Exchanges a valid refresh token for a new access token and a new refresh token.",
    method: "POST",
    path: "/auth/refresh",
    auth: false,
    body: `{
  "refreshToken": "<REFRESH_TOKEN>"
}`,
    response: `{
  "name": "Logesh Ramesh",
  "email": "logesh@example.com",
  "accessToken": "<NEW_ACCESS_TOKEN>",
  "refreshToken": "<NEW_REFRESH_TOKEN>"
}`,
    notes: ["Refresh tokens expire after 7 days in the current backend implementation.", "The previous refresh token is revoked before a replacement is issued.", "The database stores only a SHA-256-style token hash through RefreshTokenService."],
  },
  logout: {
    title: "Logout",
    summary: "Revokes the supplied refresh token. The frontend also clears its local session immediately after the request.",
    method: "POST",
    path: "/auth/logout",
    auth: false,
    body: `{
  "refreshToken": "<REFRESH_TOKEN>"
}`,
    response: "HTTP 204 No Content",
    notes: ["Logout is idempotent for an already revoked or unknown token in the current service flow.", "The client removes accessToken, refreshToken and the cached user after logout."],
  },
  dashboard: {
    title: "Get career dashboard",
    summary: "Returns the complete career progress snapshot for the authenticated user.",
    method: "GET",
    path: "/dashboard",
    auth: true,
    query: "days optional integer",
    response: `{
  "interview": {
    "totalSessions": 8,
    "completedSessions": 6,
    "inProgressSessions": 2,
    "totalQuestionsAnswered": 30,
    "averageScore": 78.4,
    "bestScore": 91.0
  },
  "resume": {
    "resumesUploaded": 3,
    "analysesRun": 5,
    "averageMatchScore": 84.2,
    "averageAtsScore": 89.6
  },
  "scoreTrend": [
    {
      "sessionId": 12,
      "completedAt": "2026-08-27T10:30:00Z",
      "score": 82.0
    }
  ],
  "domainBreakdown": [
    {
      "domain": "Java",
      "sessionCount": 4,
      "averageScore": 80.5
    }
  ],
  "topMissingSkills": [
    {
      "skill": "System Design",
      "occurrences": 3
    }
  ],
  "topStrengths": [
    {
      "skill": "Spring Boot",
      "occurrences": 4
    }
  ],
  "lastActivityAt": "2026-08-27T10:30:00Z"
}`,
    notes: ["Without days, the service loads the user's complete history.", "With days=30, the service limits interview sessions, resumes and analyses to the last 30 days.", "Scores are represented on a 0–100 scale."],
  },
  "interview-performance": {
    title: "Get interview performance",
    summary: "Returns interview statistics, score trend and domain breakdown for the authenticated user.",
    method: "GET",
    path: "/dashboard/interview",
    auth: true,
    query: "days optional integer",
    response: `{
  "stats": {
    "totalSessions": 8,
    "completedSessions": 6,
    "inProgressSessions": 2,
    "totalQuestionsAnswered": 30,
    "averageScore": 78.4,
    "bestScore": 91.0
  },
  "scoreTrend": [],
  "domainBreakdown": []
}`,
    notes: ["Use days to build a time-filtered performance view.", "Completed sessions with a stored average score contribute to the score trend."],
  },
  "resume-performance": {
    title: "Get resume performance",
    summary: "Returns resume statistics and the most frequent missing skills across the user's analyses.",
    method: "GET",
    path: "/dashboard/resume",
    auth: true,
    query: "days optional integer",
    response: `{
  "stats": {
    "resumesUploaded": 3,
    "analysesRun": 5,
    "averageMatchScore": 84.2,
    "averageAtsScore": 89.6
  },
  "topMissingSkills": [
    {
      "skill": "Docker",
      "occurrences": 3
    }
  ]
}`,
    notes: ["Match and ATS averages are calculated from stored resume analyses.", "Missing skills are aggregated from analysis JSON arrays."],
  },
  "suggestions": {
    title: "Get career suggestions",
    summary: "Returns stage-aware and performance-aware suggestions based on the user's career activity.",
    method: "GET",
    path: "/dashboard/suggestions",
    auth: true,
    response: `{
  "careerStage": "EARLY_CAREER",
  "suggestions": [
    "Deepen expertise in one stack while staying broadly aware of the ecosystem.",
    "Take ownership of a feature end-to-end to build product thinking."
  ]
}`,
    notes: ["Supported stages are STUDENT, EARLY_CAREER, SENIOR and UNSPECIFIED.", "Suggestions combine career-stage guidance with measured performance signals."],
  },
  "missing-skills": {
    title: "Get missing skills",
    summary: "Returns recurring skills missing from resume analyses.",
    method: "GET",
    path: "/dashboard/missing-skills",
    auth: true,
    response: `{
  "skills": [
    {
      "skill": "System Design",
      "occurrences": 4
    },
    {
      "skill": "Docker",
      "occurrences": 3
    }
  ]
}`,
    notes: ["Occurrences represent frequency across stored analyses.", "The service returns aggregated skill gaps rather than a single analysis."],
  },
  "improvement-areas": {
    title: "Get improvement areas",
    summary: "Returns recurring resume weaknesses and the lowest-scoring interview feedback available to the user.",
    method: "GET",
    path: "/dashboard/improvement-areas",
    auth: true,
    response: `{
  "recurringResumeWeaknesses": [
    {
      "skill": "Docker",
      "occurrences": 3
    }
  ],
  "lowestScoringInterviewFeedback": [
    "Explain retry and delivery guarantees in more detail."
  ]
}`,
    notes: ["Resume weaknesses are aggregated from stored analysis results.", "Interview feedback is selected from lower-scoring interview turns."],
  },
  essentials: {
    title: "Get career essentials",
    summary: "Returns the compact metrics required for a career overview card.",
    method: "GET",
    path: "/dashboard/essentials",
    auth: true,
    response: `{
  "totalInterviewSessions": 8,
  "averageInterviewScore": 78.4,
  "resumesUploaded": 3,
  "averageAtsScore": 89.6,
  "careerStage": "EARLY_CAREER",
  "lastActivityAt": "2026-08-27T10:30:00Z"
}`,
    notes: ["This endpoint is optimized for summary widgets rather than detailed analytics."],
  },
  benchmark: {
    title: "Get benchmark",
    summary: "Returns the user's average interview and ATS scores beside the configured typical benchmark values.",
    method: "GET",
    path: "/dashboard/benchmark",
    auth: true,
    response: `{
  "yourAverageScore": 78.4,
  "typicalAverageScore": 75.0,
  "yourAverageAtsScore": 89.6,
  "typicalAverageAtsScore": 82.0
}`,
    notes: ["Benchmark values are supplied by the backend benchmark service.", "Null user averages are possible before the user has relevant activity."],
  },
  "career-stage": {
    title: "Set career stage",
    summary: "Stores the user's selected career stage for personalized guidance.",
    method: "PUT",
    path: "/dashboard/career-stage",
    auth: true,
    body: `{
  "careerStage": "EARLY_CAREER"
}`,
    response: "HTTP 204 No Content",
    notes: ["Allowed values: STUDENT, EARLY_CAREER, SENIOR, UNSPECIFIED."],
  },
  "list-resumes": {
    title: "List resumes",
    summary: "Returns the resumes uploaded by the authenticated user.",
    method: "GET",
    path: "/resumes",
    auth: true,
    response: `[
  {
    "id": 14,
    "fileName": "backend-engineer-resume.pdf",
    "contentType": "application/pdf",
    "fileSize": 184320,
    "uploadedAt": "2026-08-27T09:20:00Z"
  }
]`,
    notes: ["Only resumes belonging to the authenticated user are returned.", "The stored file path is never exposed in the API response."],
  },
  "upload-resume": {
    title: "Upload resume",
    summary: "Uploads a PDF or DOCX resume and creates a resume record for the authenticated user.",
    method: "POST",
    path: "/resumes/upload",
    auth: true,
    contentType: "multipart/form-data",
    form: "file: binary",
    response: `{
  "id": 14,
  "fileName": "backend-engineer-resume.pdf",
  "contentType": "application/pdf",
  "fileSize": 184320,
  "uploadedAt": "2026-08-27T09:20:00Z"
}`,
    notes: ["Maximum file size is 5 MB.", "Supported file types are PDF and DOCX.", "The file is stored under the configured resume upload directory."],
  },
  "analyze-resume": {
    title: "Analyze resume",
    summary: "Extracts relevant resume sections, removes contact information, compares the resume with a job description and stores the AI analysis.",
    method: "POST",
    path: "/resumes/{resumeId}/analyze",
    auth: true,
    body: `{
  "jobDescription": "We are looking for a Java backend engineer with Spring Boot, REST APIs, SQL, Docker and cloud experience."
}`,
    response: `{
  "analysisId": 2,
  "resumeId": 14,
  "matchScore": 86,
  "atsScore": 91,
  "matchedSkills": ["Java", "Spring Boot", "REST APIs"],
  "missingSkills": ["Docker", "Cloud"],
  "keywordGaps": ["containerization"],
  "strengths": ["Backend API experience"],
  "weaknesses": ["Limited deployment evidence"],
  "recommendations": ["Add Docker and cloud project evidence"]
}`,
    notes: ["The resume must belong to the authenticated user.", "PDF text is extracted with PDFBox and DOCX text with Apache POI.", "Contact information is removed before relevant resume sections are sent to the LLM analyzer.", "The job description is required."],
  },
  "list-analyses": {
    title: "List resume analyses",
    summary: "Returns the analysis history for a specific resume owned by the authenticated user.",
    method: "GET",
    path: "/resumes/{resumeId}/analyses",
    auth: true,
    response: `[
  {
    "analysisId": 2,
    "resumeId": 14,
    "matchScore": 86,
    "atsScore": 91,
    "matchedSkills": ["Java", "Spring Boot"],
    "missingSkills": ["Docker"],
    "keywordGaps": ["containerization"],
    "strengths": ["REST APIs"],
    "weaknesses": ["Limited deployment evidence"],
    "recommendations": ["Add Docker and cloud project evidence"]
  }
]`,
    notes: ["The current service returns complete analysis DTOs for each history item."],
  },
  "get-analysis": {
    title: "Get resume analysis",
    summary: "Returns one complete stored resume analysis.",
    method: "GET",
    path: "/resumes/{resumeId}/analyses/{analysisId}",
    auth: true,
    response: `{
  "analysisId": 2,
  "resumeId": 14,
  "matchScore": 86,
  "atsScore": 91,
  "matchedSkills": ["Java", "Spring Boot"],
  "missingSkills": ["Docker"],
  "keywordGaps": ["containerization"],
  "strengths": ["REST APIs"],
  "weaknesses": ["Limited deployment evidence"],
  "recommendations": ["Add Docker and cloud project evidence"]
}`,
    notes: ["Both resume ownership and analysis ownership are checked through the resume relation."],
  },
  "start-interview": {
    title: "Start interview",
    summary: "Creates an AI mock interview session and generates the first question.",
    method: "POST",
    path: "/interview/start",
    auth: true,
    body: `{
  "role": "Backend Engineer",
  "domain": "Java, System Design",
  "difficulty": "MEDIUM",
  "totalQuestions": 5
}`,
    response: `{
  "sessionId": 42,
  "questionIndex": 0,
  "totalQuestions": 5,
  "question": "Explain how you would design a scalable notification service."
}`,
    notes: ["Default role is Software Engineer when blank.", "Default difficulty is MEDIUM.", "Default question count is 5.", "Question count is clamped between 1 and 10.", "The first LLM response is stored as interview turn 0."],
  },
  "submit-answer": {
    title: "Submit interview answer",
    summary: "Evaluates the current answer, stores score and feedback, and returns the next question when the session continues.",
    method: "POST",
    path: "/interview/{sessionId}/answer",
    auth: true,
    body: `{
  "answer": "I would use an event-driven architecture with a durable queue and idempotent consumers."
}`,
    response: `{
  "sessionId": 42,
  "status": "IN_PROGRESS",
  "score": 84,
  "feedback": "Good architecture choice. Explain retry and delivery guarantees in more detail.",
  "nextQuestionIndex": 1,
  "nextQuestion": "How would you handle duplicate notifications?",
  "averageScore": null
}`,
    notes: ["Scores are returned on a 0–100 scale.", "The current question is marked as answered before the next question is created.", "When there is no next question, the session becomes COMPLETED and averageScore is calculated.", "A completed session cannot accept another answer."],
  },
  "interview-summary": {
    title: "Get interview summary",
    summary: "Returns the full interview result with role, domain, status, average score, overall summary and turn-by-turn results.",
    method: "GET",
    path: "/interview/{sessionId}/summary",
    auth: true,
    response: `{
  "sessionId": 42,
  "role": "Backend Engineer",
  "domain": "Java, System Design",
  "status": "COMPLETED",
  "averageScore": 81.6,
  "overallSummary": "Strong backend fundamentals with room for deeper system design trade-offs.",
  "turns": [
    {
      "questionIndex": 0,
      "question": "Explain how you would design a scalable notification service.",
      "answer": "I would use an event-driven architecture...",
      "score": 84,
      "feedback": "Good architecture choice."
    }
  ]
}`,
    notes: ["The session must belong to the authenticated user.", "Turn results are ordered by question index."],
  },
};

const authErrors = `401 Unauthorized
{
  "code": "AUTHENTICATION_REQUIRED",
  "message": "Access token is missing, expired or invalid."
}`;

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(children);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="code-wrap">
      <button className="copy-button" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
      <pre className="api-code"><code>{children}</code></pre>
    </div>
  );
}

function curl(doc) {
  const path = doc.path.replace("{resumeId}", "14").replace("{analysisId}", "2").replace("{sessionId}", "42");
  const query = doc.query ? "?days=30" : "";
  const auth = doc.auth ? ` \\\n  -H "Authorization: Bearer <ACCESS_TOKEN>"` : "";
  if (doc.contentType === "multipart/form-data") {
    return `curl -X POST "$API_BASE_URL${path}"${auth} \\
  -F "file=@resume.pdf"`;
  }
  const body = doc.body ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${doc.body.replaceAll("'", "'\\''")}'` : "";
  return `curl -X ${doc.method} "$API_BASE_URL${path}${query}"${auth}${body}`;
}

function Endpoint({ id, doc }) {
  return (
    <article id={id} className="api-endpoint">
      <div className="api-endpoint-header">
        <div>
          <div className="api-kicker">{doc.title}</div>
          <h2>{doc.method} {doc.path}</h2>
          <p>{doc.summary}</p>
        </div>
        <div className="api-badges">
          <span className={`method ${doc.method.toLowerCase()}`}>{doc.method}</span>
          <span className="auth-badge">{doc.auth ? "Bearer access token" : "Public"}</span>
        </div>
      </div>

      {doc.contentType && <section><h3>Content type</h3><CodeBlock>{doc.contentType}</CodeBlock></section>}
      {doc.query && <section><h3>Query parameters</h3><CodeBlock>{doc.query}</CodeBlock></section>}
      {doc.body && <section><h3>Request body</h3><CodeBlock>{doc.body}</CodeBlock></section>}
      {doc.form && <section><h3>Multipart fields</h3><CodeBlock>{doc.form}</CodeBlock></section>}
      <section><h3>cURL</h3><CodeBlock>{curl(doc)}</CodeBlock></section>
      <section><h3>Response</h3><CodeBlock>{doc.response}</CodeBlock></section>
      {doc.auth && <section><h3>Authentication failure example</h3><CodeBlock>{authErrors}</CodeBlock></section>}
      <section>
        <h3>Implementation notes</h3>
        <ul className="doc-notes">{doc.notes.map((note) => <li key={note}>{note}</li>)}</ul>
      </section>
    </article>
  );
}

export default function ApiDocumentation() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("introduction");
  const filteredGroups = useMemo(() => groups.map((group) => ({
    ...group,
    items: group.items.filter(([id, method, path]) =>
      `${id} ${method} ${path} ${group.title}`.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter((group) => group.items.length), [query]);

  const scrollTo = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="docs-shell">
      <aside className="docs-sidebar">
        <div className="docs-sidebar-title">CareerLife API</div>
        <Link className="docs-home" to="/">Platform overview</Link>
        <div className="docs-search">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documentation" />
        </div>
        <nav>
          {[
            ["introduction", "Introduction"],
            ["quickstart", "Quickstart"],
            ["authentication", "Authentication"],
            ["token-flow", "Token lifecycle"],
            ["application-flow", "Application flow"],
            ["errors", "Errors"],
          ].map(([id, label]) => (
            <button key={id} className={active === id ? "active" : ""} onClick={() => scrollTo(id)}>{label}</button>
          ))}
          {filteredGroups.map((group) => (
            <div className="docs-nav-group" key={group.title}>
              <div>{group.title}</div>
              {group.items.map(([id, method, path]) => (
                <button key={id} className={active === id ? "active" : ""} onClick={() => scrollTo(id)}>
                  <span className={`nav-method ${method.toLowerCase()}`}>{method}</span>
                  <span>{path}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="docs-content">
        <section id="introduction" className="docs-intro">
          <div className="api-kicker">CAREERLIFE PLATFORM</div>
          <h1>API Documentation</h1>
          <p>End-to-end reference for the CareerLife career development platform. Use this guide from the first account request through resume analysis, AI interview practice, progress measurement and session renewal.</p>
          <div className="docs-meta-grid">
            <div><span>API base path</span><strong>{BASE}</strong></div>
            <div><span>Transport</span><strong>HTTPS + JSON</strong></div>
            <div><span>Authorization</span><strong>Bearer JWT</strong></div>
            <div><span>Refresh lifetime</span><strong>7 days</strong></div>
          </div>
        </section>

        <section id="quickstart" className="docs-section">
          <div className="api-kicker">START HERE</div>
          <h2>Quickstart</h2>
          <p>Set the frontend API base URL to the deployed backend origin plus <code>/api/v1</code>. For local development, use the Spring Boot server at port 8080.</p>
          <CodeBlock>{`VITE_API_BASE_URL=http://localhost:8080/api/v1`}</CodeBlock>
          <h3>1. Register</h3>
          <CodeBlock>{`POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Logesh Ramesh",
  "email": "logesh@example.com",
  "password": "StrongPassword123"
}`}</CodeBlock>
          <h3>2. Persist the token pair</h3>
          <CodeBlock>{`localStorage.accessToken = "<ACCESS_TOKEN>"
localStorage.refreshToken = "<REFRESH_TOKEN>"`}</CodeBlock>
          <h3>3. Call a protected endpoint</h3>
          <CodeBlock>{`GET /api/v1/dashboard
Authorization: Bearer <ACCESS_TOKEN>`}</CodeBlock>
          <h3>4. Refresh when access expires</h3>
          <CodeBlock>{`POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<REFRESH_TOKEN>"
}`}</CodeBlock>
        </section>

        <section id="authentication" className="docs-section">
          <div className="api-kicker">SECURITY</div>
          <h2>Authentication</h2>
          <p>Authentication uses a short-lived JWT access token and a longer-lived refresh token. Register and login return both values. Protected endpoints require the access token in the Authorization header.</p>
          <CodeBlock>{`Authorization: Bearer <ACCESS_TOKEN>`}</CodeBlock>
          <div className="token-flow">
            {[
              ["01", "Register or login", "Receive accessToken and refreshToken."],
              ["02", "Store session", "Persist the token pair and authenticated user."],
              ["03", "Authorize requests", "Attach the access token to protected APIs."],
              ["04", "Refresh", "Exchange the refresh token after access expiry."],
              ["05", "Rotate", "Replace both stored tokens with the new pair."],
              ["06", "Retry", "Retry the failed protected request once."],
            ].map(([n, title, text]) => <div key={n}><b>{n}</b><span>{title}</span><small>{text}</small></div>)}
          </div>
        </section>

        <section id="token-flow" className="docs-section">
          <div className="api-kicker">CLIENT IMPLEMENTATION</div>
          <h2>Token lifecycle</h2>
          <p>The CareerLife frontend uses a shared Axios refresh promise. If several protected requests receive 401 at the same time, they wait for one refresh operation instead of creating multiple refresh requests.</p>
          <CodeBlock>{`Protected request
      |
      v
Access token valid? ---- yes ----> API response
      |
      no / 401
      |
      v
Read refresh token
      |
      v
One shared refresh request
      |
      +---- failure ----> clear session -> /login
      |
      success
      |
      v
Persist new access + refresh tokens
      |
      v
Retry original request once`}</CodeBlock>
          <h3>Security boundary</h3>
          <p>The backend stores only the refresh-token hash. The access token is validated as a signed JWT and carries the user's email, user id and name claims.</p>
        </section>

        <section id="application-flow" className="docs-section">
          <div className="api-kicker">END-TO-END WORKFLOW</div>
          <h2>Application flow</h2>
          <div className="workflow-grid">
            {[
              ["Account", "Register or login", "Authentication creates the user session and token pair."],
              ["Resume", "Upload PDF or DOCX", "The resume is stored against the authenticated user."],
              ["Analysis", "Add a job description", "Resume text is extracted, contact information is filtered and relevant sections are analyzed."],
              ["Interview", "Configure mock interview", "The AI creates the first question and stores the session."],
              ["Practice", "Submit each answer", "The AI evaluates each answer and generates the next question."],
              ["Measure", "Open dashboard", "Interview and resume data becomes career progress metrics."],
              ["Improve", "Read suggestions", "Missing skills and recurring weaknesses guide the next action."],
            ].map(([stage, title, text]) => <div className="workflow-card" key={stage}><span>{stage}</span><h3>{title}</h3><p>{text}</p></div>)}
          </div>
        </section>

        <section id="errors" className="docs-section">
          <div className="api-kicker">RESPONSE HANDLING</div>
          <h2>Errors and status codes</h2>
          <p>Use the HTTP status as the primary signal. The backend has a custom handler for duplicate email registration; other domain exceptions can surface through Spring's standard error handling.</p>
          <div className="status-grid">
            <div><b>2xx</b><span>Request succeeded</span></div>
            <div><b>204</b><span>Request succeeded with no body</span></div>
            <div><b>400</b><span>Invalid request data when mapped by validation or exception handling</span></div>
            <div><b>401</b><span>Missing, invalid or expired authentication</span></div>
            <div><b>403</b><span>Authenticated user cannot access the resource</span></div>
            <div><b>404</b><span>Resource does not exist or is not accessible</span></div>
            <div><b>409</b><span>Email is already registered</span></div>
            <div><b>5xx</b><span>Unexpected server or external LLM failure</span></div>
          </div>
        </section>

        {groups.flatMap((group) => group.items).map(([id]) => docs[id] && <Endpoint key={id} id={id} doc={docs[id]} />)}
      </main>
    </div>
  );
}
