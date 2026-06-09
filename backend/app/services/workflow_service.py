"""
Workflow service layer.
"""

from uuid import UUID

from app.models.workflow import ApplicationStatus
from sqlalchemy.orm import Session

from app.models.domain import Cancellation, FinanceRequest, LOA, NOC, Rental
from app.models.user import User
from app.repositories.workflow_repo import WorkflowRepository
from app.utils.logger import get_logger
from app.workflow.engine import WorkflowEngine
from app.workflow.validators import ConflictError, WorkflowValidationError

logger = get_logger(__name__)


class WorkflowServiceError(Exception):
    """Base exception for workflow service errors."""


ENTITY_MODELS = {
    "NOC": NOC,
    "LOA": LOA,
    "FINANCE": FinanceRequest,
    "RENTAL": Rental,
    "CANCELLATION": Cancellation,
}


class WorkflowService:
    """Entity-agnostic workflow business logic."""

    def __init__(self, db: Session, engine: WorkflowEngine):
        self.db = db
        self.engine = engine
        self.repository = WorkflowRepository(db)

    def _model_for(self, entity: str) -> type:
        model = ENTITY_MODELS.get(entity.upper())
        if model is None:
            raise WorkflowServiceError(f"Unsupported workflow entity: {entity}")
        return model

    def get_instance(self, entity: str, entity_id: str):
        model = self._model_for(entity)
        instance = self.db.get(model, UUID(str(entity_id)))
        if not instance:
            raise WorkflowServiceError(f"{entity} not found: {entity_id}")
        return instance

    def execute_action(
        self,
        entity: str,
        entity_id: str,
        action: str,
        user: User,
        comment: str | None = None,
    ) -> dict:
        entity = entity.upper()
        model = self._model_for(entity)
        domain_id = UUID(str(entity_id))
        instance = self.db.get(model, domain_id)
        if not instance:
            raise WorkflowServiceError(f"{entity} not found: {entity_id}")

        try:
            result = self.engine.execute_transition(
                entity, str(instance.id), instance.status, action, user
            )
        except WorkflowValidationError as e:
            raise WorkflowServiceError(str(e)) from e

        first_submit = self.repository.get_first_submit(entity, str(instance.id))
        if result.action == "SUBMIT" and first_submit is None:
            submitter_id = user.id
        elif first_submit is not None:
            submitter_id = first_submit.actioned_by
        else:
            raise WorkflowServiceError(
                "Application must be submitted before this action"
            )

        pending_roles = self.engine.config_loader.get_pending_roles(
            entity, result.new_state
        )

        try:
            updated_entity, _history, _status = self.repository.transition(
                model=model,
                entity=entity,
                entity_id=str(instance.id),
                old_state=result.old_state,
                new_state=result.new_state,
                action=result.action,
                actioned_by=user.id,
                expected_version=instance.version,
                submitter_id=submitter_id,
                pending_roles=pending_roles,
                comment=comment,
            )
            self.db.commit()
        except ConflictError:
            self.db.rollback()
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(f"Transaction failed: {entity}/{entity_id}: {e}")
            raise

        transition = self.engine.config_loader.find_transition(
            entity, result.old_state, result.action
        )
        self.engine.execute_post_actions(result, transition or {})

        return {
            "id": updated_entity.id,
            "old_state": result.old_state,
            "new_state": result.new_state,
            "action": result.action,
            "actioned_by": user.id,
            "pending_roles": pending_roles,
            "comment": comment,
        }

    def get_available_actions(
        self, entity: str, entity_id: str, user: User
    ) -> list[str]:
        instance = self.get_instance(entity, entity_id)
        return self.engine.get_available_actions(entity, instance.status, user)

    def get_history(self, entity: str, entity_id: str) -> list:
        return self.repository.get_history(entity.upper(), str(UUID(str(entity_id))))

    def get_application_status(self, entity: str, entity_id: str) -> ApplicationStatus:
        return self.repository.get_application_status(
            entity.upper(), str(UUID(str(entity_id)))
        )
