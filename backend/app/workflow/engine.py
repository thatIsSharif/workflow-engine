"""
Core workflow engine implementation.
"""
from dataclasses import dataclass
from app.workflow.config_loader import ConfigLoader
from app.workflow.validators import WorkflowValidator, WorkflowValidationError
from app.models.user import User
from app.utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class TransitionResult:
    """Result of a workflow transition."""

    entity: str
    entity_id: str
    old_state: str
    new_state: str
    action: str
    submitter_id: int | None


class WorkflowEngine:
    """Generic workflow engine for state machine transitions."""

    def __init__(self, config_loader: ConfigLoader):
        """
        Initialize workflow engine.

        Args:
            config_loader: Configuration loader instance
        """
        self.config_loader = config_loader
        self.validator = WorkflowValidator(config_loader)

    def can_transition(
        self, entity: str, current_state: str, action: str, user: User
    ) -> bool:
        """
        Check if a transition is allowed without performing it.

        Args:
            entity: Workflow entity
            current_state: Current state
            action: Action to perform
            user: User attempting transition

        Returns:
            True if transition is allowed, False otherwise
        """
        try:
            self.validator.validate_transition(entity, current_state, action, user)
            return True
        except WorkflowValidationError:
            return False

    def execute_transition(
        self, entity: str, entity_id: str, current_state: str, action: str, user: User
    ) -> TransitionResult:
        """
        Execute a workflow transition.

        Normalizes inputs to uppercase for consistency with JSON config.
        Validates transition and user permissions before returning result.

        Args:
            entity: Workflow entity
            entity_id: Entity identifier
            current_state: Current state (will be normalized to uppercase)
            action: Action to perform (will be normalized to uppercase)
            user: User performing transition

        Returns:
            TransitionResult with new state

        Raises:
            WorkflowValidationError: If transition is not allowed
        """
        # Normalize inputs to uppercase
        normalized_state = current_state.upper()
        normalized_action = action.upper()
        
        logger.debug(
            f"Executing transition: {entity}/{entity_id} "
            f"{normalized_state} -[{normalized_action}]-> ? "
            f"(user: {user.id}, role: {user.role})"
        )
        
        # Validate transition
        transition = self.validator.validate_transition(
            entity, normalized_state, normalized_action, user
        )

        # Get new state from transition
        new_state = transition.get("to")

        logger.info(
            f"Transition executed: {entity}/{entity_id} "
            f"{normalized_state} -[{normalized_action}]-> {new_state} "
            f"(user: {user.id}, role: {user.role})"
        )

        return TransitionResult(
            entity=entity,
            entity_id=entity_id,
            old_state=normalized_state,
            new_state=new_state,
            action=normalized_action,
            submitter_id=user.id if normalized_action == "SUBMIT" else None,
        )

    def get_available_actions(
        self, entity: str, current_state: str, user: User
    ) -> list[str]:
        """
        Get all actions available from current state for user.

        Args:
            entity: Workflow entity
            current_state: Current state
            user: User to check permissions for

        Returns:
            List of available action names
        """
        transitions = self.config_loader.get_transitions(entity)
        available_actions = []

        for key, transition in transitions.items():
            state, action = key.split(":")
            if state != current_state:
                continue

            # Check if user has permission
            if self.can_transition(
                entity, current_state, action, user
            ):
                available_actions.append(action)

        return available_actions

    def execute_post_actions(
        self, result: TransitionResult, transition: dict
    ) -> None:
        """
        Execute post-transition actions (extensibility hook).

        This is called after a successful transition to allow:
        - Notifications (email, SMS, Slack)
        - External system updates (SAP, CRM)
        - Audit logging
        - Cache invalidation

        Override this method in subclasses or use callbacks for custom logic.

        Args:
            result: TransitionResult with transition details
            transition: Transition dict from config

        Returns:
            None
        """
        logger.debug(
            f"Post-action hook: {result.entity}/{result.entity_id} "
            f"{result.old_state} -> {result.new_state} (action: {result.action})"
        )
        
        return None
