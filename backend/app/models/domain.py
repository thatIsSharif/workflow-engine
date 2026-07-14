"""
Domain application tables.
"""
import uuid

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.types import Uuid

from app.models.base import Base
from app.utils import utc_now


class TimestampMixin:
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(
        DateTime, default=utc_now, onupdate=utc_now, nullable=False
    )


class WorkflowEntityMixin(TimestampMixin):
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    status = Column(String(100), nullable=False)
    version = Column(Integer, default=1, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)


class NOC(WorkflowEntityMixin, Base):
    __tablename__ = "noc"

    applicant_name = Column(String(255), nullable=False)
    applicant_email = Column(String(255), nullable=False)
    purpose = Column(Text, nullable=False)
    property_address = Column(Text, nullable=False)
    valid_from = Column(Date, nullable=False)
    valid_to = Column(Date, nullable=False)
    status = Column(String(100), default="DRAFT", nullable=False)


class LOA(WorkflowEntityMixin, Base):
    __tablename__ = "loa"

    applicant_name = Column(String(255), nullable=False)
    applicant_email = Column(String(255), nullable=False)
    authorized_person_name = Column(String(255), nullable=False)
    authorized_person_id = Column(String(255), nullable=False)
    scope_of_authorization = Column(Text, nullable=False)
    valid_from = Column(Date, nullable=False)
    valid_to = Column(Date, nullable=False)
    status = Column(String(100), default="DRAFT", nullable=False)


class FinanceRequest(WorkflowEntityMixin, Base):
    __tablename__ = "finance"

    applicant_name = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    purpose = Column(Text, nullable=False)
    supporting_document_ref = Column(String(255), nullable=True)
    status = Column(String(100), default="PENDING", nullable=False)


class Rental(WorkflowEntityMixin, Base):
    __tablename__ = "rental"

    tenant_name = Column(String(255), nullable=False)
    tenant_email = Column(String(255), nullable=False)
    property_address = Column(Text, nullable=False)
    rental_amount = Column(Numeric(12, 2), nullable=False)
    lease_start = Column(Date, nullable=False)
    lease_end = Column(Date, nullable=False)
    status = Column(String(100), default="DRAFT", nullable=False)


class Cancellation(WorkflowEntityMixin, Base):
    __tablename__ = "cancellation"

    applicant_name = Column(String(255), nullable=False)
    reference_application_id = Column(String(255), nullable=False)
    reference_application_type = Column(String(100), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(100), default="REQUESTED", nullable=False)
