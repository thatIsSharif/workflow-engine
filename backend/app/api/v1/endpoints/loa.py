"""
LOA domain endpoints.
"""
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.endpoints._workflow_helpers import execute_workflow_action, get_current_user
from app.core.database import get_db
from app.core.dependencies import get_workflow_engine
from app.models.domain import LOA
from app.models.user import User
from app.repositories.domain_repo import DomainRepository
from app.schemas.domain import LOACreate, LOARead
from app.schemas.workflow import WorkflowActionRequest, WorkflowHistoryEntry, WorkflowTransitionResponse, ApplicationStatusResponse
from app.services.workflow_service import WorkflowService
from app.workflow.engine import WorkflowEngine

router = APIRouter(prefix="/loa", tags=["loa"])
ENTITY = "LOA"


@router.post("/", response_model=LOARead)
def create_loa(payload: LOACreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return DomainRepository(db, LOA).create(payload.model_dump(), user.id)


@router.get("/", response_model=list[LOARead])
def list_loa(db: Session = Depends(get_db)):
    return DomainRepository(db, LOA).list()


@router.get("/{loa_id}", response_model=LOARead)
def get_loa(loa_id: str, db: Session = Depends(get_db)):
    loa = DomainRepository(db, LOA).get(loa_id)
    if not loa:
        raise HTTPException(status_code=404, detail="LOA not found")
    return loa


@router.get("/{loa_id}/history", response_model=list[WorkflowHistoryEntry])
def get_history(loa_id: str, db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine)):
    return WorkflowService(db, engine).get_history(ENTITY, loa_id)


@router.get("/{loa_id}/status", response_model=ApplicationStatusResponse)
def get_application_status(
    loa_id: str,
    db: Session = Depends(get_db),
    engine: WorkflowEngine = Depends(get_workflow_engine),
):
    return WorkflowService(db, engine).get_application_status(ENTITY, loa_id)


def _action(loa_id: str, action: str, request: WorkflowActionRequest | None, db: Session, engine: WorkflowEngine, user: User):
    return execute_workflow_action(ENTITY, loa_id, action, db, engine, user, request.comment if request else None)


@router.post("/{loa_id}/submit", response_model=WorkflowTransitionResponse)
def submit(loa_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(loa_id, "SUBMIT", request, db, engine, user)


@router.post("/{loa_id}/approve", response_model=WorkflowTransitionResponse)
def approve(loa_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(loa_id, "APPROVE", request, db, engine, user)


@router.post("/{loa_id}/reject", response_model=WorkflowTransitionResponse)
def reject(loa_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(loa_id, "REJECT", request, db, engine, user)
