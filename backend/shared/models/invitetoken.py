from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from shared.database import Base

class InviteToken(Base):
    __tablename__ = "invitetokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id"))
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime)

    employer = relationship("Employer", back_populates="invite_tokens")
