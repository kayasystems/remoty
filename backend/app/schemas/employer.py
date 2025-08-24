from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import date, datetime



class EmployerBase(BaseModel):
    name: str = Field(..., example="Acme Corp")
    email: EmailStr
    password: Optional[str] = None  # only required in EmployerCreate
    timezone: str = Field(..., example="Asia/Karachi")

    website: Optional[str] = Field(None, example="https://acme.com")
    industry: Optional[str] = Field(None, example="Software")
    size: Optional[str] = Field(None, example="51-200")
    contact_number: Optional[str] = Field(None, example="+92-300-1234567")
    address: str = Field(..., example="123 Main Street")
    city: str = Field(..., example="Lahore")
    state: str = Field(..., example="Punjab")
    country: str = Field(..., example="Pakistan")

    @validator("website", pre=True, always=True)
    def convert_httpurl_to_str(cls, v):
        return str(v) if v else None


class EmployerCreate(EmployerBase):
    password: str = Field(..., min_length=6)  # required in this class


class EmployerLogin(BaseModel):
    email: EmailStr
    password: str


class EmployerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None
    profile_picture_url: Optional[str] = None
    number_of_remote_employees: Optional[int] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None

    @validator("website", pre=True, always=True)
    def convert_httpurl_to_str(cls, v):
        return str(v) if v else None


# ✅ Booking List View Schema (Updated for cost and type)
class BookingListItem(BaseModel):
    id: int
    employee_name: str
    coworking_space_name: str
    coworking_space_address: str
    start_date: date
    end_date: date
    total_cost: Optional[float]
    booking_type: Optional[str]

    model_config = {"from_attributes": True}


# ✅ Booking Detail View Schema (Updated for cost and type)
class BookingDetail(BaseModel):
    id: int
    start_date: date
    end_date: date
    created_at: datetime
    total_cost: Optional[float]
    booking_type: Optional[str]

    employee_name: str
    employee_email: str
    employee_contact: str
    employee_address: str
    employee_city: str
    employee_country: str

    coworking_name: str
    coworking_address: str
    coworking_city: str
    coworking_country: str

    model_config = {"from_attributes": True}

class CoworkingSearchRequest(BaseModel):
    address: str
    city: str
    state: str
    zip_code: Optional[str] = None
    country: str
    radius_km: int
    latitude: float
    longitude: float


class SubscriptionRequest(BaseModel):
    coworking_space_id: int
    package_id: str
    customer_email: str
    customer_name: str
    payment_method_id: str
    booking_data: dict

