"""
Cancellation request domain endpoints.
"""
from fastapi import APIRouter, Body, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints._workflow_helpers import create_entity_with_status, execute_workflow_action, get_current_user
from app.core.database import get_db
from app.core.dependencies import get_workflow_engine
from app.models.domain import Cancellation
from app.models.user import User
from app.repositories.domain_repo import DomainRepository
from app.schemas.domain import CancellationCreate, CancellationRead, PaginatedResponse
from app.schemas.workflow import WorkflowActionRequest, WorkflowHistoryEntry, WorkflowTransitionResponse, ApplicationStatusResponse
from app.services.workflow_service import WorkflowService
from app.workflow.engine import WorkflowEngine

router = APIRouter(prefix="/cancellation", tags=["cancellation"])
ENTITY = "CANCELLATION"


@router.post("/", response_model=CancellationRead)
def create_cancellation(payload: CancellationCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return create_entity_with_status(db, Cancellation, payload.model_dump(), user, ENTITY)


@router.get("/", response_model=PaginatedResponse[CancellationRead])
def list_cancellation(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    repo = DomainRepository(db, Cancellation)
    items = repo.list(skip=skip, limit=limit)
    total = repo.count()
    return {"items": items, "total": total}


@router.get("/{cancellation_id}", response_model=CancellationRead)
def get_cancellation(cancellation_id: str, db: Session = Depends(get_db)):
    cancellation = DomainRepository(db, Cancellation).get(cancellation_id)
    if not cancellation:
        raise HTTPException(status_code=404, detail="Cancellation not found")
    return cancellation


@router.get("/{cancellation_id}/history", response_model=list[WorkflowHistoryEntry])
def get_history(cancellation_id: str, db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine)):
    return WorkflowService(db, engine).get_history(ENTITY, cancellation_id)


@router.get("/{cancellation_id}/status", response_model=ApplicationStatusResponse)
def get_application_status(
    cancellation_id: str,
    db: Session = Depends(get_db),
    engine: WorkflowEngine = Depends(get_workflow_engine),
):
    status = WorkflowService(db, engine).get_application_status(ENTITY, cancellation_id)
    if not status:
        raise HTTPException(status_code=404, detail="Application status not found")
    return status


@router.get("/{cancellation_id}/actions", response_model=list[str])
def get_available_actions(
    cancellation_id: str,
    db: Session = Depends(get_db),
    engine: WorkflowEngine = Depends(get_workflow_engine),
    user: User = Depends(get_current_user),
):
    return WorkflowService(db, engine).get_available_actions(ENTITY, cancellation_id, user)


def _action(cancellation_id: str, action: str, request: WorkflowActionRequest | None, db: Session, engine: WorkflowEngine, user: User):
    return execute_workflow_action(ENTITY, cancellation_id, action, db, engine, user, request.comment if request else None)


@router.post("/{cancellation_id}/submit", response_model=WorkflowTransitionResponse)
def submit(cancellation_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(cancellation_id, "SUBMIT", request, db, engine, user)


@router.post("/{cancellation_id}/approve", response_model=WorkflowTransitionResponse)
def approve(cancellation_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(cancellation_id, "APPROVE", request, db, engine, user)


@router.post("/{cancellation_id}/reject", response_model=WorkflowTransitionResponse)
def reject(cancellation_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(cancellation_id, "REJECT", request, db, engine, user)
