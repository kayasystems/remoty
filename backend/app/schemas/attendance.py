from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, time
from enum import Enum

class AttendanceBase(BaseModel):

    employee_id: Optional[int]

    employer_id: Optional[int]

    date: Optional[date]

    clock_in: Optional[datetime]

    clock_out: Optional[datetime]


class AttendanceCreate(AttendanceBase):
    pass

class AttendanceRead(AttendanceBase):
    id: int

    class Config:
        orm_mode = True