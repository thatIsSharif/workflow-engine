"""
Custom application exceptions.
"""


class APIException(Exception):
    """Base API exception."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class InvalidTransitionError(APIException):
    """Raised when a workflow transition is not allowed."""

    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class InvalidStateError(APIException):
    """Raised when a workflow state is invalid."""

    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class PermissionDeniedError(APIException):
    """Raised when a user does not have permission for an action."""

    def __init__(self, message: str):
        super().__init__(message, status_code=403)


class WorkflowNotFoundError(APIException):
    """Raised when a workflow instance is not found."""

    def __init__(self, message: str):
        super().__init__(message, status_code=404)
