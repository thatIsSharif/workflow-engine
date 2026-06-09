"""
Pydantic schemas for User models.
"""
from pydantic import BaseModel, Field


class UserBase(BaseModel):
    """Base user schema."""

    name: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=50)


class UserCreate(UserBase):
    """Schema for creating a user."""

    pass


class UserResponse(UserBase):
    """Schema for user response."""

    id: int

    class Config:
        from_attributes = True
