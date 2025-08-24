from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TaskCommentBase(BaseModel):
    content: str


class TaskCommentCreate(TaskCommentBase):
    pass


class TaskCommentUpdate(BaseModel):
    content: Optional[str] = None


class TaskComment(TaskCommentBase):
    id: int
    task_id: int
    author_id: int
    author_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
