"""initial postgresql schema

Revision ID: 20260501_0001
Revises:
Create Date: 2026-05-01
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260501_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _timestamps() -> list[sa.Column]:
    return [
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    ]


def _workflow_columns(status_default: str) -> list[sa.Column]:
    return [
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=100), nullable=False, server_default=status_default),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_by", sa.Integer(), nullable=False),
        *_timestamps(),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
    ]


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"])
    op.create_index(op.f("ix_users_role"), "users", ["role"])

    op.create_table(
        "noc",
        *_workflow_columns("DRAFT"),
        sa.Column("applicant_name", sa.String(length=255), nullable=False),
        sa.Column("applicant_email", sa.String(length=255), nullable=False),
        sa.Column("purpose", sa.Text(), nullable=False),
        sa.Column("property_address", sa.Text(), nullable=False),
        sa.Column("valid_from", sa.Date(), nullable=False),
        sa.Column("valid_to", sa.Date(), nullable=False),
    )
    op.create_table(
        "loa",
        *_workflow_columns("DRAFT"),
        sa.Column("applicant_name", sa.String(length=255), nullable=False),
        sa.Column("applicant_email", sa.String(length=255), nullable=False),
        sa.Column("authorized_person_name", sa.String(length=255), nullable=False),
        sa.Column("authorized_person_id", sa.String(length=255), nullable=False),
        sa.Column("scope_of_authorization", sa.Text(), nullable=False),
        sa.Column("valid_from", sa.Date(), nullable=False),
        sa.Column("valid_to", sa.Date(), nullable=False),
    )
    op.create_table(
        "finance",
        *_workflow_columns("PENDING"),
        sa.Column("applicant_name", sa.String(length=255), nullable=False),
        sa.Column("department", sa.String(length=255), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("purpose", sa.Text(), nullable=False),
        sa.Column("supporting_document_ref", sa.String(length=255), nullable=True),
    )
    op.create_table(
        "rental",
        *_workflow_columns("DRAFT"),
        sa.Column("tenant_name", sa.String(length=255), nullable=False),
        sa.Column("tenant_email", sa.String(length=255), nullable=False),
        sa.Column("property_address", sa.Text(), nullable=False),
        sa.Column("rental_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("lease_start", sa.Date(), nullable=False),
        sa.Column("lease_end", sa.Date(), nullable=False),
    )
    op.create_table(
        "cancellation",
        *_workflow_columns("REQUESTED"),
        sa.Column("applicant_name", sa.String(length=255), nullable=False),
        sa.Column("reference_application_id", sa.String(length=255), nullable=False),
        sa.Column("reference_application_type", sa.String(length=100), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
    )
    op.create_table(
        "workflow_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("entity", sa.String(length=100), nullable=False),
        sa.Column("entity_id", sa.String(length=36), nullable=False),
        sa.Column("old_state", sa.String(length=100), nullable=False),
        sa.Column("new_state", sa.String(length=100), nullable=False),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("actioned_by", sa.Integer(), nullable=True),
        sa.Column("submitter_id", sa.Integer(), nullable=True),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["actioned_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["submitter_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "application_status",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("entity", sa.String(length=100), nullable=False),
        sa.Column("entity_id", sa.String(length=36), nullable=False),
        sa.Column("current_state", sa.String(length=100), nullable=False),
        sa.Column("pending_roles", sa.Text(), nullable=False),
        sa.Column("actioned_by", sa.Integer(), nullable=True),
        sa.Column("last_action", sa.String(length=100), nullable=True),
        sa.Column("last_comment", sa.Text(), nullable=True),
        sa.Column("submitted_by", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["actioned_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["submitted_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("entity", "entity_id", name="uq_application_status_entity"),
    )


def downgrade() -> None:
    op.drop_table("application_status")
    op.drop_table("workflow_history")
    op.drop_table("cancellation")
    op.drop_table("rental")
    op.drop_table("finance")
    op.drop_table("loa")
    op.drop_table("noc")
    op.drop_table("users")
