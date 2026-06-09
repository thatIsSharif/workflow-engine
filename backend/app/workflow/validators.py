"""
Workflow validation logic.
"""
from typing import Optional
from app.workflow.config_loader import ConfigLoader
from app.models.user import User
from app.utils.logger import get_logger

logger = get_logger(__name__)


class WorkflowValidationError(Exception):
    """Base exception for workflow validation errors."""

    pass


class InvalidEntityError(WorkflowValidationError):
    """Raised when entity is not defined in config."""

    pass


class InvalidStateError(WorkflowValidationError):
    """Raised when state is not valid for entity."""

    pass


class InvalidTransitionError(WorkflowValidationError):
    """Raised when transition is not allowed."""

    pass


class InsufficientPermissionError(WorkflowValidationError):
    """Raised when user role is not authorized for action."""

    pass


class ConflictError(WorkflowValidationError):
    """Raised when state conflicts due to concurrent modification."""

    pass


class WorkflowValidator:
    """Validates workflow transitions and permissions."""

    def __init__(self, config_loader: ConfigLoader):
        """
        Initialize validator.

        Args:
            config_loader: Configuration loader instance
        """
        self.config_loader = config_loader

    def validate_entity_exists(self, entity: str) -> None:
        """
        Validate that entity has a defined workflow.

        Args:
            entity: Entity name

        Raises:
            InvalidEntityError: If entity not found in config
        """
        if not self.config_loader.is_valid_entity(entity):
            raise InvalidEntityError(f"No workflow defined for entity: {entity}")

    def validate_current_state(self, entity: str, current_state: str) -> None:
        """
        Validate that current state is valid for entity.

        Args:
            entity: Entity name
            current_state: Current state

        Raises:
            InvalidStateError: If state not valid for entity
        """
        if not self.config_loader.is_valid_state(entity, current_state):
            raise InvalidStateError(
                f"Invalid state '{current_state}' for entity '{entity}'"
            )

    def validate_transition_exists(
        self, entity: str, current_state: str, action: str
    ) -> dict:
        """
        Validate that transition exists.

        Args:
            entity: Entity name
            current_state: Current state
            action: Action to perform

        Returns:
            Transition dict

        Raises:
            InvalidTransitionError: If transition not found
        """
        transition = self.config_loader.find_transition(
            entity, current_state, action
        )
        
        if not transition:
            raise InvalidTransitionError(
                f"No transition from '{current_state}' with action '{action}' "
                f"for entity '{entity}'"
            )
        
        return transition

    def validate_user_permission(
        self, transition: dict, user: User
    ) -> None:
        """
        Validate that user has permission to perform transition.

        Args:
            transition: Transition dict
            user: User performing action

        Raises:
            InsufficientPermissionError: If user role not authorized
        """
        required_roles = transition.get("roles", [])
        
        if not required_roles:
            # If no roles specified, allow anyone
            return
        
        if user.role not in required_roles:
            raise InsufficientPermissionError(
                f"User role '{user.role}' not authorized for this action. "
                f"Required roles: {', '.join(required_roles)}"
            )

    def validate_transition(
        self, entity: str, current_state: str, action: str, user: User
    ) -> dict:
        """
        Perform all validations for a transition.

        Args:
            entity: Entity name
            current_state: Current state (will be normalized to uppercase)
            action: Action to perform (will be normalized to uppercase)
            user: User performing action

        Returns:
            Transition dict if valid

        Raises:
            WorkflowValidationError: If any validation fails
        """
        # Normalize inputs to uppercase for consistency
        current_state = current_state.upper()
        action = action.upper()
        
        self.validate_entity_exists(entity)
        self.validate_current_state(entity, current_state)
        transition = self.validate_transition_exists(entity, current_state, action)
        self.validate_user_permission(transition, user)
        
        logger.debug(
            f"Transition validated: {entity} {current_state} -[{action}]-> "
            f"{transition.get('to')} for user {user.id}"
        )
        
        return transition
