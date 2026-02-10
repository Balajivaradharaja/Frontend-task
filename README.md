# PulseBoard - Frontend Developer Intern Assignment

## Summary
Full-stack app with JWT auth, protected dashboard, profile management, task CRUD, and email-based password reset. Upgraded with an innovative signal-style dashboard featuring analytics charts, drag-and-drop Kanban, tags, confidence scoring, activity timeline, and real RBAC. Built with React + Tailwind on the frontend and Node/Express + MongoDB on the backend.

## Quick Start

### 1) Backend
1. Copy `.env.example` to `.env` in `backend/` and fill values.
1. Run:

```bash
cd backend
npm install
npm run dev
```

### 2) Frontend
1. Copy `.env.example` to `.env` in `frontend/` (optional if using default local URL).
1. Run:

```bash
cd frontend
npm install
npm run dev
```

App will run on `http://localhost:5173` and talk to backend on `http://localhost:5000`.

## API Docs

### Auth
- `POST /api/auth/register`
  - Body: `{ "name": "Jane", "email": "jane@mail.com", "password": "secret123" }`
- `POST /api/auth/login`
  - Body: `{ "email": "jane@mail.com", "password": "secret123" }`
- `POST /api/auth/forgot-password`
  - Body: `{ "email": "jane@mail.com" }`
- `POST /api/auth/reset-password`
  - Body: `{ "email": "jane@mail.com", "token": "...", "password": "newpass123" }`

### Profile (JWT required)
- `GET /api/profile/me`
- `PUT /api/profile/me`
  - Body: `{ "name": "Jane", "email": "jane@mail.com" }`

### Tasks/Signals (JWT required)
- `GET /api/tasks?q=search&status=todo&priority=high&category=research`
- `POST /api/tasks`
  - Body: `{ "title": "BTC momentum", "description": "Breakout watch", "status": "todo", "priority": "high", "dueDate": "2026-02-15", "tags": ["btc", "momentum"], "confidence": 78, "category": "trade" }`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

## RBAC
- `analyst`: can create/read/update/delete own tasks.
- `manager`: can view and update all tasks, delete only own.
- `founder`: full access (view/update/delete all tasks).

## Security Notes
- Passwords are hashed with bcrypt.
- JWT middleware protects all dashboard APIs.
- Server-side validation on auth + profile + tasks.
- Reset tokens are hashed and expire in 30 minutes.

## Scaling Notes (Production)
- Split backend into controllers/services/repositories and add request-level logging.
- Use refresh tokens + rotation, and store access tokens in httpOnly cookies.
- Add pagination + indexes on task queries (status, priority, user).
- Use a reverse proxy (Nginx) and Docker for consistent deployment.
- Add rate limiting, centralized error tracking, and API monitoring.

## Folder Structure
```
backend/src
  config/
  middleware/
  models/
  routes/
frontend/src
  api/
  components/
  context/
  pages/
```
