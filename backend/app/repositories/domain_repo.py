"""
Generic repository helpers for domain workflow entities.
"""
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session


class DomainRepository:
    """CRUD access for a single domain table."""

    def __init__(self, db: Session, model: type):
        self.db = db
        self.model = model

    def create(self, data: dict[str, Any], created_by: int):
        entity = self.model(**data, created_by=created_by)
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def list(self, skip: int = 0, limit: int = 100):
        return (
            self.db.query(self.model)
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count(self) -> int:
        return self.db.query(self.model).count()

    def get(self, entity_id: str):
        return self.db.get(self.model, UUID(str(entity_id)))
