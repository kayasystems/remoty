from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from shared.database import Base
from datetime import datetime


class Amenity(Base):
    __tablename__ = "amenities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    icon = Column(String)  # Icon name or class for UI display
    category = Column(String)  # e.g., "connectivity", "facilities", "services"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    space_amenities = relationship("SpaceAmenity", back_populates="amenity", cascade="all, delete-orphan")
    package_amenities = relationship("PackageAmenity", back_populates="amenity", cascade="all, delete-orphan")


class SpaceAmenity(Base):
    __tablename__ = "space_amenities"
    
    id = Column(Integer, primary_key=True, index=True)
    space_id = Column(Integer, ForeignKey("coworkingspacelistings.id"), nullable=False)
    amenity_id = Column(Integer, ForeignKey("amenities.id"), nullable=False)
    coworking_user_id = Column(Integer, ForeignKey("coworking_users.id"), nullable=False)
    is_available = Column(Boolean, default=True)
    notes = Column(String)  # Additional notes about this amenity for this space
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    coworking_space = relationship("CoworkingSpaceListing", back_populates="space_amenities")
    amenity = relationship("Amenity", back_populates="space_amenities")
    coworking_user = relationship("CoworkingUser")


class PackageAmenity(Base):
    __tablename__ = "package_amenities"
    
    id = Column(Integer, primary_key=True, index=True)
    package_id = Column(String, nullable=False)  # Package ID from JSON packages field
    space_id = Column(Integer, ForeignKey("coworkingspacelistings.id"), nullable=False)
    amenity_id = Column(Integer, ForeignKey("amenities.id"), nullable=False)
    coworking_user_id = Column(Integer, ForeignKey("coworking_users.id"), nullable=False)
    is_included = Column(Boolean, default=True)
    additional_cost = Column(Integer, default=0)  # Additional cost in cents if any
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    coworking_space = relationship("CoworkingSpaceListing")
    amenity = relationship("Amenity", back_populates="package_amenities")
    coworking_user = relationship("CoworkingUser")
