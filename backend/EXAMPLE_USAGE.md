# Workflow Engine API - Usage Examples

Complete examples for using the Workflow Engine API.

## Start the Server

```bash
cd backend
uvicorn app.main:app --reload
```

Server will run at: `http://localhost:8000`

## 1. Create Users

Create users with different roles for testing different workflows.

```bash
# Create PRO user (can SUBMIT NOC)
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "role": "PRO"
  }'

# Response: {"id": 1, "name": "Alice", "role": "PRO"}


# Create OFFICER user (can APPROVE from OFFICER_REVIEW)
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob",
    "role": "OFFICER"
  }'

# Response: {"id": 2, "name": "Bob", "role": "OFFICER"}


# Create CONTROLLER user
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie",
    "role": "CONTROLLER"
  }'

# Response: {"id": 3, "name": "Charlie", "role": "CONTROLLER"}


# Create HEAD user
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Diana",
    "role": "HEAD"
  }'

# Response: {"id": 4, "name": "Diana", "role": "HEAD"}
```

## 2. Get All Users

```bash
curl http://localhost:8000/api/v1/users

# Response:
# [
#   {"id": 1, "name": "Alice", "role": "PRO"},
#   {"id": 2, "name": "Bob", "role": "OFFICER"},
#   {"id": 3, "name": "Charlie", "role": "CONTROLLER"},
#   {"id": 4, "name": "Diana", "role": "HEAD"}
# ]
```

## 3. NOC Workflow Example

### Initial State Check

```bash
# Get initial state of NOC instance (auto-created as DRAFT)
curl http://localhost:8000/api/v1/workflow/NOC/noc-001/state

# Response: {"entity": "NOC", "entity_id": "noc-001", "current_state": "DRAFT"}
```

### Step 1: PRO Submits (DRAFT → OFFICER_REVIEW)

```bash
# Alice (PRO, id=1) submits the NOC
curl -X POST "http://localhost:8000/api/v1/workflow/NOC/noc-001/action?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{"action": "SUBMIT"}'

# Response: {"entity": "NOC", "entity_id": "noc-001", "current_state": "OFFICER_REVIEW"}
```

### Step 2: Officer Reviews and Approves (OFFICER_REVIEW → CONTROLLER_REVIEW)

```bash
# Bob (OFFICER, id=2) approves from OFFICER_REVIEW
curl -X POST "http://localhost:8000/api/v1/workflow/NOC/noc-001/action?user_id=2" \
  -H "Content-Type: application/json" \
  -d '{"action": "APPROVE"}'

# Response: {"entity": "NOC", "entity_id": "noc-001", "current_state": "CONTROLLER_REVIEW"}
```

### Step 3: Controller Reviews (CONTROLLER_REVIEW → HEAD_APPROVAL)

```bash
# Charlie (CONTROLLER, id=3) approves from CONTROLLER_REVIEW
curl -X POST "http://localhost:8000/api/v1/workflow/NOC/noc-001/action?user_id=3" \
  -H "Content-Type: application/json" \
  -d '{"action": "APPROVE"}'

# Response: {"entity": "NOC", "entity_id": "noc-001", "current_state": "HEAD_APPROVAL"}
```

### Step 4: Head Final Approval (HEAD_APPROVAL → APPROVED)

```bash
# Diana (HEAD, id=4) approves final
curl -X POST "http://localhost:8000/api/v1/workflow/NOC/noc-001/action?user_id=4" \
  -H "Content-Type: application/json" \
  -d '{"action": "APPROVE"}'

# Response: {"entity": "NOC", "entity_id": "noc-001", "current_state": "APPROVED"}
```

## 4. Check Available Actions

```bash
# Check what actions are available for Officer in OFFICER_REVIEW
curl "http://localhost:8000/api/v1/workflow/NOC/noc-001/available-actions?user_id=2"

# Response: {"actions": ["APPROVE", "REJECT", "REVERT"]}


# Check what actions are available for PRO (should be none in OFFICER_REVIEW)
curl "http://localhost:8000/api/v1/workflow/NOC/noc-001/available-actions?user_id=1"

# Response: {"actions": []}
```

## 5. View Workflow History

```bash
curl http://localhost:8000/api/v1/workflow/NOC/noc-001/history

# Response:
# [
#   {
#     "id": 4,
#     "entity": "NOC",
#     "entity_id": "noc-001",
#     "old_state": "HEAD_APPROVAL",
#     "new_state": "APPROVED",
#     "action": "APPROVE",
#     "user_id": 4,
#     "timestamp": "2024-01-15T10:45:30"
#   },
#   {
#     "id": 3,
#     "entity": "NOC",
#     "entity_id": "noc-001",
#     "old_state": "CONTROLLER_REVIEW",
#     "new_state": "HEAD_APPROVAL",
#     "action": "APPROVE",
#     "user_id": 3,
#     "timestamp": "2024-01-15T10:44:15"
#   },
#   ...
# ]
```

## 6. LOA Workflow Example (Simpler)

```bash
# Create USER
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Eve", "role": "USER"}'

# Create ADMIN
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Frank", "role": "ADMIN"}'

# Get initial state
curl http://localhost:8000/api/v1/workflow/LOA/loa-001/state
# Response: {"entity": "LOA", "entity_id": "loa-001", "current_state": "DRAFT"}

# USER submits (DRAFT → ADMIN_REVIEW)
curl -X POST "http://localhost:8000/api/v1/workflow/LOA/loa-001/action?user_id=5" \
  -H "Content-Type: application/json" \
  -d '{"action": "SUBMIT"}'
# Response: {"entity": "LOA", "entity_id": "loa-001", "current_state": "ADMIN_REVIEW"}

# ADMIN approves (ADMIN_REVIEW → APPROVED)
curl -X POST "http://localhost:8000/api/v1/workflow/LOA/loa-001/action?user_id=6" \
  -H "Content-Type: application/json" \
  -d '{"action": "APPROVE"}'
# Response: {"entity": "LOA", "entity_id": "loa-001", "current_state": "APPROVED"}
```

## 7. Error Examples

### Permission Denied

```bash
# Bob (OFFICER) tries to submit NOC (only PRO can)
curl -X POST "http://localhost:8000/api/v1/workflow/NOC/noc-002/action?user_id=2" \
  -H "Content-Type: application/json" \
  -d '{"action": "SUBMIT"}'

# Response (400):
# {
#   "detail": "User role 'OFFICER' not authorized for this action. Required roles: PRO"
# }
```

### Invalid Transition

```bash
# Alice (PRO) tries to APPROVE from DRAFT (only SUBMIT is allowed)
curl -X POST "http://localhost:8000/api/v1/workflow/NOC/noc-003/action?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{"action": "APPROVE"}'

# Response (400):
# {
#   "detail": "No transition from 'DRAFT' with action 'APPROVE' for entity 'NOC'"
# }
```

### User Not Found

```bash
curl -X POST "http://localhost:8000/api/v1/workflow/NOC/noc-004/action?user_id=999" \
  -H "Content-Type: application/json" \
  -d '{"action": "SUBMIT"}'

# Response (404):
# {
#   "detail": "User not found"
# }
```

## 8. Finance Workflow Example

```bash
# Get initial state
curl http://localhost:8000/api/v1/workflow/FINANCE/fin-001/state
# Response: {"entity": "FINANCE", "entity_id": "fin-001", "current_state": "PENDING"}

# PRO submits (PENDING → CONTROLLER_APPROVAL)
curl -X POST "http://localhost:8000/api/v1/workflow/FINANCE/fin-001/action?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{"action": "SUBMIT"}'

# CONTROLLER approves (CONTROLLER_APPROVAL → FINANCE_CONFIRMATION)
curl -X POST "http://localhost:8000/api/v1/workflow/FINANCE/fin-001/action?user_id=3" \
  -H "Content-Type: application/json" \
  -d '{"action": "APPROVE"}'

# Create FINANCE role user
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Grace", "role": "FINANCE"}'

# FINANCE confirms (FINANCE_CONFIRMATION → COMPLETED)
curl -X POST "http://localhost:8000/api/v1/workflow/FINANCE/fin-001/action?user_id=7" \
  -H "Content-Type: application/json" \
  -d '{"action": "CONFIRM"}'
```

## 9. Using Python Requests (Alternative to curl)

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Create user
response = requests.post(
    f"{BASE_URL}/users",
    json={"name": "User", "role": "PRO"}
)
user = response.json()
print(f"Created user: {user}")

# Execute workflow action
response = requests.post(
    f"{BASE_URL}/workflow/NOC/noc-001/action",
    params={"user_id": user["id"]},
    json={"action": "SUBMIT"}
)
state = response.json()
print(f"Current state: {state['current_state']}")

# Get available actions
response = requests.get(
    f"{BASE_URL}/workflow/NOC/noc-001/available-actions",
    params={"user_id": user["id"]}
)
actions = response.json()
print(f"Available actions: {actions['actions']}")

# Get history
response = requests.get(
    f"{BASE_URL}/workflow/NOC/noc-001/history"
)
history = response.json()
for entry in history:
    print(f"{entry['old_state']} -> {entry['new_state']} ({entry['action']})")
```

## 10. Multiple Parallel Workflows

The engine supports multiple concurrent workflows for different entities:

```bash
# Same user can have multiple NOCs in different states
curl -X POST "http://localhost:8000/api/v1/workflow/NOC/noc-a/action?user_id=1" \
  -d '{"action": "SUBMIT"}'
curl -X POST "http://localhost:8000/api/v1/workflow/NOC/noc-b/action?user_id=1" \
  -d '{"action": "SUBMIT"}'

# Check states independently
curl http://localhost:8000/api/v1/workflow/NOC/noc-a/state
curl http://localhost:8000/api/v1/workflow/NOC/noc-b/state

# Each has its own workflow history
curl http://localhost:8000/api/v1/workflow/NOC/noc-a/history
curl http://localhost:8000/api/v1/workflow/NOC/noc-b/history
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json
