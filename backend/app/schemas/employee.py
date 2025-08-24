from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

# ✅ Base employee structure
class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone_number: str
    address: str
    city: str
    zip_code: str
    country: str
    timezone: str

# ✅ Registration schema
class EmployeeCreate(EmployeeBase):
    password: str
    latitude: float
    longitude: float
    profile_picture_url: Optional[str] = None
    invite_token: str

# ✅ Login schema
class EmployeeLogin(BaseModel):
    email: str
    password: str

# ✅ Attendance history response schema
class AttendanceOut(BaseModel):
    id: int
    date: date
    clock_in: Optional[datetime]
    clock_out: Optional[datetime]

    class Config:
        orm_mode = True

# ✅ Summary schema for listing employees
class EmployeeSummary(BaseModel):
    id: int
    name: str
    email: str
    address: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True


class EmployeeUpdate(BaseModel):
    address: Optional[str]
    city: Optional[str]

    class Config:
        from_attributes = True

class EmployeeOut(BaseModel):
    id: int
    name: str
    email: str
    contact_number: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    country: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    employer_id: Optional[int]

    class Config:
        orm_mode = True
