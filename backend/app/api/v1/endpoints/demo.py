"""
Dummy API endpoint for testing purposes.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/demo", tags=["demo"])


@router.get("/ping")
async def demo_ping():
    """Simple dummy ping endpoint for testing."""
    return {
        "message": "pong",
        "status": "ok",
        "description": "This is a dummy API for testing purposes.",
    }
