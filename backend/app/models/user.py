"""
User database model.
"""
from sqlalchemy import Column, Integer, String
from app.models.base import Base


class User(Base):
    """User model for storing user information and roles."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, index=True)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, name={self.name}, role={self.role})>"
