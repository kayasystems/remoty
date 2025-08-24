from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from shared.database import Base
from datetime import datetime

class CoworkingImage(Base):
    __tablename__ = "coworking_images"
    
    id = Column(Integer, primary_key=True, index=True)
    space_id = Column(Integer, ForeignKey("coworkingspacelistings.id"), nullable=False)
    package_id = Column(String, nullable=True)  # Package ID from the packages JSON
    image_url = Column(String, nullable=False)
    image_name = Column(String, nullable=True)
    image_description = Column(String, nullable=True)
    is_primary = Column(Integer, default=0)  # 1 for primary image, 0 for others
    # Thumbnail fields
    thumbnail_url = Column(String, nullable=True)  # URL to the thumbnail image
    thumbnail_small_url = Column(String, nullable=True)  # URL to small thumbnail (e.g., 150x150)
    thumbnail_medium_url = Column(String, nullable=True)  # URL to medium thumbnail (e.g., 300x300)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship - temporarily disabled until properly configured
    # coworking_space = relationship("CoworkingSpaceListing", back_populates="images")
