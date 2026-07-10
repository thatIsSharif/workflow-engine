# Workflow Engine — Design Document

## 1. Overview

The Workflow Engine is a generic, config-driven state machine API built with
FastAPI and SQLAlchemy. It manages multi-step approval workflows for business
entities (NOC, LOA, Finance, Rental, Cancellation) with role-based access
control at each transition.

### Goals

- **Config-driven**: Workflow rules live in JSON, not code. Adding or modifying
  a workflow does not require application changes.
- **Role-based transitions**: Every state transition is guarded by allowed user
  roles.
- **Pluggable entities**: New business entities can be added by defining states,
  transitions, and an API router.
- **Auditable**: All state changes are recorded with who performed them and
  when.

---

## 2. Architecture

### 2.1 Layered Architecture

```
┌─────────────────────────────────────────────┐
│  Layer 1 — Domain API Routers               │
│  (noc.py, loa.py, finance.py, rental.py,     │
│   cancellation.py)                           │
├─────────────────────────────────────────────┤
│  Layer 2 — Workflow Engine                   │
│  (WorkflowService → WorkflowEngine →         │
│   WorkflowValidator → ConfigLoader →         │
│   WorkflowRepository)                        │
├─────────────────────────────────────────────┤
│  Layer 3 — Persistence                       │
│  (PostgreSQL + Alembic migrations)           │
└─────────────────────────────────────────────┘
```

#### Layer 1 — Domain API Routers

Thin endpoint modules that:

- Define REST endpoints for each entity (`/noc/`, `/loa/`, `/finance/`, etc.)
- Extract path/query parameters
- Delegate to `WorkflowService`
- Map results to HTTP responses with proper status codes

Each router follows the same pattern: create, submit, approve/reject, and
entity-specific actions (revert, sign, confirm).

#### Layer 2 — Workflow Engine

The core engine consists of five components:

| Component | Responsibility |
|-----------|---------------|
| `WorkflowService` | Orchestrates actions, fetches/persists instances, calls engine |
| `WorkflowEngine` | Executes transitions, checks permissions, lists available actions |
| `WorkflowValidator` | Validates entity existence, state, transition, and role permissions |
| `ConfigLoader` | Loads and parses `workflows.json`; caches config in memory |
| `WorkflowRepository` | Data access layer with optimistic locking via version numbers |

#### Layer 3 — Persistence

- **PostgreSQL** stores workflow instances and history.
- **Alembic** manages schema migrations.
- **workflows.json** holds the static workflow definitions (states and
  transitions).

### 2.2 Request Flow

```
Client → Router → _workflow_helpers.execute_workflow_action()
               → WorkflowService.execute_action()
               → WorkflowEngine.execute_transition()
               → WorkflowValidator.validate_transition()
               → ConfigLoader.find_transition()
               ← TransitionResult
               → WorkflowRepository.add_history_and_update_state()
               ← Updated WorkflowInstance
               ← HTTP Response
```

---

## 3. Data Model

### 3.1 Users

```yaml
User:
  id: int (PK)
  name: str
  role: Role (enum: PRO, OFFICER, CONTROLLER, HEAD, USER, ADMIN, FINANCE)
```

Users are created via a dedicated endpoint and referenced by workflows.

### 3.2 Workflow Instance

```yaml
WorkflowInstance:
  id: int (PK)
  entity_type: str      # e.g., "NOC", "LOA"
  entity_id: uuid       # Unique identifier for the business entity
  state: str            # Current workflow state
  version: int          # Optimistic lock version
  submitter_id: int?    # FK to User who submitted
  created_at: datetime
  updated_at: datetime
```

Indexed on `(entity_type, entity_id)` for lookups and `(entity_type, state)`
for status queries.

### 3.3 Workflow History

```yaml
WorkflowHistory:
  id: int (PK)
  workflow_instance_id: int (FK)
  from_state: str
  to_state: str
  action: str
  user_id: int (FK)
  created_at: datetime
```

Append-only log of every state transition.

### 3.4 Optimistic Locking

The `version` column on `WorkflowInstance` is incremented on every state change.
Updates use `WHERE version = <expected>`, raising a 409 Conflict on concurrent
modification.

---

## 4. Workflow Configuration

Workflows are defined in `backend/app/workflow/config/workflows.json`.

### 4.1 Structure

```json
{
  "NOC": {
    "states": [
      "DRAFT",
      "OFFICER_REVIEW",
      "CONTROLLER_REVIEW",
      "HEAD_APPROVAL",
      "APPROVED",
      "REJECTED"
    ],
    "transitions": {
      "DRAFT:SUBMIT": {
        "to": "OFFICER_REVIEW",
        "roles": ["PRO"]
      }
    }
  }
}
```

Each workflow defines:

- **states**: Ordered list of valid states
- **transitions**: Map of `"<from_state>:<action>"` → target state and
  allowed roles

### 4.2 Configuration Validation

On startup, `validate_workflow_config()` checks:

- All referenced states exist in the states list
- All transitions reference valid source states
- Roles in transitions reference valid role names
- No duplicate transition keys

---

## 5. Workflows

### 5.1 NOC (No Objection Certificate)

```
DRAFT ──SUBMIT──→ OFFICER_REVIEW ──APPROVE──→ CONTROLLER_REVIEW
                    │  ↑                        │  ↑
                    │  └──REVERT──┘              │  └──REVERT──┘
                    │                            │
                    └──REJECT──→ REJECTED        └──REJECT──→ REJECTED

CONTROLLER_REVIEW ──APPROVE──→ HEAD_APPROVAL ──APPROVE──→ APPROVED
                                  │  ↑
                                  │  └──REVERT──┘
                                  │
                                  └──REJECT──→ REJECTED
```

### 5.2 LOA (Leave of Absence)

```
DRAFT ──SUBMIT──→ ADMIN_REVIEW ──APPROVE──→ APPROVED
                    │  ↑           └──REJECT──→ REJECTED
                    │  └──REVERT──┘
```

### 5.3 Finance

```
PENDING ──SUBMIT──→ CONTROLLER_APPROVAL ──APPROVE──→ FINANCE_CONFIRMATION
                       │  ↑                            │  ↑
                       │  └──REVERT──┘                  │  └──REVERT──┘
                       │                                │
                       └──REJECT──→ REJECTED            └──CONFIRM──→ COMPLETED
```

### 5.4 Rental

```
DRAFT ──SUBMIT──→ UNDER_REVIEW ──APPROVE──→ APPROVED ──SIGN──→ SIGNED
                    │  ↑           └──REJECT──→ REJECTED
                    │  └──REVERT──┘
```

### 5.5 Cancellation

```
REQUESTED ──SUBMIT──→ UNDER_REVIEW ──APPROVE──→ APPROVED
                        │  ↑           └──REJECT──→ REJECTED
                        │  └──REVERT──┘
```

---

## 6. API Design

All endpoints follow a consistent pattern.

### 6.1 Endpoint Conventions

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/users` | Create a user |
| GET | `/api/v1/users` | List all users |
| POST | `/api/v1/{entity}` | Create a workflow instance |
| GET | `/api/v1/{entity}` | List all instances |
| POST | `/api/v1/{entity}/{id}/submit` | Submit for review |
| POST | `/api/v1/{entity}/{id}/approve` | Approve |
| POST | `/api/v1/{entity}/{id}/reject` | Reject |
| POST | `/api/v1/{entity}/{id}/revert` | Revert to previous state |
| POST | `/api/v1/{entity}/{id}/sign` | Sign (entity-specific) |
| POST | `/api/v1/{entity}/{id}/confirm` | Confirm (entity-specific) |

### 6.2 Response Format

**Success (200):**
```json
{
  "entity": "NOC",
  "entity_id": "uuid",
  "current_state": "OFFICER_REVIEW"
}
```

**Error (4xx/5xx):**
```json
{
  "detail": "User role 'OFFICER' not authorized for this action. Required roles: PRO",
  "error_code": "HTTP_ERROR",
  "request_id": "uuid"
}
```

### 6.3 Error Codes

| Status | Code | When |
|--------|------|------|
| 400 | `WORKFLOW_ERROR` | Invalid transition, wrong role, wrong state |
| 404 | `NOT_FOUND` | Entity or user not found |
| 409 | `CONFLICT` | Optimistic lock version mismatch |
| 422 | `VALIDATION_ERROR` | Request validation failure |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error |

---

## 7. Security

### 7.1 Role-Based Access Control

Each transition in the workflow config declares which user roles are permitted
to execute it. The `WorkflowValidator` checks the requesting user's role against
the allowed roles for the transition.

Roles: `PRO`, `OFFICER`, `CONTROLLER`, `HEAD`, `USER`, `ADMIN`, `FINANCE`

### 7.2 Request ID Tracking

Every request receives a `X-Request-ID` header (auto-generated if not
provided). This ID flows through logs and error responses for traceability.

---

## 8. Testing

Tests are located in `backend/tests/` and use pytest. Key test areas:

- Workflow configuration validation (startup checks)
- Transition validation (state, role, action combinations)
- Service-layer orchestration
- API endpoint integration tests

---

## 9. Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI (Python 3.10+) |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Testing | pytest, httpx |
| Server | Uvicorn |

---

## 10. Future Considerations

- **Notifications**: Post-transition hooks for email/SMS/Slack alerts
- **Webhooks**: External system callbacks on state changes
- **Approval chains**: Dynamic assignment of reviewers based on rules
- **Escalation**: Auto-escalation of stale approvals
- **Multi-tenancy**: Namespaced workflows per tenant
- **Dashboard**: Real-time workflow status via WebSocket
