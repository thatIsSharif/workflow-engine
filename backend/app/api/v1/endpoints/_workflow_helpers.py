"""
Shared helpers for thin domain workflow routers.
"""
import json

from fastapi import Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.workflow import ApplicationStatus
from app.repositories.domain_repo import DomainRepository
from app.services.workflow_service import WorkflowService, WorkflowServiceError
from app.utils import utc_now
from app.workflow.engine import WorkflowEngine
from app.workflow.validators import ConflictError


def get_current_user(
    user_id: int = Query(...), db: Session = Depends(get_db)
) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def create_entity_with_status(
    db: Session,
    model: type,
    data: dict,
    user: User,
    entity_name: str,
) -> object:
    """Create a domain entity and an initial ApplicationStatus record."""
    repo = DomainRepository(db, model)
    entity = repo.create(data, user.id)

    status = ApplicationStatus(
        entity=entity_name,
        entity_id=str(entity.id),
        current_state=entity.status,
        pending_roles=json.dumps([]),
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    db.add(status)
    db.commit()
    db.refresh(entity)
    return entity


def execute_workflow_action(
    entity: str,
    entity_id: str,
    action: str,
    db: Session,
    engine: WorkflowEngine,
    user: User,
    comment: str | None = None,
) -> dict:
    service = WorkflowService(db, engine)
    try:
        return service.execute_action(entity, entity_id, action, user, comment)
    except ConflictError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except WorkflowServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
