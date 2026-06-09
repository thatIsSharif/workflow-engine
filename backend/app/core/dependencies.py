"""
Dependency injection utilities.
"""
from sqlalchemy.orm import Session
from fastapi import Depends
from app.core.database import get_db
from app.workflow.engine import WorkflowEngine
from app.workflow.config_loader import ConfigLoader


def get_config_loader() -> ConfigLoader:
    """Get workflow configuration loader."""
    return ConfigLoader()


def get_workflow_engine(
    config_loader: ConfigLoader = Depends(get_config_loader)
) -> WorkflowEngine:
    """Get workflow engine instance."""
    return WorkflowEngine(config_loader)


# Re-export get_db for convenience
__all__ = ["get_db", "get_workflow_engine", "get_config_loader"]
