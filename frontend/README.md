# Workflow Engine Frontend

A Next.js frontend for the Workflow Engine backend API. Provides a business-friendly UI for creating applications, viewing workflow status and history, and performing workflow actions.

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:8000`

### Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000` and proxy API requests to the backend at `http://localhost:8000` via the Next.js rewrite config.

### Pages

| Route | Description |
|-------|-------------|
| `/` | User selection (no authentication) |
| `/dashboard` | Dashboard with module summary cards and recent applications |
| `/applications` | Module selection for browsing applications |
| `/applications/:module` | List all applications for a module |
| `/applications/create` | Create a new application (all modules) |
| `/applications/:module/:id` | Application detail with workflow status, history timeline, and action buttons |

### Features

- **User selection** — Pick or create a user to act as (no real authentication)
- **Dashboard** — Overview of all modules with counts and recent applications
- **Module-specific lists** — Filterable lists for NOC, LOA, Finance, Rental, Cancellation
- **Create forms** — Tailored forms for each application type
- **Detail view** — Full application details with workflow status
- **Workflow timeline** — Visual history of all state transitions
- **Role-based actions** — Available workflow actions determined dynamically from workflow configuration and user role
- **Responsive design** — Works on desktop and mobile

### Architecture

The frontend uses Next.js App Router with Tailwind CSS. API calls are proxied through Next.js rewrites to avoid CORS issues. Workflow configuration (states, transitions, role permissions) is embedded in the frontend to determine available actions dynamically.
