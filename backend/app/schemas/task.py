from typing import Literal
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field , field_validator

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=1000)
    status: Literal["pending", "in_progress", "completed"] = "pending"
    priority: Literal["low", "medium", "high"] = "medium"
    due_date: datetime | None = None
    assigned_to: UUID


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=1000)
    status: Literal["pending", "in_progress", "completed"] | None = None
    priority: Literal["low", "medium", "high"] | None = None
    due_date: datetime | None = None  # explicit null clears the due date
    assigned_to: UUID | None = None

    # Fields that are present must not be null (due_date is the exception)
    @field_validator("title", "description", "status", "priority", "assigned_to", mode="before")
    @classmethod
    def not_null(cls, v):
        if v is None:
            raise ValueError("This field cannot be null")
        return v