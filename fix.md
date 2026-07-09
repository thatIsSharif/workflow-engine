# Bug Fix: ResponseValidationError on Entity Creation

## Error

When creating NOC, LOA, Finance, Rental, or Cancellation entities via the frontend UI, the create operation itself succeeded, but navigating to the detail page failed with:

```
fastapi.exceptions.ResponseValidationError: 1 validation error:
  {'type': 'model_attributes_type', 'loc': ('response',),
   'msg': 'Input should be a valid dictionary or object to extract fields from',
   'input': None}
```

## Root Cause

When a domain entity was created, only the domain table record was inserted. No `ApplicationStatus` record was created alongside it. The frontend detail page calls `GET /{entity}/{id}/status` to load the workflow status, which returned `None` because no `ApplicationStatus` record existed. Since the endpoint's `response_model=ApplicationStatusResponse` expects a non-null value, FastAPI raised `ResponseValidationError`.

## Fix

1. **`_workflow_helpers.py`**: Added a `create_entity_with_status()` helper that creates both the domain entity and its initial `ApplicationStatus` record in a single flow.

2. **noc.py, loa.py, finance.py, rental.py, cancellation.py**: Updated all 5 create endpoints to use the new helper instead of directly calling the repository.

3. **All 5 status endpoints**: Added 404 checks to return `HTTPException(404)` when no status exists, preventing `ResponseValidationError` for edge cases (entities created before the fix).
