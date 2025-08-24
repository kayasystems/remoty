from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Date, Time, Enum, ForeignKey
from sqlalchemy.orm import relationship
from shared.database import Base
import enum

class AttendanceStatus(enum.Enum):
    ATTENDED = "attended"  # Green - Full day attendance (8+ hours)
    PARTIAL = "partial"    # Orange - Partial attendance (4-7.9 hours)
    ABSENT = "absent"      # Red - No attendance or <4 hours

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    employer_id = Column(Integer, ForeignKey("employers.id"), nullable=False)
    date = Column(Date, nullable=False)
    clock_in = Column(DateTime, nullable=True)
    clock_out = Column(DateTime, nullable=True)
    total_hours = Column(Float, nullable=True, default=0.0)
    status = Column(Enum(AttendanceStatus), nullable=False, default=AttendanceStatus.ABSENT)
    notes = Column(String(500), nullable=True)
    
    # Relationships
    employee = relationship("Employee", back_populates="attendance_records")
    employer = relationship("Employer", back_populates="attendance_records")
    
    def calculate_status(self):
        """Calculate attendance status based on total hours"""
        if self.total_hours >= 8.0:
            return AttendanceStatus.ATTENDED
        elif self.total_hours >= 4.0:
            return AttendanceStatus.PARTIAL
        else:
            return AttendanceStatus.ABSENT


