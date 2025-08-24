"""
Complete Employee Routes - Independent from Other Modules
All employee-related endpoints in one place
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from shared.database import get_db
from shared.models.employee import Employee
from shared.models.employer import Employer
from shared.models.coworking_user import CoworkingUser
from shared.models.coworkingspacelisting import CoworkingSpaceListing
from shared.models.booking import CoworkingBooking
from shared.models.invitetoken import InviteToken
from shared.models.employer_employee import EmployerEmployee
from employee_module.auth.employee_auth import get_current_employee_user
from app.auth import hash_password, verify_password, create_access_token
from app.schemas.employee import EmployeeCreate as EmployeeCreateSchema

router = APIRouter(prefix="/employee", tags=["Employee"])

# ===== AUTHENTICATION ENDPOINTS =====

class EmployeeLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
def register_employee(data: EmployeeCreateSchema, db: Session = Depends(get_db)):
    """Register a new employee with invite token validation"""
    # Validate invite token
    token = db.query(InviteToken).filter_by(token=data.invite_token, is_used=False).first()
    if not token or token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired invite token")
    
    # Check if email already exists
    existing = db.query(Employee).filter_by(email=data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(data.password)
    
    new_employee = Employee(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone_number=data.phone_number,
        password_hash=hashed_password,
        address=data.address,
        city=data.city,
        zip_code=data.zip_code,
        country=data.country,
        latitude=data.latitude,
        longitude=data.longitude,
        timezone=data.timezone,
        profile_picture_url=data.profile_picture_url,
        invite_token_used=data.invite_token
    )
    
    # Mark token as used
    token.is_used = True
    
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    
    # Create employer-employee relationship
    employer_employee = EmployerEmployee(
        employer_id=token.employer_id,
        employee_id=new_employee.id,
        role_title="Employee"
    )
    db.add(employer_employee)
    db.commit()
    
    return {"message": "Employee registered successfully", "id": new_employee.id}

@router.post("/login")
def login_employee(data: EmployeeLogin, db: Session = Depends(get_db)):
    """Login employee"""
    employee = db.query(Employee).filter_by(email=data.email).first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="No account found with this email address. Please check your email or register for a new account.")
    
    if not verify_password(data.password, employee.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password. Please check your password and try again.")

    token = create_access_token({"sub": str(employee.id), "role": "employee"})
    return {"access_token": token, "token_type": "bearer"}

# ===== PROFILE ENDPOINTS =====

@router.get("/me")
def get_employee_profile(current_user=Depends(get_current_employee_user), db: Session = Depends(get_db)):
    """Get employee profile"""
    employee = current_user["user"]
    
    # Get employer info if associated
    employer_info = None
    if employee.employer_id:
        employer = db.query(Employer).filter(Employer.id == employee.employer_id).first()
        if employer:
            employer_info = {
                "id": employer.id,
                "company_name": employer.company_name,
                "email": employer.email
            }
    
    return {
        "id": employee.id,
        "first_name": employee.first_name,
        "last_name": employee.last_name,
        "email": employee.email,
        "phone": employee.phone_number,
        "employer": employer_info,
        "created_at": employee.created_at
    }

# ===== DASHBOARD ENDPOINTS =====

class EmployeeStats(BaseModel):
    total_bookings: int
    active_bookings: int
    completed_bookings: int
    total_spent: float
    favorite_spaces: int

@router.get("/dashboard/stats")
def get_employee_stats(
    current_user=Depends(get_current_employee_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for employee"""
    employee = current_user["user"]
    
    # Count bookings made by this employee
    total_bookings = db.query(CoworkingBooking).filter(
        CoworkingBooking.employee_id == employee.id
    ).count()
    
    # Count active bookings (future or current)
    active_bookings = db.query(CoworkingBooking).filter(
        CoworkingBooking.employee_id == employee.id,
        CoworkingBooking.end_date >= datetime.now().date()
    ).count()
    
    # Count completed bookings
    completed_bookings = db.query(CoworkingBooking).filter(
        CoworkingBooking.employee_id == employee.id,
        CoworkingBooking.end_date < datetime.now().date()
    ).count()
    
    # Calculate total spent
    bookings = db.query(CoworkingBooking).filter(
        CoworkingBooking.employee_id == employee.id
    ).all()
    
    total_spent = sum(booking.total_price for booking in bookings if booking.total_price)
    
    # Count unique spaces booked (as favorite spaces metric)
    favorite_spaces = db.query(CoworkingBooking.space_id).filter(
        CoworkingBooking.employee_id == employee.id
    ).distinct().count()
    
    return {
        "total_bookings": total_bookings,
        "active_bookings": active_bookings,
        "completed_bookings": completed_bookings,
        "total_spent": float(total_spent),
        "favorite_spaces": favorite_spaces
    }

# ===== BOOKING ENDPOINTS =====

@router.get("/bookings")
def get_employee_bookings(
    current_user=Depends(get_current_employee_user),
    db: Session = Depends(get_db)
):
    """Get all bookings for current employee"""
    employee = current_user["user"]
    
    bookings = db.query(CoworkingBooking).filter(
        CoworkingBooking.employee_id == employee.id
    ).order_by(CoworkingBooking.created_at.desc()).all()
    
    booking_list = []
    for booking in bookings:
        # Get space details
        space = db.query(CoworkingSpaceListing).filter(
            CoworkingSpaceListing.id == booking.space_id
        ).first()
        
        space_info = None
        if space:
            space_info = {
                "id": space.id,
                "title": space.title,
                "city": space.city,
                "country": space.country,
                "address": space.address
            }
        
        booking_data = {
            "id": booking.id,
            "space": space_info,
            "start_date": booking.start_date,
            "end_date": booking.end_date,
            "total_price": booking.total_price,
            "booking_type": booking.booking_type,
            "status": booking.status,
            "created_at": booking.created_at
        }
        booking_list.append(booking_data)
    
    return {"bookings": booking_list, "total_count": len(booking_list)}

# ===== PROFILE MANAGEMENT ENDPOINTS =====

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None

@router.put("/profile")
def update_employee_profile(
    data: EmployeeUpdate,
    current_user=Depends(get_current_employee_user),
    db: Session = Depends(get_db)
):
    """Update employee profile"""
    employee = current_user["user"]
    
    # Update fields if provided
    if data.first_name is not None:
        employee.first_name = data.first_name
    if data.last_name is not None:
        employee.last_name = data.last_name
    if data.phone_number is not None:
        employee.phone_number = data.phone_number
    
    db.commit()
    db.refresh(employee)
    
    return {"message": "Profile updated successfully"}

# ===== DELETE EMPLOYEE ACCOUNT =====

@router.delete("/delete")
def delete_employee_account(
    current_user=Depends(get_current_employee_user),
    db: Session = Depends(get_db)
):
    """Delete employee account and all associated data"""
    try:
        employee = current_user["user"]
        
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        print(f"🔍 Attempting to delete employee: {employee.id} - {employee.email}")
        
        # Delete employee account
        db.delete(employee)
        db.commit()
        print(f"✅ Employee deleted successfully")
        
        return {"message": "Account deleted successfully"}
        
    except Exception as e:
        print(f"❌ Error during deletion: {str(e)}")
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")

# ===== HEALTH CHECK =====

@router.get("/health")
def employee_health_check():
    """Employee module health check"""
    return {
        "status": "healthy",
        "module": "employee",
        "service": "running",
        "timestamp": datetime.now()
    }
