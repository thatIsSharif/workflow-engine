"""Utils package."""

from datetime import UTC, datetime


def utc_now() -> datetime:
    """Return current UTC datetime as a naive datetime (no tzinfo).

    Replaces the deprecated ``datetime.utcnow()``. Returns a naive
    datetime so SQLAlchemy ``DateTime`` columns (without timezone)
    continue to work as expected.
    """
    return datetime.now(UTC).replace(tzinfo=None)
