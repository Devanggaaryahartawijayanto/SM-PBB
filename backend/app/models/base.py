from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
import uuid


class Base(SQLModel):
    pass


class UUIDBase(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


class TimestampMixin(SQLModel):
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: datetime = Field(default_factory=lambda: datetime.now())


# Generic message
class APIMessage(SQLModel):
    message: str
