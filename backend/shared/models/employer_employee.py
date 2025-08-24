from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from shared.database import Base


class EmployerEmployee(Base):
    __tablename__ = "employer_employee"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    assigned_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    status = Column(String(255), nullable=False, default='active')
    role_title = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)

    # Relationships
    employer = relationship("Employer", back_populates="employer_employees")
    employee = relationship("Employee", back_populates="employer_employees")
