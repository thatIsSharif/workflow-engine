"""
Shared helpers for thin domain workflow routers.
"""
from fastapi import Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.services.workflow_service import WorkflowService, WorkflowServiceError
from app.workflow.engine import WorkflowEngine
from app.workflow.validators import ConflictError


def get_current_user(
    user_id: int = Query(...), db: Session = Depends(get_db)
) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


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
