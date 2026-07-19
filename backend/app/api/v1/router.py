"""
API v1 router initialization.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    cancellation,
    dashboard,
    demo,
    finance,
    loa,
    noc,
    rental,
    users,
    # workflow,
)

# Create main router
router = APIRouter(prefix="/api/v1")

# Domain routers (business-friendly URLs — clients should use these)
router.include_router(users.router)
router.include_router(noc.router)
router.include_router(loa.router)
router.include_router(finance.router)
router.include_router(rental.router)
router.include_router(cancellation.router)
router.include_router(dashboard.router)

# Dummy / test endpoints
router.include_router(demo.router)

# # Generic workflow router (low-level engine surface — admin / internal use)
# router.include_router(workflow.router)
