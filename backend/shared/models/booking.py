from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from shared.database import Base

class CoworkingBooking(Base):
    __tablename__ = "coworking_bookings"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    coworking_space_id = Column(Integer, ForeignKey("coworkingspacelistings.id"))

    booking_type = Column(String)  # daily, weekly, monthly
    subscription_mode = Column(String, nullable=True)  # full_time, half_day, one_day_per_month, etc.
    is_ongoing = Column(Boolean, default=False)
    start_date = Column(Date)
    end_date = Column(Date)

    days_of_week = Column(String, nullable=True)  # e.g. "Mon,Wed,Fri"
    duration_per_day = Column(Integer, nullable=True)  # in hours
    total_cost = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    payment_intent_id = Column(String, nullable=True)  # Stripe payment intent ID
    subscription_id = Column(String, nullable=True)  # Stripe subscription ID
    payment_status = Column(String, default="pending")  # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    employee = relationship("Employee", back_populates="bookings")
    coworking_space = relationship("CoworkingSpaceListing")
    employer = relationship("Employer", back_populates="bookings")
