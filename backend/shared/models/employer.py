from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from shared.database import Base


class Employer(Base):
    __tablename__ = "employers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)
    city = Column(String(255), nullable=False)
    zip_code = Column(String(255), nullable=True)
    country = Column(String(255), nullable=False)
    state = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timezone = Column(String(255), nullable=False)
    phone_number = Column(String(255), nullable=False)
    profile_picture_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = Column(String(255), nullable=False, default='active')
    number_of_remote_employees = Column(Integer, nullable=False, default=0)
    company_name = Column(String(255), nullable=False)
    website = Column(String(255), nullable=True)
    industry = Column(String(255), nullable=True)
    size = Column(String(255), nullable=True)

    # Relationships
    invite_tokens = relationship("InviteToken", back_populates="employer")
    bookings = relationship("CoworkingBooking", back_populates="employer", cascade="all, delete-orphan")
    billing_info = relationship("BillingInfo", back_populates="employer", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="employer", foreign_keys="Task.employer_id", cascade="all, delete-orphan")
    task_assignments = relationship("TaskAssignment", back_populates="employer", foreign_keys="TaskAssignment.employer_id", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="employer", cascade="all, delete-orphan")
    employer_employees = relationship("EmployerEmployee", back_populates="employer", cascade="all, delete-orphan")
    task_comments = relationship("TaskComment", back_populates="author", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="employer", cascade="all, delete-orphan")

