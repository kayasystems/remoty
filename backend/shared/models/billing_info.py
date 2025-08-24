from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from shared.database import Base

class BillingInfo(Base):
    __tablename__ = "billing_info"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id"))
    
    # Company billing details
    company_name = Column(String, nullable=False)
    billing_email = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    
    # Billing address
    address_line_1 = Column(String, nullable=False)
    address_line_2 = Column(String, nullable=True)
    city = Column(String, nullable=False)
    state_province = Column(String, nullable=False)
    postal_code = Column(String, nullable=False)
    country = Column(String, nullable=False)
    
    # Tax information
    tax_id = Column(String, nullable=True)  # VAT/GST number
    
    # Payment preferences
    preferred_payment_method = Column(String, default="credit_card")  # credit_card, bank_transfer
    
    # System fields
    is_default = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    employer = relationship("Employer", back_populates="billing_info")
