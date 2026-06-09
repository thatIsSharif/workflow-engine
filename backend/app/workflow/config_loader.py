"""
Workflow configuration loader from JSON.
"""
from pathlib import Path
from typing import Any

from app.core.config import settings
from app.utils.validate_workflow import load_strict_json, validate_workflow_config
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ConfigLoader:
    """Load and parse workflow configuration from JSON file."""

    def __init__(self, config_path: str | None = None):
        self.config_path = config_path or settings.workflow_config_path
        self._config: dict[str, Any] = {}
        self._load_config()

    def _load_config(self) -> None:
        config_file = Path(self.config_path)
        if not config_file.exists():
            raise FileNotFoundError(f"Config file not found at {self.config_path}")

        self._config = load_strict_json(config_file)

        validate_workflow_config(self._config)
        logger.info(f"Loaded workflow config from {self.config_path}")

    def get_workflow(self, entity: str) -> dict[str, Any] | None:
        return self._config.get(entity.upper())

    def get_states(self, entity: str) -> list[str]:
        workflow = self.get_workflow(entity)
        return workflow.get("states", []) if workflow else []

    def get_transitions(self, entity: str) -> dict[str, Any]:
        workflow = self.get_workflow(entity)
        return workflow.get("transitions", {}) if workflow else {}

    def find_transition(
        self, entity: str, current_state: str, action: str
    ) -> dict[str, Any] | None:
        key = f"{current_state.upper()}:{action.upper()}"
        return self.get_transitions(entity).get(key)

    def get_pending_roles(self, entity: str, state: str) -> list[str]:
        prefix = f"{state.upper()}:"
        roles: list[str] = []
        for key, transition in self.get_transitions(entity).items():
            if not key.startswith(prefix):
                continue
            for role in transition.get("roles", []):
                if role not in roles:
                    roles.append(role)
        return roles

    def is_valid_state(self, entity: str, state: str) -> bool:
        return state.upper() in self.get_states(entity)

    def is_valid_entity(self, entity: str) -> bool:
        return self.get_workflow(entity) is not None
