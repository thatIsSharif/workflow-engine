# Workflow Engine

A full-stack workflow management application with a **FastAPI** backend and a **Next.js** frontend. The engine supports multiple configurable workflow types (NOC, LOA, Finance, Rental, Cancellation) with role-based state transitions, approval chains, and a modern dashboard UI.

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                  Frontend (Next.js)               │
│  Dashboard │ NOC │ LOA │ Finance │ Rental │ Cancel│
│  Role-based UI · Client-side navigation · Skeleton│
└──────────────────┬───────────────────────────────┘
                   │ HTTP (REST API)
┌──────────────────▼───────────────────────────────┐
│               Backend (FastAPI)                   │
│  ┌─────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Routes  │ │ Services │ │ Workflow Engine  │   │
│  └─────────┘ └──────────┘ └──────────────────┘   │
│  ┌─────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │  Models  │ │  Schemas  │ │  Repositories   │   │
│  └─────────┘ └──────────┘ └──────────────────┘   │
└──────────────────┬───────────────────────────────┘
                   │ SQL
┌──────────────────▼───────────────────────────────┐
│              PostgreSQL Database                  │
│  users · workflow_instances · workflow_transitions│
└──────────────────────────────────────────────────┘
```

## Tech Stack

| Layer  | Technology |
|--------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Backend**  | Python 3.10+, FastAPI, SQLAlchemy, Alembic |
| **Database** | PostgreSQL |
| **Auth**     | Role-based access control (PRO, OFFICER, CONTROLLER, HEAD, USER, ADMIN, FINANCE) |

---

## Project Structure

```
workflow-engine/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Config, DB session, dependencies
│   │   ├── models/       # SQLAlchemy models
│   │   ├── repositories/ # Data access layer
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── services/     # Business logic
│   │   ├── workflow/     # Workflow engine core
│   │   └── main.py       # FastAPI application entrypoint
│   ├── tests/
│   ├── alembic/          # Database migrations
│   └── EXAMPLE_USAGE.md  # API usage examples
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   │   ├── cancellation/
│   │   │   ├── finance/
│   │   │   ├── loa/
│   │   │   ├── noc/
│   │   │   ├── rental/
│   │   │   ├── users/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx  # Dashboard
│   │   ├── lib/          # Utilities, context
│   │   └── types/        # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
└── docs/
```

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL** (or Docker)
- **pip** and **npm**

---

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/thatIsSharif/workflow-engine.git
cd workflow-engine
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs at `http://localhost:3000`.

---

## Workflows

The engine supports five workflow types, each with its own state machine and role-based transitions:

| Workflow      | States |
|---------------|--------|
| **NOC**       | `DRAFT → OFFICER_REVIEW → CONTROLLER_REVIEW → HEAD_APPROVAL → APPROVED` (can reject/revert) |
| **LOA**       | `DRAFT → ADMIN_REVIEW → APPROVED / REJECTED` |
| **Finance**   | `PENDING → CONTROLLER_APPROVAL → FINANCE_CONFIRMATION → COMPLETED` |
| **Rental**    | `DRAFT → UNDER_REVIEW → APPROVED → SIGNED` |
| **Cancellation** | `REQUESTED → UNDER_REVIEW → APPROVED / REJECTED` |

Each transition is guarded by role checks (e.g., only a `PRO` can submit a NOC; only an `OFFICER` can approve at the first NOC review stage).

---

## API Reference

See [`backend/EXAMPLE_USAGE.md`](backend/EXAMPLE_USAGE.md) for complete API usage examples with `curl` and Python.

### Quick Start

```bash
# Create a user
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "role": "PRO"}'

# Submit a NOC
curl -X POST "http://localhost:8000/api/v1/noc/{noc_id}/submit?user_id=1"

# Check available actions
curl "http://localhost:8000/api/v1/noc/{noc_id}/available-actions?user_id=1"

# View workflow history
curl http://localhost:8000/api/v1/noc/{noc_id}/history
```

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json
