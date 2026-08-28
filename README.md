# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.


## CareerLife API Documentation

The application includes a Zoho-style API reference at `/docs`.

### Authentication

Protected requests use:

```text
Authorization: Bearer <ACCESS_TOKEN>
```

The frontend persists `accessToken` and `refreshToken` in `localStorage`. Axios automatically attaches the access token to protected requests. A concurrent refresh queue ensures multiple `401` responses share one refresh request. When refresh succeeds, the returned token pair replaces the stored pair and the original request is retried once.

### API modules

- Authentication: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- Dashboard: `GET /dashboard`, `GET /dashboard/interview`, `GET /dashboard/resume`, `GET /dashboard/suggestions`, `GET /dashboard/missing-skills`, `GET /dashboard/improvement-areas`, `GET /dashboard/essentials`, `GET /dashboard/benchmark`, `PUT /dashboard/career-stage`
- Resumes: `GET /resumes`, `POST /resumes/upload`, `POST /resumes/{resumeId}/analyze`, `GET /resumes/{resumeId}/analyses`, `GET /resumes/{resumeId}/analyses/{analysisId}`
- Interviews: `POST /interview/start`, `POST /interview/{sessionId}/answer`, `GET /interview/{sessionId}/summary`

The web documentation contains request bodies, response examples, cURL examples, authentication requirements and common HTTP errors for every endpoint.
