"""
Reserved module for internal workflow endpoints.

Domain clients should use the dedicated entity routers.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/workflow", tags=["workflow"])
