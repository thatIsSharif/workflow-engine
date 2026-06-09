"""
User service layer.
"""
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.repositories.user_repo import UserRepository


class UserService:
    """Service for user business logic."""

    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.repository = UserRepository(db)

    def create_user(self, user_create: UserCreate) -> User:
        """
        Create a new user.

        Args:
            user_create: User creation schema

        Returns:
            User: Created user
        """
        return self.repository.create(user_create)

    def get_user(self, user_id: int) -> User:
        """
        Get user by ID.

        Args:
            user_id: User ID

        Returns:
            User

        Raises:
            ValueError: If user not found
        """
        user = self.repository.get_by_id(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        return user

    def list_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        """
        List all users.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records

        Returns:
            List of users
        """
        return self.repository.get_all(skip=skip, limit=limit)
