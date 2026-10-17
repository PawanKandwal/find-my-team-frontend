# Find My Team — React frontend

A responsive React + Vite frontend for the Find My Team Spring Boot backend.

## Run it
1. Install Node.js LTS from https://nodejs.org/
2. Extract this ZIP and open the extracted folder in VS Code.
3. Open the VS Code terminal in this folder and run:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` (the default URL is already set).
5. Start the frontend:
   ```bash
   npm run dev
   ```
6. Open the URL Vite prints, usually http://localhost:5173.

## Backend
Default API base URL: `http://localhost:2011`. Start the Spring Boot backend separately.
The frontend uses Axios and sends `Authorization: Bearer <token>` for protected calls.

## Important integration notes
This frontend is designed around the API routes discussed for the backend:
- `POST /api/auth/register`, `POST /api/auth/login`
- `/api/students`, `/api/teams`, `/api/teams/{teamId}/members`
- `/api/matchmaking`, `POST /api/scheduling/simulate`

The exact request/response fields can differ by backend implementation. API calls are centralized in `src/api.js`; adjust mappings there if your actual DTOs differ. A student must already exist in the backend roster if the backend registration flow requires it. If login/API requests fail, check that the backend is running, database is configured, and CORS permits `http://localhost:5173`.

## Features
- Login/register screens
- Dashboard, explore teams, team details, create team, my teams, profile
- Skill-based matchmaking screen
- OS scheduling simulator (FCFS, SJF, Priority, Round Robin)
- Search, filters, responsive sidebar, loading/error/empty states
- Demo preview mode when API data is unavailable (clearly marked as demo)
