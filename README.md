# Workflow Engine API - Usage Examples

Complete examples for using the Workflow Engine API with domain-specific endpoints.

## Start the Server

```bash
cd backend
uvicorn app.main:app --reload
```

Server will run at: `http://localhost:8000`

---

## 1. Create Users

```bash
# PRO user (submits NOC, RENTAL, FINANCE)
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "role": "PRO"}'
# Response: {"id": 1, "name": "Alice", "role": "PRO"}

# OFFICER user (reviews NOC at stage 1)
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob", "role": "OFFICER"}'
# Response: {"id": 2, "name": "Bob", "role": "OFFICER"}

# CONTROLLER user (reviews NOC stage 2, FINANCE stage 2, RENTAL)
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Charlie", "role": "CONTROLLER"}'
# Response: {"id": 3, "name": "Charlie", "role": "CONTROLLER"}

# HEAD user (final NOC approval)
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Diana", "role": "HEAD"}'
# Response: {"id": 4, "name": "Diana", "role": "HEAD"}

# USER (submits LOA, RENTAL, CANCELLATION)
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Eve", "role": "USER"}'
# Response: {"id": 5, "name": "Eve", "role": "USER"}

# ADMIN (approves LOA, CANCELLATION)
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Frank", "role": "ADMIN"}'
# Response: {"id": 6, "name": "Frank", "role": "ADMIN"}

# FINANCE user (confirms FINANCE requests)
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Grace", "role": "FINANCE"}'
# Response: {"id": 7, "name": "Grace", "role": "FINANCE"}
```

---

## 2. Get All Users

```bash
curl http://localhost:8000/api/v1/users
```

---

## 3. NOC Workflow

**States:** `DRAFT → OFFICER_REVIEW → CONTROLLER_REVIEW → HEAD_APPROVAL → APPROVED`
**Rejection possible at:** OFFICER_REVIEW, CONTROLLER_REVIEW, HEAD_APPROVAL
**Revert possible at:** OFFICER_REVIEW (back to DRAFT)

### Create NOC

```bash
curl -X POST http://localhost:8000/api/v1/noc \
  -H "Content-Type: application/json"

# Response: {"noc_id": "uuid", "status": "DRAFT"}
```

### Get All NOCs

```bash
curl http://localhost:8000/api/v1/noc

# Response: [{"noc_id": "uuid", "status": "DRAFT", "version": 1}, ...]
```

### Step 1: PRO Submits (DRAFT → OFFICER_REVIEW)

```bash
curl -X POST "http://localhost:8000/api/v1/noc/{noc_id}/submit?user_id=1"

# Response: {"entity": "NOC", "entity_id": "{noc_id}", "current_state": "OFFICER_REVIEW"}
```

### Step 2: Officer Approves (OFFICER_REVIEW → CONTROLLER_REVIEW)

```bash
curl -X POST "http://localhost:8000/api/v1/noc/{noc_id}/approve?user_id=2"

# Response: {"entity": "NOC", "entity_id": "{noc_id}", "current_state": "CONTROLLER_REVIEW"}
```

### Step 3: Controller Approves (CONTROLLER_REVIEW → HEAD_APPROVAL)

```bash
curl -X POST "http://localhost:8000/api/v1/noc/{noc_id}/approve?user_id=3"

# Response: {"entity": "NOC", "entity_id": "{noc_id}", "current_state": "HEAD_APPROVAL"}
```

### Step 4: Head Final Approval (HEAD_APPROVAL → APPROVED)

```bash
curl -X POST "http://localhost:8000/api/v1/noc/{noc_id}/approve?user_id=4"

# Response: {"entity": "NOC", "entity_id": "{noc_id}", "current_state": "APPROVED"}
```

### Reject NOC (any review stage)

```bash
curl -X POST "http://localhost:8000/api/v1/noc/{noc_id}/reject?user_id=2"

# Response: {"entity": "NOC", "entity_id": "{noc_id}", "current_state": "REJECTED"}
```

### Revert NOC to DRAFT (Officer only)

```bash
curl -X POST "http://localhost:8000/api/v1/noc/{noc_id}/revert?user_id=2"

# Response: {"entity": "NOC", "entity_id": "{noc_id}", "current_state": "DRAFT"}
```

---

## 4. LOA Workflow

**States:** `DRAFT → ADMIN_REVIEW → APPROVED / REJECTED`

### Create LOA

```bash
curl -X POST http://localhost:8000/api/v1/loa \
  -H "Content-Type: application/json"

# Response: {"loa_id": "uuid", "status": "DRAFT"}
```

### Get All LOAs

```bash
curl http://localhost:8000/api/v1/loa

# Response: [{"loa_id": "uuid", "status": "DRAFT", "version": 1}, ...]
```

### Step 1: User Submits (DRAFT → ADMIN_REVIEW)

```bash
curl -X POST "http://localhost:8000/api/v1/loa/{loa_id}/submit?user_id=5"

# Response: {"entity": "LOA", "entity_id": "{loa_id}", "current_state": "ADMIN_REVIEW"}
```

### Step 2: Admin Approves (ADMIN_REVIEW → APPROVED)

```bash
curl -X POST "http://localhost:8000/api/v1/loa/{loa_id}/approve?user_id=6"

# Response: {"entity": "LOA", "entity_id": "{loa_id}", "current_state": "APPROVED"}
```

### Reject LOA

```bash
curl -X POST "http://localhost:8000/api/v1/loa/{loa_id}/reject?user_id=6"

# Response: {"entity": "LOA", "entity_id": "{loa_id}", "current_state": "REJECTED"}
```

---

## 5. Finance Workflow

**States:** `PENDING → CONTROLLER_APPROVAL → FINANCE_CONFIRMATION → COMPLETED`

### Create Finance Request

```bash
curl -X POST http://localhost:8000/api/v1/finance \
  -H "Content-Type: application/json"

# Response: {"finance_id": "uuid", "status": "PENDING"}
```

### Step 1: PRO Submits (PENDING → CONTROLLER_APPROVAL)

```bash
curl -X POST "http://localhost:8000/api/v1/finance/{finance_id}/submit?user_id=1"

# Response: {"entity": "FINANCE", "entity_id": "{finance_id}", "current_state": "CONTROLLER_APPROVAL"}
```

### Step 2: Controller Approves (CONTROLLER_APPROVAL → FINANCE_CONFIRMATION)

```bash
curl -X POST "http://localhost:8000/api/v1/finance/{finance_id}/approve?user_id=3"

# Response: {"entity": "FINANCE", "entity_id": "{finance_id}", "current_state": "FINANCE_CONFIRMATION"}
```

### Step 3: Finance Confirms (FINANCE_CONFIRMATION → COMPLETED)

```bash
curl -X POST "http://localhost:8000/api/v1/finance/{finance_id}/confirm?user_id=7"

# Response: {"entity": "FINANCE", "entity_id": "{finance_id}", "current_state": "COMPLETED"}
```

---

## 6. Rental Workflow

**States:** `DRAFT → UNDER_REVIEW → APPROVED → SIGNED`

### Create Rental Request

```bash
curl -X POST http://localhost:8000/api/v1/rental \
  -H "Content-Type: application/json"

# Response: {"rental_id": "uuid", "status": "DRAFT"}
```

### Step 1: User Submits (DRAFT → UNDER_REVIEW)

```bash
curl -X POST "http://localhost:8000/api/v1/rental/{rental_id}/submit?user_id=5"

# Response: {"entity": "RENTAL", "entity_id": "{rental_id}", "current_state": "UNDER_REVIEW"}
```

### Step 2: Controller Approves (UNDER_REVIEW → APPROVED)

```bash
curl -X POST "http://localhost:8000/api/v1/rental/{rental_id}/approve?user_id=3"

# Response: {"entity": "RENTAL", "entity_id": "{rental_id}", "current_state": "APPROVED"}
```

### Step 3: PRO Signs (APPROVED → SIGNED)

```bash
curl -X POST "http://localhost:8000/api/v1/rental/{rental_id}/sign?user_id=1"

# Response: {"entity": "RENTAL", "entity_id": "{rental_id}", "current_state": "SIGNED"}
```

---

## 7. Cancellation Workflow

**States:** `REQUESTED → UNDER_REVIEW → APPROVED / REJECTED`

### Create Cancellation Request

```bash
curl -X POST http://localhost:8000/api/v1/cancellation \
  -H "Content-Type: application/json"

# Response: {"cancellation_id": "uuid", "status": "REQUESTED"}
```

### Step 1: User Submits (REQUESTED → UNDER_REVIEW)

```bash
curl -X POST "http://localhost:8000/api/v1/cancellation/{cancellation_id}/submit?user_id=5"

# Response: {"entity": "CANCELLATION", "entity_id": "{cancellation_id}", "current_state": "UNDER_REVIEW"}
```

### Step 2: Admin Approves (UNDER_REVIEW → APPROVED)

```bash
curl -X POST "http://localhost:8000/api/v1/cancellation/{cancellation_id}/approve?user_id=6"

# Response: {"entity": "CANCELLATION", "entity_id": "{cancellation_id}", "current_state": "APPROVED"}
```

### Reject Cancellation

```bash
curl -X POST "http://localhost:8000/api/v1/cancellation/{cancellation_id}/reject?user_id=6"

# Response: {"entity": "CANCELLATION", "entity_id": "{cancellation_id}", "current_state": "REJECTED"}
```

---

## 8. Error Examples

### Permission Denied

```bash
# OFFICER tries to submit NOC (only PRO can)
curl -X POST "http://localhost:8000/api/v1/noc/{noc_id}/submit?user_id=2"

# Response (400):
# {"detail": "User role 'OFFICER' not authorized for this action. Required roles: PRO"}
```

### Invalid Transition

```bash
# PRO tries to approve NOC from DRAFT
curl -X POST "http://localhost:8000/api/v1/noc/{noc_id}/approve?user_id=1"

# Response (400):
# {"detail": "No transition from 'DRAFT' with action 'APPROVE' for entity 'NOC'"}
```

### User Not Found

```bash
curl -X POST "http://localhost:8000/api/v1/noc/{noc_id}/submit?user_id=999"

# Response (404):
# {"detail": "User not found"}
```

---

## 9. API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json
