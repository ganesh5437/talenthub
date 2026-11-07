<div align="center">

# TalentHub

### Recruitment & Applicant Tracking System

A full-stack hiring platform that connects **companies**, **recruiters** and **candidates** through one clear, auditable hiring pipeline.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-talenthub--app.netlify.app-4f46e5?style=for-the-badge&logo=netlify&logoColor=white)](https://talenthub-app.netlify.app)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=nodedotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)

[Live App](https://talenthub-app.netlify.app) · [API](https://talenthub-274q.onrender.com/api/health) · [Features](#-features) · [Run Locally](#-run-locally) · [API Reference](#-api-reference)

</div>

---

## 📌 Table of Contents
- [About the Project](#-about-the-project)
- [Features](#-features)
- [User Roles](#-user-roles)
- [Hiring Pipeline](#-hiring-pipeline)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Design](#-database-design)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Run Locally](#-run-locally)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)

---

## 📖 About the Project

Hiring in small and mid-sized companies is often managed through spreadsheets and email threads, where candidate status gets lost, decisions are changed without a record, and candidates are never told where they stand.

**TalentHub** solves this with an **Applicant Tracking System (ATS)**:

- Companies register and are **verified by a platform admin** before they can hire.
- Recruiters post jobs and move applicants through a **strict, forward-only pipeline**.
- **Final decisions (Hired / Rejected) are locked** and cannot be reversed by mistake.
- Candidates track every application and are **notified at each step**.

---

## ✨ Features

| Area | Feature |
|---|---|
| 🏢 **Companies** | Company registration → admin approval workflow (Pending / Approved / Rejected / Blocked) |
| 👥 **Team** | Company Admins add recruiters to their own company |
| 📝 **Jobs** | Create as draft or publish, close, reopen and delete (only when there are no applicants) |
| 🔍 **Job search** | Search by title, skill or company and filter by work type (Onsite / Remote / Hybrid) |
| 📊 **ATS pipeline** | Forward-only stages with progress bar, applicant filters and confirm dialogs |
| 🔒 **Locked decisions** | *Hired* and *Rejected* are final, enforced on the **server**, not just the UI |
| 📅 **Interviews** | Multiple rounds, date and time scheduling, Pass / Fail results |
| 👤 **Candidate profile** | Skills, experience, education, resume, LinkedIn and portfolio links |
| 🔔 **Notifications** | Bell with unread count for status changes, interviews, new applications and company approval |
| 📈 **Dashboards** | Role-specific stats for Super Admin, Company Admin and Recruiter |
| 🛡️ **Access control** | Role-based **and** company-based authorization on every API |
| 🗂️ **Multi-tab demo** | Each browser tab keeps its own login, so several roles can be used side by side |
| 📱 **Responsive** | Works on desktop and mobile |

---

## 👥 User Roles

| Role | How the account is created | What they can do |
|---|---|---|
| **Super Admin** | `npm run create-admin` (server script) | Approve / reject / block companies, block users, platform-wide stats |
| **Company Admin** | Self-registration | Register the company, add recruiters, post jobs, see all company jobs and stats |
| **Recruiter** | Added by their Company Admin | Post and manage jobs, review applicants, schedule interviews, hire / reject |
| **Candidate** | Self-registration | Build a profile, search and apply to jobs, track applications and interviews |

### Typical workflow
```mermaid
sequenceDiagram
    actor CA as Company Admin
    actor SA as Super Admin
    actor R as Recruiter
    actor C as Candidate
    CA->>CA: Register & create company (Pending)
    SA->>CA: Approve company
    CA->>R: Add recruiter
    R->>R: Post job (Published)
    C->>R: Apply to job
    R->>C: Shortlist / schedule interview (notified)
    R->>C: Hire or Reject — final 🔒 (notified)
```

---

## 🔁 Hiring Pipeline

```mermaid
flowchart LR
    A[Applied] --> B[Under Review] --> C[Shortlisted] --> D[Interview Scheduled] --> E[Selected] --> F[Offer Released] --> G[Hired 🔒]
    A & B & C & D & E & F -.-> X[Rejected 🔒]
```

**Rules (enforced by the backend):**
1. Applications move **forward only**. Stages can be skipped but never reversed.
2. **Interview Scheduled** is set only by scheduling an interview, so a real interview record always exists.
3. **Hired** and **Rejected** are **terminal**. Any later change returns `409 Conflict`.
4. Interviews cannot be scheduled for rejected, selected or hired candidates.

Implementation: [`server/src/utils/applicationPipeline.js`](server/src/utils/applicationPipeline.js) · Tests: [`server/test/`](server/test)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v7, Axios |
| **Backend** | Node.js, Express 5 |
| **Database** | PostgreSQL (hosted on Neon) |
| **ORM** | Prisma |
| **Authentication** | JWT (7-day tokens) + bcrypt password hashing |
| **Testing** | Node.js built-in test runner (`node:test`) |
| **Hosting** | Netlify (frontend), Render (backend), Neon (database) |

---

## 🏗 System Architecture

```mermaid
flowchart LR
    U[Browser<br/>React SPA] -- HTTPS / JSON + JWT --> API[Express API<br/>Render]
    API -- Prisma ORM --> DB[(PostgreSQL<br/>Neon)]
    N[Netlify CDN] -- serves --> U
```

- **Frontend** is a single-page app served by Netlify. `_redirects` sends every route to `index.html`.
- **Backend** is a stateless REST API. Each request is authenticated with a JWT, and the user's **role and company are re-read from the database** on every request, so changes apply immediately.
- **Database** schema and migrations are managed by Prisma.

---

## 🗄 Database Design

```mermaid
erDiagram
    COMPANY ||--o{ USER : "has members"
    COMPANY ||--o{ JOB : posts
    COMPANY ||--o{ DEPARTMENT : has
    USER ||--o{ JOB : "creates (recruiter)"
    USER ||--o| CANDIDATE : "has profile"
    CANDIDATE ||--o{ APPLICATION : submits
    JOB ||--o{ APPLICATION : receives
    APPLICATION ||--o{ INTERVIEW : has
    USER ||--o{ NOTIFICATION : receives

    USER {
        string id PK
        string email UK
        string role
        boolean isBlocked
        string companyId FK
    }
    COMPANY {
        string id PK
        string name
        string status
    }
    JOB {
        string id PK
        string title
        string type
        string status
        int salaryMin
        int salaryMax
    }
    APPLICATION {
        string id PK
        string status
        string jobId FK
        string candidateId FK
    }
    INTERVIEW {
        string id PK
        int round
        datetime scheduledAt
        string result
    }
```

Full schema: [`server/prisma/schema.prisma`](server/prisma/schema.prisma)

---

## 📡 API Reference

Base URL: `https://talenthub-274q.onrender.com/api` · All protected routes need the header `Authorization: Bearer <token>`.

<details>
<summary><b>Auth</b></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register as Candidate or Company Admin |
| POST | `/auth/login` | Public | Log in and receive a JWT |
| GET | `/auth/me` | Logged in | Current user with company info |
</details>

<details>
<summary><b>Companies</b></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/companies` | Company Admin | Register company (starts as Pending) |
| GET | `/companies` | Super Admin | List all companies |
| GET | `/companies/:id` | Logged in | Company profile and jobs |
| PATCH | `/companies/:id/status` | Super Admin | Approve / Reject / Block |
| GET | `/companies/me/recruiters` | Company Admin | List own recruiters |
| POST | `/companies/me/recruiters` | Company Admin | Add or link a recruiter |
| POST | `/companies/department` | Company Admin | Create department |
</details>

<details>
<summary><b>Jobs</b></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/jobs` | Public | Published jobs of approved companies (`?search=&type=`) |
| GET | `/jobs/:id` | Public | Job details |
| GET | `/jobs/my-jobs` | Recruiter / Company Admin | Own jobs (admin: all company jobs) |
| POST | `/jobs` | Recruiter / Company Admin | Create job (company must be approved) |
| PATCH | `/jobs/:id` | Recruiter / Company Admin | Edit / publish / close (own company only) |
| DELETE | `/jobs/:id` | Recruiter / Company Admin | Delete (only if no applicants) |
</details>

<details>
<summary><b>Applications & Interviews</b></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/applications` | Candidate | Apply to a job |
| GET | `/applications/my` | Candidate | Own applications with interviews |
| GET | `/applications/job/:jobId` | Recruiter / Company Admin | Applicants with allowed next stages |
| PATCH | `/applications/:id/status` | Recruiter / Company Admin | Move in pipeline (pipeline rules enforced) |
| POST | `/interviews` | Recruiter / Company Admin | Schedule interview round |
| PATCH | `/interviews/:id` | Recruiter / Company Admin | Record result / feedback |
</details>

<details>
<summary><b>Candidates, Notifications & Admin</b></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET / PATCH | `/candidates/me` | Candidate | View / update profile |
| POST | `/candidates/save-job` | Candidate | Save a job |
| GET | `/candidates/saved-jobs` | Candidate | Saved jobs |
| GET | `/notifications` | Logged in | Latest 50 notifications |
| PATCH | `/notifications/:id/read` | Logged in | Mark one as read |
| PATCH | `/notifications/read-all` | Logged in | Mark all as read |
| GET | `/admin/users` | Super Admin | All users |
| PATCH | `/admin/users/:id/block` | Super Admin | Block / unblock user |
| GET | `/admin/stats/platform` | Super Admin | Platform statistics |
| GET | `/admin/stats/company` | Company Admin / Recruiter | Company statistics |
| GET | `/health` | Public | Health check |
</details>

---

## 🔐 Security

- Passwords hashed with **bcrypt**. They are never stored or returned in plain text.
- **JWT authentication**. Role and company are re-checked from the database on every request.
- **Role-based authorization** (`authorize(...roles)` middleware) on every protected route.
- **Company-level ownership checks**: a recruiter can only see or modify their own company's jobs, applicants and interviews.
- Public sign-up is limited to Candidate / Company Admin. Super Admins can only be created on the server.
- **Blocked users** are refused immediately, even with a valid token.
- **Input validation** and field whitelisting on job and profile updates.
- Secrets live in environment variables (`.env` is git-ignored, `.env.example` is provided).

---

## 💻 Run Locally

**Prerequisites:** Node.js 18+, a PostgreSQL database (local or a free [Neon](https://neon.tech) database).

### 1. Clone
```bash
git clone https://github.com/ganesh5437/talenthub.git
cd talenthub
```

### 2. Backend
```bash
cd server
cp .env.example .env        # add your DATABASE_URL and JWT_SECRET
npm install                 # also runs "prisma generate"
npx prisma migrate deploy   # create the tables
npm run create-admin -- "Admin Name" admin@example.com StrongPass123
npm run dev                 # API on http://localhost:5000
```

### 3. Frontend (new terminal)
```bash
cd client
npm install
npm run dev                 # app on http://localhost:5173
```

### Environment variables

| File | Variable | Example |
|---|---|---|
| `server/.env` | `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` |
| `server/.env` | `JWT_SECRET` | any long random string |
| `server/.env` | `CORS_ORIGIN` *(optional)* | `http://localhost:5173` |
| `client/.env` *(optional)* | `VITE_API_URL` | `http://localhost:5000/api` (default) |

### Useful scripts

| Folder | Command | Description |
|---|---|---|
| `server` | `npm run dev` | API with auto-reload |
| `server` | `npm start` | API in production mode |
| `server` | `npm test` | Run unit tests |
| `server` | `npm run create-admin -- "Name" email pass` | Create / promote a Super Admin |
| `client` | `npm run dev` | Frontend dev server |
| `client` | `npm run build` | Production build into `client/dist` |
| `client` | `npm run lint` | Lint the frontend |

---

## 🧪 Testing

```bash
cd server
npm test
```

The unit tests check the hiring-pipeline rules: rejected and hired applications are locked, the pipeline only moves forward, and interviews are scheduled only at the right stages.

---

## 🚀 Deployment

| Part | Platform | Settings |
|---|---|---|
| **Frontend** | Netlify | Base dir `client` · Build `npm run build` · Publish `client/dist` · Env `VITE_API_URL` |
| **Backend** | Render (Web Service) | Root dir `server` · Build `npm install && npx prisma migrate deploy` · Start `npm start` · Env `DATABASE_URL`, `JWT_SECRET` |
| **Database** | Neon | Managed PostgreSQL |

Every merge into `main` redeploys both Netlify and Render automatically.

> The Render free tier sleeps after ~15 minutes of inactivity. The first request can take up to a minute.

---

## 📁 Project Structure

```
talenthub/
├── client/                     # React frontend
│   ├── public/                 # favicon, _redirects (SPA routing on Netlify)
│   └── src/
│       ├── api/                # Axios instance, per-tab auth storage
│       ├── components/         # Navbar, UI kit, StatusBadge, PipelineProgress, ConfirmDialog
│       ├── context/            # AuthContext (session, role-based routing)
│       ├── pages/
│       │   ├── auth/           # Login, Register
│       │   ├── candidate/      # Browse jobs, My applications, Profile
│       │   ├── recruiter/      # My jobs, Post job, Applicants
│       │   ├── company/        # Company dashboard, Register company
│       │   ├── admin/          # Super Admin dashboard
│       │   └── Landing.jsx
│       └── utils/              # Pipeline labels, formatters
└── server/                     # Express backend
    ├── prisma/                 # schema.prisma + migrations
    ├── scripts/                # createAdmin.js
    ├── src/
    │   ├── config/             # Prisma client
    │   ├── controllers/        # Business logic per resource
    │   ├── middleware/         # protect (JWT) + authorize (roles)
    │   ├── routes/             # REST routes
    │   └── utils/              # applicationPipeline (state machine), access (ownership), jwt
    ├── test/                   # Unit tests
    └── server.js               # App entry point
```

---

## 🔮 Future Enhancements

- Resume file upload (PDF) with cloud storage
- Email notifications for interviews and decisions
- Real-time notifications using WebSockets
- Job categories, departments and advanced filters in the UI
- Analytics charts (time-to-hire, pipeline conversion)
- Candidate–job skill matching score

---

## 👨‍💻 Author

**Yenduru Ganesh**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Yenduru%20Ganesh-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/yenduru-ganesh-5437143m)
[![GitHub](https://img.shields.io/badge/GitHub-ganesh5437-181717?logo=github&logoColor=white)](https://github.com/ganesh5437)

<div align="center">

⭐ If you found this project useful, consider giving it a star!

</div>
