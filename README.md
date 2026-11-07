# TalentHub — Recruitment & ATS Platform

Full-stack Applicant Tracking System with 4 role-based portals: **Super Admin**, **Company Admin**, **Recruiter** and **Candidate**.

**Live:** https://talenthub-app.netlify.app · **API:** https://talenthub-274q.onrender.com/api

## Features
- Complete ATS pipeline: job posting → application → screening → interview → offer → hire
- **Final decisions are locked** — once an application is *Rejected* or *Hired* it can never be changed (enforced on the server, with a confirmation dialog in the UI)
- Pipeline only moves forward (stages can be skipped, never reversed)
- Interview scheduling (multiple rounds, pass / fail results)
- Company approval workflow — companies can post jobs only after the Super Admin approves them
- Company Admins add their own recruiters
- Candidate profiles (skills, education, resume / LinkedIn / portfolio links)
- Notification bell (polling) for status changes, interviews, new applications and approvals
- Role-based + company-based access control (a recruiter can only see / edit their own company's jobs and applicants)
- Each browser tab keeps its own login, so different roles can be demoed side by side

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Auth | JWT + bcrypt |
| Hosting | Backend on Render, Frontend on Netlify |

## Roles & how they work together
1. **Company Admin** registers → registers the company → waits for approval.
2. **Super Admin** approves the company (Admin dashboard → Companies → Approve).
3. **Company Admin** adds recruiters (Company dashboard → *Add a recruiter*) and/or posts jobs.
4. **Recruiter** logs in with the email + temporary password from the admin → posts jobs.
5. **Candidate** registers, fills the profile, browses jobs and applies.
6. **Recruiter** opens *View applicants* → moves candidates forward, schedules interviews, records results, then **Hire** or **Reject** (final).

### Application pipeline rules
```
Applied → Under Review → Shortlisted → Interview Scheduled → Selected → Offer Released → Hired 🔒
   └──────────────────────── any active stage ───────────────────────────→ Rejected 🔒
```
- Forward only; stages may be skipped.
- *Interview Scheduled* is set by **Schedule interview** (so there is always a real interview).
- *Hired* and *Rejected* are terminal. Logic: [`server/src/utils/applicationPipeline.js`](server/src/utils/applicationPipeline.js), tests: [`server/test`](server/test).

## Run locally

### 1. Backend
```bash
cd server
cp .env.example .env      # then put your DATABASE_URL and JWT_SECRET in .env
npm install               # also runs "prisma generate"
npx prisma migrate deploy # creates the tables
npm run create-admin -- "Admin Name" admin@example.com StrongPass123
npm run dev               # http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev               # http://localhost:5173 (uses http://localhost:5000/api by default)
```

### Useful scripts
| Folder | Command | What it does |
|---|---|---|
| server | `npm run dev` | API with auto-reload |
| server | `npm start` | API (production) |
| server | `npm test` | Pipeline unit tests |
| server | `npm run create-admin -- "Name" email pass` | Create / promote a Super Admin |
| client | `npm run dev` | Frontend dev server |
| client | `npm run build` | Production build into `client/dist` |
| client | `npm run lint` | Lint |

## Deployment

### Backend — Render (Web Service)
| Setting | Value |
|---|---|
| Root directory | `server` |
| Build command | `npm install && npx prisma migrate deploy` |
| Start command | `npm start` |
| Environment | `DATABASE_URL`, `JWT_SECRET`, optionally `CORS_ORIGIN=https://talenthub-app.netlify.app` |

Render free tier sleeps after ~15 min. Open the API URL ~1 minute before a demo to wake it up.

### Frontend — Netlify
| Setting | Value |
|---|---|
| Base directory | `client` |
| Build command | `npm run build` |
| Publish directory | `client/dist` |
| Environment | `VITE_API_URL=https://talenthub-274q.onrender.com/api` (also in `client/.env.production`) |

`client/public/_redirects` makes page refreshes on routes like `/recruiter/post-job` work on Netlify.

## Project structure
```
client/src
  api/          axios instance + per-tab auth storage
  components/   Navbar/AppLayout, UI kit, StatusBadge, PipelineProgress, ConfirmDialog
  context/      AuthContext (session, role-based home)
  pages/        Landing, auth/, candidate/, recruiter/, company/, admin/
  utils/        pipeline labels & formatters
server/
  prisma/       schema + migrations
  scripts/      createAdmin.js
  src/
    controllers/  business logic per resource
    middleware/   protect (JWT) + authorize (roles)
    routes/       REST routes
    utils/        applicationPipeline (state machine), access (company ownership)
  test/         node:test unit tests
```

## Author
Yenduru Ganesh — [LinkedIn](https://www.linkedin.com/in/yenduru-ganesh-5437143m) | [GitHub](https://github.com/ganesh5437)
