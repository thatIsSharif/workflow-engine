"""
NOC domain endpoints.
"""
from app.schemas.workflow import ApplicationStatusResponse
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.endpoints._workflow_helpers import execute_workflow_action, get_current_user
from app.core.database import get_db
from app.core.dependencies import get_workflow_engine
from app.models.domain import NOC
from app.models.user import User
from app.repositories.domain_repo import DomainRepository
from app.schemas.domain import NOCCreate, NOCRead
from app.schemas.workflow import WorkflowActionRequest, WorkflowHistoryEntry, WorkflowTransitionResponse
from app.services.workflow_service import WorkflowService
from app.workflow.engine import WorkflowEngine

router = APIRouter(prefix="/noc", tags=["noc"])
ENTITY = "NOC"


@router.post("/", response_model=NOCRead)
def create_noc(
    payload: NOCCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return DomainRepository(db, NOC).create(payload.model_dump(), user.id)


@router.get("/", response_model=list[NOCRead])
def list_noc(db: Session = Depends(get_db)):
    return DomainRepository(db, NOC).list()


@router.get("/{noc_id}", response_model=NOCRead)
def get_noc(noc_id: str, db: Session = Depends(get_db)):
    noc = DomainRepository(db, NOC).get(noc_id)
    if not noc:
        raise HTTPException(status_code=404, detail="NOC not found")
    return noc


@router.get("/{noc_id}/history", response_model=list[WorkflowHistoryEntry])
def get_history(
    noc_id: str,
    db: Session = Depends(get_db),
    engine: WorkflowEngine = Depends(get_workflow_engine),
):
    return WorkflowService(db, engine).get_history(ENTITY, noc_id)

@router.get("/{noc_id}/status", response_model=ApplicationStatusResponse)
def get_application_status(
    noc_id: str,
    db: Session = Depends(get_db),
    engine: WorkflowEngine = Depends(get_workflow_engine),
):
    return WorkflowService(db, engine).get_application_status(ENTITY, noc_id)

def _action(
    noc_id: str,
    action: str,
    request: WorkflowActionRequest | None,
    db: Session,
    engine: WorkflowEngine,
    user: User,
):
    return execute_workflow_action(
        ENTITY, noc_id, action, db, engine, user, request.comment if request else None
    )


@router.post("/{noc_id}/submit", response_model=WorkflowTransitionResponse)
def submit(noc_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(noc_id, "SUBMIT", request, db, engine, user)


@router.post("/{noc_id}/approve", response_model=WorkflowTransitionResponse)
def approve(noc_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(noc_id, "APPROVE", request, db, engine, user)


@router.post("/{noc_id}/reject", response_model=WorkflowTransitionResponse)
def reject(noc_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(noc_id, "REJECT", request, db, engine, user)


@router.post("/{noc_id}/revert", response_model=WorkflowTransitionResponse)
def revert(noc_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(noc_id, "REVERT", request, db, engine, user)
