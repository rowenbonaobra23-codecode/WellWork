## WorkWell Local Setup

Spin up the Express API and the Vite/React client locally to try the login +
registration flow end to end.

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Backend (Express API)
```powershell
cd backend
npm install
```

Optional `.env` (values shown are defaults):
```
PORT=5000
JWT_SECRET=workwell-dev-secret
```

Start the API:
```powershell
npm run dev     # auto-restarts on save
# or
npm start       # plain node
```

The server exposes:
- `POST /register` → create a user (stored in `user.json`)
- `POST /login` → returns a short-lived JWT and user profile
- `GET /health` → simple readiness probe used by the React app

### 2. Frontend (Vite + React)
```powershell
cd frontend
npm install
```

Optional `.env` for a custom API URL:
```
VITE_API_URL=http://localhost:5000
```

Launch the dev server:
```powershell
npm run dev
```

Open the printed URL (usually `http://localhost:5173`) and you will see:
- Tabs to toggle between **Register** and **Log in**
- Inline validation + error handling
- A backend connectivity badge so you know the API is up

After registering, the UI switches to the login tab and shows a success notice.
Logging in displays the returned user info plus the JWT (truncated) and enables
a one-click logout.

### 3. Helpful Tips
- Data is persisted only in `backend/user.json`; delete the file to reset.
- Keep backend and frontend running in separate terminals so both stay live.
- When changing ports, update `VITE_API_URL` so the client knows where to send
  requests.


