from pydantic import BaseModel
from typing import Optional

# ✅ For Admin to create coworking space listings
class CoworkingSpaceCreate(BaseModel):
    title: str
    description: Optional[str]
    address: str
    city: str
    price_per_hour: Optional[float]
    price_per_day: Optional[float]
    price_per_week: Optional[float]
    price_per_month: Optional[float]
    is_verified: bool = False

# ✅ For viewing coworking space details (employer, employee)
class CoworkingSpaceOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    address: str
    city: str
    latitude: float
    longitude: float
    price_per_hour: Optional[float]
    price_per_day: Optional[float]
    price_per_week: Optional[float]
    price_per_month: Optional[float]
    is_verified: bool

    class Config:
        orm_mode = True

class NearbyCoworkingSpaceOut(BaseModel):
    id: int
    title: str
    full_address: str
    distance_km: float
    latitude: float        # ✅ required for Google Map markers
    longitude: float       # ✅ required for Google Map markers
    price_per_hour: Optional[float]
    price_per_day: Optional[float]
    price_per_week: Optional[float]
    price_per_month: Optional[float]
    description: Optional[str]
    opening_hours: Optional[str]
    amenities: Optional[str]  # JSON string
    packages: Optional[str]   # JSON string

    class Config:
        orm_mode = True

class CoworkingAddressSearch(BaseModel):
    address: str
    city: str
    state: str
    zip_code: Optional[str] = None
    country: str
    radius_km: float
    latitude: float
    longitude: float