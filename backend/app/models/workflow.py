"""
Workflow audit and projection models.
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint

from app.models.base import Base
from app.utils import utc_now


class WorkflowHistory(Base):
    """Append-only audit trail for workflow state transitions."""

    __tablename__ = "workflow_history"

    id = Column(Integer, primary_key=True, index=True)
    entity = Column(String(100), nullable=False, index=True)
    entity_id = Column(String(36), nullable=False, index=True)
    old_state = Column(String(100), nullable=False)
    new_state = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)
    actioned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    submitter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    comment = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now, nullable=False, index=True)


class ApplicationStatus(Base):
    """Current workflow state projection for fast reads and dashboards."""

    __tablename__ = "application_status"
    __table_args__ = (
        UniqueConstraint("entity", "entity_id", name="uq_application_status_entity"),
    )

    id = Column(Integer, primary_key=True, index=True)
    entity = Column(String(100), nullable=False, index=True)
    entity_id = Column(String(36), nullable=False, index=True)
    current_state = Column(String(100), nullable=False)
    pending_roles = Column(Text, nullable=False)
    actioned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    last_action = Column(String(100), nullable=True)
    last_comment = Column(Text, nullable=True)
    submitted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(
        DateTime, default=utc_now, onupdate=utc_now, nullable=False
    )
