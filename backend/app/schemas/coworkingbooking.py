from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, time
from enum import Enum

class CoworkingBookingBase(BaseModel):

    employee_id: Optional[int]

    employer_id: Optional[int]

    coworking_listing_id: Optional[int]

    package_type: Optional[str]

    package_quantity: Optional[int]

    date: Optional[date]

    start_time: Optional[time]

    end_time: Optional[time]

    total_cost: Optional[float]

    created_at: Optional[datetime]


class CoworkingBookingCreate(CoworkingBookingBase):
    pass

class CoworkingBookingRead(CoworkingBookingBase):
    id: int

    class Config:
        orm_mode = True