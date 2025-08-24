from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Date, Time, Enum, ForeignKey
from shared.database import Base
from sqlalchemy.orm import relationship


class CoworkingSpaceListing(Base):
    __tablename__ = "coworkingspacelistings"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    address = Column(String)
    city = Column(String)
    state = Column(String)
    zip_code = Column(String)
    country = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    price_per_hour = Column(Float)
    price_per_day = Column(Float)
    price_per_week = Column(Float)
    price_per_month = Column(Float)
    opening_hours = Column(String)  # e.g., "Mon-Fri: 9:00 AM - 6:00 PM, Sat-Sun: 10:00 AM - 4:00 PM"
    timezone = Column(String)  # e.g., "America/New_York", "Europe/London", "Asia/Karachi"
    is_24_7 = Column(Boolean, default=False)  # True if space operates 24/7
    amenities = Column(String)  # JSON string of amenities
    packages = Column(String)  # JSON string of detailed packages
    is_verified = Column(Boolean)
    
    # Foreign Key
    coworking_user_id = Column(Integer, ForeignKey("coworking_users.id"), nullable=True)
    
    # Relationships
    bookings = relationship("CoworkingBooking", back_populates="coworking_space", cascade="all, delete-orphan")
    coworking_user = relationship("CoworkingUser", back_populates="coworking_spaces")
    space_amenities = relationship("SpaceAmenity", back_populates="coworking_space", cascade="all, delete-orphan")
    # Note: CoworkingImage relationship will be added when the model is properly imported
    # images = relationship("CoworkingImage", back_populates="coworking_space", cascade="all, delete-orphan")




