from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InviteTokenBase(BaseModel):
    token: Optional[str]
    employer_id: Optional[int]
    is_used: Optional[bool]
    expires_at: Optional[datetime]

class InviteTokenCreate(BaseModel):
    expires_in_minutes: Optional[int] = 60  # ✅ default to 60 min, override as needed

class InviteTokenRead(InviteTokenBase):
    id: int

    class Config:
        from_attributes = True  # ✅ updated for Pydantic v2
