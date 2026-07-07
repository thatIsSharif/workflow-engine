"""
Dashboard and recent-activity endpoints.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.workflow_repo import WorkflowRepository
from app.schemas.workflow import DashboardSummary, RecentActivityEntry

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    repo = WorkflowRepository(db)
    counts = repo.get_dashboard_counts()
    return {"by_entity": counts}


@router.get("/recent-activity", response_model=list[RecentActivityEntry])
def get_recent_activity(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    repo = WorkflowRepository(db)
    return repo.get_recent_activity(limit=limit)
