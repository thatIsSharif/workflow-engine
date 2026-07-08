"""
Finance request domain endpoints.
"""
from fastapi import APIRouter, Body, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints._workflow_helpers import execute_workflow_action, get_current_user
from app.core.database import get_db
from app.core.dependencies import get_workflow_engine
from app.models.domain import FinanceRequest
from app.models.user import User
from app.repositories.domain_repo import DomainRepository
from app.schemas.domain import FinanceCreate, FinanceRead, PaginatedResponse
from app.schemas.workflow import WorkflowActionRequest, WorkflowHistoryEntry, WorkflowTransitionResponse, ApplicationStatusResponse
from app.services.workflow_service import WorkflowService
from app.workflow.engine import WorkflowEngine

router = APIRouter(prefix="/finance", tags=["finance"])
ENTITY = "FINANCE"


@router.post("/", response_model=FinanceRead)
def create_finance(payload: FinanceCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return DomainRepository(db, FinanceRequest).create(payload.model_dump(), user.id)


@router.get("/", response_model=PaginatedResponse[FinanceRead])
def list_finance(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    repo = DomainRepository(db, FinanceRequest)
    items = repo.list(skip=skip, limit=limit)
    total = repo.count()
    return {"items": items, "total": total}


@router.get("/{finance_id}", response_model=FinanceRead)
def get_finance(finance_id: str, db: Session = Depends(get_db)):
    finance = DomainRepository(db, FinanceRequest).get(finance_id)
    if not finance:
        raise HTTPException(status_code=404, detail="Finance request not found")
    return finance


@router.get("/{finance_id}/history", response_model=list[WorkflowHistoryEntry])
def get_history(finance_id: str, db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine)):
    return WorkflowService(db, engine).get_history(ENTITY, finance_id)


@router.get("/{finance_id}/status", response_model=ApplicationStatusResponse)
def get_application_status(
    finance_id: str,
    db: Session = Depends(get_db),
    engine: WorkflowEngine = Depends(get_workflow_engine),
):
    return WorkflowService(db, engine).get_application_status(ENTITY, finance_id)


@router.get("/{finance_id}/actions", response_model=list[str])
def get_available_actions(
    finance_id: str,
    db: Session = Depends(get_db),
    engine: WorkflowEngine = Depends(get_workflow_engine),
    user: User = Depends(get_current_user),
):
    return WorkflowService(db, engine).get_available_actions(ENTITY, finance_id, user)


def _action(finance_id: str, action: str, request: WorkflowActionRequest | None, db: Session, engine: WorkflowEngine, user: User):
    return execute_workflow_action(ENTITY, finance_id, action, db, engine, user, request.comment if request else None)


@router.post("/{finance_id}/submit", response_model=WorkflowTransitionResponse)
def submit(finance_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(finance_id, "SUBMIT", request, db, engine, user)


@router.post("/{finance_id}/approve", response_model=WorkflowTransitionResponse)
def approve(finance_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(finance_id, "APPROVE", request, db, engine, user)


@router.post("/{finance_id}/reject", response_model=WorkflowTransitionResponse)
def reject(finance_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(finance_id, "REJECT", request, db, engine, user)


@router.post("/{finance_id}/confirm", response_model=WorkflowTransitionResponse)
def confirm(finance_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(finance_id, "CONFIRM", request, db, engine, user)
