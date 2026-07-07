"""
Rental contract domain endpoints.
"""
from fastapi import APIRouter, Body, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints._workflow_helpers import execute_workflow_action, get_current_user
from app.core.database import get_db
from app.core.dependencies import get_workflow_engine
from app.models.domain import Rental
from app.models.user import User
from app.repositories.domain_repo import DomainRepository
from app.schemas.domain import RentalCreate, RentalRead, PaginatedResponse
from app.schemas.workflow import WorkflowActionRequest, WorkflowHistoryEntry, WorkflowTransitionResponse, ApplicationStatusResponse
from app.services.workflow_service import WorkflowService
from app.workflow.engine import WorkflowEngine

router = APIRouter(prefix="/rental", tags=["rental"])
ENTITY = "RENTAL"


@router.post("/", response_model=RentalRead)
def create_rental(payload: RentalCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return DomainRepository(db, Rental).create(payload.model_dump(), user.id)


@router.get("/", response_model=PaginatedResponse[RentalRead])
def list_rental(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    repo = DomainRepository(db, Rental)
    items = repo.list(skip=skip, limit=limit)
    total = repo.count()
    return {"items": items, "total": total}


@router.get("/{rental_id}", response_model=RentalRead)
def get_rental(rental_id: str, db: Session = Depends(get_db)):
    rental = DomainRepository(db, Rental).get(rental_id)
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    return rental


@router.get("/{rental_id}/history", response_model=list[WorkflowHistoryEntry])
def get_history(rental_id: str, db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine)):
    return WorkflowService(db, engine).get_history(ENTITY, rental_id)


@router.get("/{rental_id}/status", response_model=ApplicationStatusResponse)
def get_application_status(
    rental_id: str,
    db: Session = Depends(get_db),
    engine: WorkflowEngine = Depends(get_workflow_engine),
):
    return WorkflowService(db, engine).get_application_status(ENTITY, rental_id)


@router.get("/{rental_id}/actions", response_model=list[str])
def get_available_actions(
    rental_id: str,
    db: Session = Depends(get_db),
    engine: WorkflowEngine = Depends(get_workflow_engine),
    user: User = Depends(get_current_user),
):
    return WorkflowService(db, engine).get_available_actions(ENTITY, rental_id, user)


def _action(rental_id: str, action: str, request: WorkflowActionRequest | None, db: Session, engine: WorkflowEngine, user: User):
    return execute_workflow_action(ENTITY, rental_id, action, db, engine, user, request.comment if request else None)


@router.post("/{rental_id}/submit", response_model=WorkflowTransitionResponse)
def submit(rental_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(rental_id, "SUBMIT", request, db, engine, user)


@router.post("/{rental_id}/approve", response_model=WorkflowTransitionResponse)
def approve(rental_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(rental_id, "APPROVE", request, db, engine, user)


@router.post("/{rental_id}/reject", response_model=WorkflowTransitionResponse)
def reject(rental_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(rental_id, "REJECT", request, db, engine, user)


@router.post("/{rental_id}/sign", response_model=WorkflowTransitionResponse)
def sign(rental_id: str, request: WorkflowActionRequest | None = Body(None), db: Session = Depends(get_db), engine: WorkflowEngine = Depends(get_workflow_engine), user: User = Depends(get_current_user)):
    return _action(rental_id, "SIGN", request, db, engine, user)
