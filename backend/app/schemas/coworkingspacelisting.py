from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, time
from enum import Enum

class CoworkingSpaceListingBase(BaseModel):

    title: Optional[str]

    description: Optional[str]

    address: Optional[str]

    city: Optional[str]

    state: Optional[str]

    zip_code: Optional[str]

    country: Optional[str]

    latitude: Optional[float]

    longitude: Optional[float]

    price_per_hour: Optional[float]

    price_per_day: Optional[float]

    price_per_week: Optional[float]

    price_per_month: Optional[float]

    is_verified: Optional[bool]


class CoworkingSpaceListingCreate(CoworkingSpaceListingBase):
    pass

class CoworkingSpaceListingRead(CoworkingSpaceListingBase):
    id: int

    class Config:
        orm_mode = True