"""
Pydantic schemas for Workflow models.
"""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class WorkflowActionRequest(BaseModel):
    """Request schema for workflow action."""

    comment: str | None = None


class WorkflowStateResponse(BaseModel):
    """Response schema for workflow state."""

    entity: str
    entity_id: str
    current_state: str

    class Config:
        from_attributes = True


class WorkflowTransitionResponse(BaseModel):
    """Response schema for workflow transition result."""

    id: UUID
    old_state: str
    new_state: str
    action: str
    actioned_by: int
    pending_roles: list[str]
    comment: str | None

    class Config:
        from_attributes = True


class ApplicationStatusResponse(BaseModel):
    """Response schema for application status projection."""

    id: int
    entity: str
    entity_id: str
    current_state: str
    pending_roles: str
    actioned_by: int | None
    last_action: str | None
    last_comment: str | None
    submitted_by: int | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkflowHistoryEntry(BaseModel):
    """Schema for workflow history entry."""

    id: int
    entity: str
    entity_id: str
    old_state: str
    new_state: str
    action: str
    submitter_id: int | None
    actioned_by: int | None
    comment: str | None
    timestamp: datetime

    class Config:
        from_attributes = True


class EntityStatusCount(BaseModel):
    """Count of applications in a given status for an entity type."""

    entity: str
    status: str
    count: int


class DashboardSummary(BaseModel):
    """Aggregated dashboard counts per entity per status."""

    by_entity: list[EntityStatusCount]


class RecentActivityEntry(BaseModel):
    """Lightweight entry for the dashboard activity feed."""

    id: int
    entity: str
    entity_id: str
    old_state: str
    new_state: str
    action: str
    actioned_by: int | None
    comment: str | None
    timestamp: datetime

    class Config:
        from_attributes = True
