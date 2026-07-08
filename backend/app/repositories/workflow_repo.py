"""
Workflow repository for atomic state transitions.
"""

import json
from datetime import datetime
from uuid import UUID

from sqlalchemy import func, update
from sqlalchemy.orm import Session

from app.models.workflow import ApplicationStatus, WorkflowHistory
from app.workflow.validators import ConflictError


class WorkflowRepository:
    """Repository for workflow history and projection operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_history(self, entity: str, entity_id: str) -> list[WorkflowHistory]:
        return (
            self.db.query(WorkflowHistory)
            .filter(
                WorkflowHistory.entity == entity,
                WorkflowHistory.entity_id == entity_id,
            )
            .order_by(WorkflowHistory.timestamp.desc())
            .all()
        )

    def get_dashboard_counts(self) -> list[dict]:
        """Return count of applications per entity per status."""
        rows = (
            self.db.query(
                ApplicationStatus.entity,
                ApplicationStatus.current_state,
                func.count(ApplicationStatus.id).label("count"),
            )
            .group_by(ApplicationStatus.entity, ApplicationStatus.current_state)
            .order_by(ApplicationStatus.entity, ApplicationStatus.current_state)
            .all()
        )
        return [
            {"entity": row.entity, "status": row.current_state, "count": row.count}
            for row in rows
        ]

    def get_recent_activity(self, limit: int = 20) -> list[WorkflowHistory]:
        return (
            self.db.query(WorkflowHistory)
            .order_by(WorkflowHistory.timestamp.desc())
            .limit(limit)
            .all()
        )

    def get_first_submit(self, entity: str, entity_id: str) -> WorkflowHistory | None:
        return (
            self.db.query(WorkflowHistory)
            .filter(
                WorkflowHistory.entity == entity,
                WorkflowHistory.entity_id == entity_id,
                WorkflowHistory.action == "SUBMIT",
            )
            .order_by(WorkflowHistory.id.asc())
            .first()
        )

    def get_application_status(
        self, entity: str, entity_id: str
    ) -> ApplicationStatus | None:
        return (
            self.db.query(ApplicationStatus)
            .filter(
                ApplicationStatus.entity == entity,
                ApplicationStatus.entity_id == entity_id,
            )
            .first()
        )

    def transition(
        self,
        *,
        model: type,
        entity: str,
        entity_id: str,
        old_state: str,
        new_state: str,
        action: str,
        actioned_by: int,
        expected_version: int,
        submitter_id: int,
        pending_roles: list[str],
        comment: str | None,
    ) -> tuple[object, WorkflowHistory, ApplicationStatus]:
        stmt = (
            update(model)
            .where(
                model.id == UUID(str(entity_id)),
                model.status == old_state,
                model.version == expected_version,
            )
            .values(
                status=new_state,
                version=expected_version + 1,
                updated_at=datetime.utcnow(),
            )
        )
        result = self.db.execute(stmt)
        if result.rowcount == 0:
            raise ConflictError(
                f"State conflict detected for {entity}/{entity_id}. "
                "The workflow state may have been changed by another process."
            )

        history = WorkflowHistory(
            entity=entity,
            entity_id=entity_id,
            old_state=old_state,
            new_state=new_state,
            action=action,
            actioned_by=actioned_by,
            submitter_id=submitter_id,
            comment=comment,
        )
        self.db.add(history)

        status = (
            self.db.query(ApplicationStatus)
            .filter(
                ApplicationStatus.entity == entity,
                ApplicationStatus.entity_id == entity_id,
            )
            .first()
        )
        if status is None:
            status = ApplicationStatus(
                entity=entity,
                entity_id=entity_id,
                submitted_by=submitter_id,
                created_at=datetime.utcnow(),
            )
            self.db.add(status)

        status.current_state = new_state
        status.pending_roles = json.dumps(pending_roles)
        status.actioned_by = actioned_by
        status.last_action = action
        status.last_comment = comment
        status.submitted_by = status.submitted_by or submitter_id
        status.updated_at = datetime.utcnow()

        self.db.flush()
        updated_entity = self.db.get(model, UUID(str(entity_id)))
        return updated_entity, history, status
