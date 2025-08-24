from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from shared.database import Base


class TaskAssignment(Base):
    __tablename__ = "task_assignments"

    id = Column(Integer, primary_key=True, index=True)
    assigned_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Foreign Keys
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    employer_id = Column(Integer, ForeignKey("employers.id"), nullable=False)
    assigned_by_id = Column(Integer, ForeignKey("employers.id"), nullable=False)
    
    # Relationships
    task = relationship("Task", back_populates="task_assignments")
    employee = relationship("Employee", back_populates="task_assignments")
    employer = relationship("Employer", back_populates="task_assignments", foreign_keys=[employer_id])
    assigned_by = relationship("Employer", foreign_keys=[assigned_by_id])
