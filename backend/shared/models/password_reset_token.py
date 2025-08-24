from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime
from shared.database import Base


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # 'employer', 'employee', etc.
    token = Column(Text, nullable=False, index=True)
    is_used = Column(Boolean, nullable=False, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
