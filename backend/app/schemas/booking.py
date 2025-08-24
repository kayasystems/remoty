from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


# ✅ Booking creation schema (used for POST)
class CoworkingBookingCreate(BaseModel):
    employee_id: Optional[int] = None  # Optional for employer self-bookings
    coworking_space_id: int
    booking_type: str  # 'one-time' or 'subscription'
    start_date: date
    end_date: Optional[date] = None  # Optional if ongoing
    subscription_mode: Optional[str] = None  # 'daily', 'weekly', 'monthly', etc.
    is_ongoing: Optional[bool] = False
    days_of_week: Optional[str] = None  # e.g. 'mon,wed'
    duration_per_day: Optional[float] = None  # e.g. 4.0 or 9.0
    total_cost: Optional[float] = None
    notes: Optional[str] = None
    payment_intent_id: Optional[str] = None  # Stripe payment intent ID
    subscription_id: Optional[str] = None  # Stripe subscription ID for ongoing bookings
    payment_type: Optional[str] = "one_time"  # one_time, subscription
    payment_status: Optional[str] = "pending"  # pending, completed, failed

    class Config:
        from_attributes = True


# ✅ Booking update schema (used for PUT – no employee_id or coworking_space_id)
class CoworkingBookingUpdate(BaseModel):
    booking_type: str
    start_date: date
    end_date: Optional[date] = None
    subscription_mode: Optional[str] = None
    is_ongoing: Optional[bool] = False
    days_of_week: Optional[str] = None
    duration_per_day: Optional[float] = None
    total_cost: Optional[float] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


# ✅ Booking List View Schema
class BookingListItem(BaseModel):
    id: int
    employee_name: str
    coworking_space_name: str
    coworking_space_address: str
    start_date: date
    end_date: date
    booking_type: str
    total_cost: Optional[float]

    class Config:
        from_attributes = True


# ✅ Booking Detail Schema for Viewing and Editing
class BookingDetail(BaseModel):
    id: int
    start_date: date
    end_date: date
    created_at: datetime
    total_cost: Optional[float]
    booking_type: str

    subscription_mode: Optional[str]
    is_ongoing: Optional[bool]
    days_of_week: Optional[str]
    duration_per_day: Optional[float]
    notes: Optional[str]

    employee_name: str
    employee_email: str
    employee_contact: Optional[str]
    employee_address: str
    employee_city: str
    employee_country: Optional[str]

    coworking_name: str
    coworking_address: str
    coworking_city: str
    coworking_country: Optional[str]

    class Config:
        from_attributes = True
