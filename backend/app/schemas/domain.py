"""
Pydantic schemas for domain application APIs.
"""
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class DomainReadBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: str
    version: int
    created_by: int
    created_at: datetime
    updated_at: datetime


class NOCCreate(BaseModel):
    applicant_name: str
    applicant_email: EmailStr
    purpose: str
    property_address: str
    valid_from: date
    valid_to: date


class NOCRead(NOCCreate, DomainReadBase):
    pass


class LOACreate(BaseModel):
    applicant_name: str
    applicant_email: EmailStr
    authorized_person_name: str
    authorized_person_id: str
    scope_of_authorization: str
    valid_from: date
    valid_to: date


class LOARead(LOACreate, DomainReadBase):
    pass


class FinanceCreate(BaseModel):
    applicant_name: str
    department: str
    amount: Decimal = Field(gt=0)
    purpose: str
    supporting_document_ref: str | None = None


class FinanceRead(FinanceCreate, DomainReadBase):
    pass


class RentalCreate(BaseModel):
    tenant_name: str
    tenant_email: EmailStr
    property_address: str
    rental_amount: Decimal = Field(gt=0)
    lease_start: date
    lease_end: date


class RentalRead(RentalCreate, DomainReadBase):
    pass


class CancellationCreate(BaseModel):
    applicant_name: str
    reference_application_id: str
    reference_application_type: str
    reason: str


class CancellationRead(CancellationCreate, DomainReadBase):
    pass
