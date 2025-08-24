from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from shared.database import get_db
from app.schemas.employer import SubscriptionRequest
from shared.models.employer import Employer
from shared.models.coworkingspacelisting import CoworkingSpaceListing
from shared.models.booking import CoworkingBooking
from employer_module.auth.employer_auth import get_current_employer_user as get_current_user
import stripe
import os
from datetime import datetime, timedelta
import calendar
from haversine import haversine, Unit
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.employee import EmployeeSummary
from app.schemas import employer as booking_schema
from app.schemas.booking import BookingListItem, BookingDetail
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut
from app.schemas.employer import EmployerUpdate, EmployerCreate
from shared.models.booking import CoworkingBooking
from shared.models.employee import Employee
from shared.models.employer_employee import EmployerEmployee
from app.schemas.coworking import CoworkingAddressSearch, NearbyCoworkingSpaceOut, CoworkingSpaceOut




import secrets
import stripe
import os

from app.utils.hashing import hash_password
from app.utils.geocode import geocode_address as get_coordinates_from_address
from employer_module.auth.employer_auth import get_current_employer_user
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)
from shared.database import get_db

from shared.models import (
    employer as employer_model,
    employee as employee_model,
    attendance as attendance_model,
    invitetoken as token_model,
    coworkingspacelisting as coworking_model,
    booking as booking_model,
    billing_info as billing_model,
    task as task_model,
    task_assignment as task_assignment_model,
    task_comment as task_comment_model
)
from shared.models.attendance import AttendanceStatus

from app.schemas import (
    employer as employer_schema,
    employee as employee_schema,
    invitetoken as token_schema,
    coworking as coworking_schema,
    booking as booking_schema,
    task_comment as task_comment_schema
)
from app.schemas.employee import EmployeeOut


router = APIRouter(prefix="/employer", tags=["Employer"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

def calculate_selected_days_in_month(year: int, month: int, selected_weekdays: list) -> int:
    """
    Calculate the actual number of selected weekdays in a given month.
    
    Args:
        year: Year (e.g., 2024)
        month: Month (1-12)
        selected_weekdays: List of weekday numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
    
    Returns:
        Number of selected weekdays in the specified month
    """
    # Get the number of days in the month
    days_in_month = calendar.monthrange(year, month)[1]
    
    count = 0
    for day in range(1, days_in_month + 1):
        date = datetime(year, month, day)
        weekday = date.weekday()  # 0=Monday, 1=Tuesday, ..., 6=Sunday
        
        # Convert Python weekday (0=Monday) to our format (0=Sunday)
        weekday_sunday_based = (weekday + 1) % 7
        
        if weekday_sunday_based in selected_weekdays:
            count += 1
    
    return count

def get_next_month_billing_amount(selected_weekdays: list, daily_rate: int, subscription_mode: str) -> tuple:
    """
    Calculate billing amount for the next month based on actual selected days count.
    
    Args:
        selected_weekdays: List of selected weekday numbers
        daily_rate: Daily rate in cents
        subscription_mode: 'full_day' or 'half_day'
    
    Returns:
        Tuple of (amount_in_cents, days_count, year, month)
    """
    # Get next month
    today = datetime.now()
    if today.month == 12:
        next_year = today.year + 1
        next_month = 1
    else:
        next_year = today.year
        next_month = today.month + 1
    
    # Calculate actual days in next month
    days_count = calculate_selected_days_in_month(next_year, next_month, selected_weekdays)
    
    # Calculate amount based on subscription mode
    if subscription_mode == 'half_day':
        amount = (daily_rate // 2) * days_count
    else:  # full_day
        amount = daily_rate * days_count
    
    return amount, days_count, next_year, next_month

# ✅ Employer Registration
@router.post("/register")
def register_employer(data: employer_schema.EmployerCreate, db: Session = Depends(get_db)):
    existing = db.query(employer_model.Employer).filter_by(email=data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = hash_password(data.password)

    # Split company name into first_name and last_name for now
    # In a real scenario, you'd want separate fields in the form
    company_parts = data.name.split(' ', 1)
    first_name = company_parts[0] if company_parts else "Company"
    last_name = company_parts[1] if len(company_parts) > 1 else "Admin"
    
    # Mock coordinates for now (you'd normally use geocoding)
    mock_coordinates = {
        'Lahore': (31.5204, 74.3587),
        'Karachi': (24.8607, 67.0011),
        'Islamabad': (33.6844, 73.0479),
    }
    lat, lng = mock_coordinates.get(data.city, (31.5204, 74.3587))

    new_emp = employer_model.Employer(
        first_name=first_name,
        last_name=last_name,
        company_name=data.name,
        email=data.email,
        password_hash=hashed_password,
        timezone=data.timezone,
        website=data.website if data.website else None,
        address=data.address,
        city=data.city,
        state=data.state,
        country=data.country,
        industry=data.industry,
        size=data.size,
        phone_number=data.contact_number or "N/A",
        latitude=lat,
        longitude=lng,
    )

    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)

    return {"message": "Employer registered", "id": new_emp.id}


# ✅ Employer Login
@router.post("/login")
def login_employer(data: employer_schema.EmployerLogin, db: Session = Depends(get_db)):
    employer = db.query(employer_model.Employer).filter_by(email=data.email).first()
    
    if not employer:
        raise HTTPException(status_code=404, detail="No account found with this email address. Please check your email or register for a new account.")
    
    if not verify_password(data.password, employer.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password. Please check your password and try again.")

    token = create_access_token({"sub": str(employer.id), "role": "employer"})
    return {"access_token": token, "token_type": "bearer"}


# ✅ Get Employer Profile
@router.get("/me")
def get_employer_profile(current=Depends(get_current_employer_user)):
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    user = current["user"]
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "company_name": user.company_name,
        "role": current["role"],
        "address": user.address,
        "city": user.city,
        "state": user.state,
        "zip_code": user.zip_code,
        "country": user.country,
        "timezone": user.timezone,
        "phone_number": user.phone_number,
        "latitude": user.latitude,        
        "longitude": user.longitude,
        "status": user.status,
        "number_of_remote_employees": user.number_of_remote_employees,
        "profile_picture_url": user.profile_picture_url,
        "website": user.website,
        "industry": user.industry,
        "size": user.size,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }

# ✅ Edit employer profile information
@router.put("/profile")
def update_employer_profile(
    data: EmployerUpdate,
    current=Depends(get_current_employer_user),
    db: Session = Depends(get_db)
):
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    user_id = current["user"].id

    # ✅ Re-fetch user from DB to attach it to this session
    user = db.query(employer_model.Employer).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employer not found")

    # Check if address-related fields are being updated (and actually changed)
    address_fields = ['address', 'city', 'state', 'country']
    address_changed = False
    
    # Check if any address field is actually changing from current value
    for field in address_fields:
        new_value = getattr(data, field, None)
        if new_value is not None:
            current_value = getattr(user, field, None)
            if new_value != current_value:
                address_changed = True
                break
    
    # Update all provided fields
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    # Only recalculate coordinates if address actually changed AND coordinates weren't manually provided
    if address_changed and 'latitude' not in update_data and 'longitude' not in update_data:
        try:
            # Build full address string
            address_parts = []
            if user.address:
                address_parts.append(user.address)
            if user.city:
                address_parts.append(user.city)
            if user.state:
                address_parts.append(user.state)
            if user.country:
                address_parts.append(user.country)
            
            full_address = ", ".join(address_parts)
            
            if full_address.strip():
                # Geocode the new address
                lat, lon = get_coordinates_from_address(full_address)
                if lat is not None and lon is not None:
                    user.latitude = lat
                    user.longitude = lon
                    print(f"✅ Geocoded new address for employer {user.id}: {lat}, {lon}")
                else:
                    print(f"⚠️ Could not geocode address for employer {user.id}: {full_address}")
        except Exception as e:
            print(f"❌ Error geocoding address for employer {user.id}: {str(e)}")
            # Continue without failing the update - geocoding is not critical
    elif 'latitude' in update_data or 'longitude' in update_data:
        print(f"✅ Using provided coordinates for employer {user.id}: {user.latitude}, {user.longitude}")

    db.commit()
    db.refresh(user)

    # Return the updated user data instead of just a success message
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "company_name": user.company_name,
        "phone_number": user.phone_number,
        "address": user.address,
        "city": user.city,
        "state": user.state,
        "zip_code": user.zip_code,
        "country": user.country,
        "latitude": user.latitude,
        "longitude": user.longitude,
        "timezone": user.timezone,
        "profile_picture_url": user.profile_picture_url,
        "number_of_remote_employees": user.number_of_remote_employees,
        "website": user.website,
        "industry": user.industry,
        "size": user.size,
        "status": user.status,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }


# ✅ Delete Employer Account
@router.delete("/delete")
def delete_account(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    employer_id = current_user["user"].id
    employer = db.query(employer_model.Employer).filter_by(id=employer_id).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")

    db.delete(employer)
    db.commit()

    return {"message": "Account deleted"}


# ✅ Generate Invite Token
@router.post("/invite")
def generate_invite_token(
    data: token_schema.InviteTokenCreate,
    current=Depends(get_current_employer_user),
    db: Session = Depends(get_db)
):
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Access denied")

    token_str = secrets.token_urlsafe(8)
    expires_at = datetime.utcnow() + timedelta(minutes=data.expires_in_minutes)

    token = token_model.InviteToken(
        token=token_str,
        employer_id=current["user"].id,
        expires_at=expires_at,
        is_used=False
    )
    db.add(token)
    db.commit()
    db.refresh(token)

    return {
        "token": token.token,
        "expires_at": token.expires_at
    }


# ✅ View Invite Tokens
@router.get("/invites", response_model=list[token_schema.InviteTokenRead])
def get_invite_tokens(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    tokens = db.query(token_model.InviteToken).filter_by(employer_id=current_user["user"].id).all()
    return tokens


# ✅ Revoke Invite Token
@router.delete("/invites/{token_id}")
def revoke_invite_token(
    token_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    token = db.query(token_model.InviteToken).filter_by(
        id=token_id, employer_id=current_user["user"].id
    ).first()

    if not token:
        raise HTTPException(status_code=404, detail="Token not found")

    if token.is_used:
        raise HTTPException(status_code=400, detail="Token is already used or revoked")

    token.is_used = True
    db.commit()

    return {"detail": "Token successfully revoked"}


# ✅ Daily Attendance Logs
@router.get("/attendance/daily")
def get_daily_attendance(
    date_str: str = Query(..., description="Format: YYYY-MM-DD"),
    current=Depends(get_current_employer_user),
    db: Session = Depends(get_db)
):
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    try:
        query_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    records = db.query(attendance_model.Attendance, employee_model.Employee).join(
        employee_model.Employee,
        attendance_model.Attendance.employee_id == employee_model.Employee.id
    ).filter(
        attendance_model.Attendance.employer_id == current["user"].id,
        attendance_model.Attendance.date == query_date
    ).all()

    return [
        {
            "employee_id": emp.id,
            "employee_name": emp.name,
            "clock_in": att.clock_in,
            "clock_out": att.clock_out
        }
        for att, emp in records
    ]


# ✅ Monthly Attendance Summary
@router.get("/attendance/monthly")
def get_monthly_summary(
    month: str = Query(..., description="Format: YYYY-MM"),
    current=Depends(get_current_employer_user),
    db: Session = Depends(get_db)
):
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    try:
        year, mon = map(int, month.split("-"))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid month format")

    records = db.query(
        attendance_model.Attendance.employee_id,
        employee_model.Employee.first_name,
        employee_model.Employee.last_name,
        func.count(attendance_model.Attendance.id).label("days_present"),
        func.count(attendance_model.Attendance.clock_out).label("days_clocked_out")
    ).join(
        employee_model.Employee,
        attendance_model.Attendance.employee_id == employee_model.Employee.id
    ).filter(
        attendance_model.Attendance.employer_id == current["user"].id,
        extract("year", attendance_model.Attendance.date) == year,
        extract("month", attendance_model.Attendance.date) == mon
    ).group_by(
        attendance_model.Attendance.employee_id,
        employee_model.Employee.first_name,
        employee_model.Employee.last_name
    ).all()

    return [
        {
            "employee_id": r.employee_id,
            "employee_name": f"{r.first_name} {r.last_name}",
            "days_present": r.days_present,
            "days_clocked_out": r.days_clocked_out
        } for r in records
    ]

# New route: Get all attendance logs for a specific employee within a date range
@router.get("/attendance/employee/{employee_id}")
def get_employee_attendance_history(
    employee_id: int,
    start_date: str = Query(..., description="Format: YYYY-MM-DD"),
    end_date: str = Query(..., description="Format: YYYY-MM-DD"),
    current=Depends(get_current_employer_user),
    db: Session = Depends(get_db)
):
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Validate dates
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

    # Validate employee belongs to employer
    employee = db.query(employee_model.Employee).join(
        EmployerEmployee,
        employee_model.Employee.id == EmployerEmployee.employee_id
    ).filter(
        employee_model.Employee.id == employee_id,
        EmployerEmployee.employer_id == current["user"].id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found or unauthorized")

    # Fetch attendance records
    records = db.query(attendance_model.Attendance).filter(
        attendance_model.Attendance.employee_id == employee_id,
        attendance_model.Attendance.employer_id == current["user"].id,
        attendance_model.Attendance.date >= start,
        attendance_model.Attendance.date <= end
    ).order_by(attendance_model.Attendance.date).all()

    return [
        {
            "date": str(record.date),
            "clock_in": str(record.clock_in) if record.clock_in else None,
            "clock_out": str(record.clock_out) if record.clock_out else None,
        }
        for record in records
    ]

# ✅ Get employees without coworking bookings

@router.get("/employees/without-booking", response_model=List[EmployeeOut])
def get_employees_without_booking(
    db: Session = Depends(get_db),
    current = Depends(get_current_employer_user),
):
    subquery = db.query(CoworkingBooking.employee_id).filter(
        CoworkingBooking.employer_id == current["user"].id
    ).subquery()

    employees = db.query(Employee).filter(
        Employee.employer_id == current["user"].id,
        ~Employee.id.in_(subquery)
    ).all()

    return employees


    # Subquery to find all employee IDs who already have bookings
    subquery = db.query(CoworkingBooking.employee_id).filter(
        CoworkingBooking.employer_id == current["user"].id
    ).subquery()

    # Main query to return employees who do NOT have a booking yet
    employees = db.query(Employee).filter(
        Employee.employer_id == current["user"].id,
        ~Employee.id.in_(subquery)
    ).all()

    return employees

# ✅ Employee Task Performance Statistics - MUST be before parameterized route
@router.get("/employees/task-performance")
def get_employees_task_performance(
    days: int = Query(30, description="Number of days to analyze (default: 30)"),
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Get individual employee task performance statistics"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    # Calculate date range
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)
    
    # Get all employees for this employer
    employees = db.query(employee_model.Employee).join(
        EmployerEmployee
    ).filter(
        EmployerEmployee.employer_id == employer_id
    ).all()
    
    if not employees:
        return {
            "employees": [],
            "date_range": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days_analyzed": days
            }
        }
    
    employee_stats = []
    
    for employee in employees:
        # Get task assignments for this employee in the date range
        task_assignments = db.query(task_assignment_model.TaskAssignment).join(
            task_model.Task
        ).filter(
            task_assignment_model.TaskAssignment.employee_id == employee.id,
            task_assignment_model.TaskAssignment.employer_id == employer_id,
            task_assignment_model.TaskAssignment.assigned_at >= start_date,
            task_assignment_model.TaskAssignment.assigned_at <= end_date
        ).all()
        
        # Count tasks by status
        total_tasks = len(task_assignments)
        completed_tasks = sum(1 for assignment in task_assignments 
                            if assignment.task.status == TaskStatus.COMPLETED)
        in_progress_tasks = sum(1 for assignment in task_assignments 
                              if assignment.task.status == TaskStatus.IN_PROGRESS)
        pending_tasks = sum(1 for assignment in task_assignments 
                          if assignment.task.status == TaskStatus.PENDING)
        cancelled_tasks = sum(1 for assignment in task_assignments 
                            if assignment.task.status == TaskStatus.CANCELLED)
        
        # Calculate completion rate
        if total_tasks > 0:
            completion_rate = round((completed_tasks / total_tasks) * 100, 1)
        else:
            completion_rate = 0
        
        employee_stats.append({
            "employee_id": employee.id,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "first_name": employee.first_name,
            "last_name": employee.last_name,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "pending_tasks": pending_tasks,
            "cancelled_tasks": cancelled_tasks,
            "total_tasks": total_tasks,
            "completion_rate": completion_rate
        })
    
    return {
        "employees": employee_stats,
        "date_range": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days_analyzed": days
        }
    }

# ✅ Employee Attendance Statistics - MUST be before parameterized route
@router.get("/employees/attendance-stats")
def get_employees_attendance_stats(
    days: int = Query(30, description="Number of days to analyze (default: 30)"),
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Get individual employee attendance statistics"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    # Calculate date range
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)
    
    # Get all employees for this employer
    employees = db.query(employee_model.Employee).join(
        EmployerEmployee
    ).filter(
        EmployerEmployee.employer_id == employer_id
    ).all()
    
    if not employees:
        return {
            "employees": [],
            "date_range": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days_analyzed": days
            }
        }
    
    employee_stats = []
    
    for employee in employees:
        # Get attendance records for this employee in the date range
        attendance_records = db.query(attendance_model.Attendance).filter(
            attendance_model.Attendance.employee_id == employee.id,
            attendance_model.Attendance.date >= start_date,
            attendance_model.Attendance.date <= end_date
        ).all()
        
        # Count attendance by status - using correct enum values
        present_days = sum(1 for record in attendance_records if record.status == AttendanceStatus.ATTENDED)
        absent_days = sum(1 for record in attendance_records if record.status == AttendanceStatus.ABSENT)
        partial_days = sum(1 for record in attendance_records if record.status == AttendanceStatus.PARTIAL)
        
        total_records = len(attendance_records)
        
        # Calculate attendance rate
        if total_records > 0:
            attendance_rate = round((present_days + (partial_days * 0.5)) / total_records * 100, 1)
        else:
            attendance_rate = 0
        
        employee_stats.append({
            "employee_id": employee.id,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "first_name": employee.first_name,
            "last_name": employee.last_name,
            "present_days": present_days,
            "absent_days": absent_days,
            "partial_days": partial_days,
            "total_records": total_records,
            "attendance_rate": attendance_rate
        })
    
    return {
        "employees": employee_stats,
        "date_range": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days_analyzed": days
        }
    }

# ✅ List  employees for employer by ID
@router.get("/employees/{employee_id}")
def get_employee_detail(
    employee_id: int,
    current=Depends(get_current_employer_user),
    db: Session = Depends(get_db)
):
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    employee = db.query(employee_model.Employee).join(
        EmployerEmployee,
        employee_model.Employee.id == EmployerEmployee.employee_id
    ).filter(
        employee_model.Employee.id == employee_id,
        EmployerEmployee.employer_id == current["user"].id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Get the employee's status from the EmployerEmployee relationship
    employer_employee = db.query(EmployerEmployee).filter(
        EmployerEmployee.employee_id == employee_id,
        EmployerEmployee.employer_id == current["user"].id
    ).first()

    # Get next upcoming coworking booking for this employee (same logic as employee list)
    next_booking = db.query(booking_model.CoworkingBooking).join(
        coworking_model.CoworkingSpaceListing
    ).filter(
        booking_model.CoworkingBooking.employee_id == employee_id,
        booking_model.CoworkingBooking.start_date >= func.current_date()
    ).order_by(booking_model.CoworkingBooking.start_date.asc()).first()

    assigned_coworking_space = None
    if next_booking:
        assigned_coworking_space = {
            "id": next_booking.coworking_space_id,
            "name": next_booking.coworking_space.title,
            "address": next_booking.coworking_space.address,
            "booking_type": next_booking.booking_type,
            "subscription_mode": next_booking.subscription_mode,
            "start_date": next_booking.start_date.isoformat(),
            "end_date": next_booking.end_date.isoformat(),
            "description": next_booking.coworking_space.description
        }

    return {
        "id": employee.id,
        "first_name": employee.first_name,
        "last_name": employee.last_name,
        "name": f"{employee.first_name} {employee.last_name}",
        "email": employee.email,
        "phone_number": employee.phone_number,
        "address": employee.address,
        "city": employee.city,
        "state": getattr(employee, 'state', 'N/A'),
        "country": employee.country,
        "status": employer_employee.status if employer_employee else 'active',
        "assigned_coworking_space": assigned_coworking_space
    }
# ✅ List all employees for the logged-in employer
@router.get("/employees")
def list_employees(
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    employer_id = current["user"].id

    # Query employees through the EmployerEmployee junction table with role information
    employee_data = db.query(
        Employee,
        EmployerEmployee.role_title,
        EmployerEmployee.status
    ).join(
        EmployerEmployee,
        Employee.id == EmployerEmployee.employee_id
    ).filter(
        EmployerEmployee.employer_id == employer_id
    ).all()

    result = []
    for emp, role_title, emp_status in employee_data:
        # Get next upcoming coworking booking for this employee (earliest start date)
        next_booking = db.query(booking_model.CoworkingBooking).join(
            coworking_model.CoworkingSpaceListing
        ).filter(
            booking_model.CoworkingBooking.employee_id == emp.id,
            booking_model.CoworkingBooking.start_date >= func.current_date()
        ).order_by(booking_model.CoworkingBooking.start_date.asc()).first()
        
        employee_info = {
            "id": emp.id,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "name": f"{emp.first_name} {emp.last_name}",
            "email": emp.email,
            "phone_number": emp.phone_number,
            "address": emp.address,
            "city": emp.city,
            "state": getattr(emp, "state", None),
            "country": getattr(emp, "country", None),
            "latitude": emp.latitude,
            "longitude": emp.longitude,
            "role_title": role_title,
            "status": emp_status,
            "assigned_coworking_space": None
        }
        
        if next_booking:
            employee_info["assigned_coworking_space"] = {
                "id": next_booking.coworking_space_id,
                "name": next_booking.coworking_space.title,
                "address": next_booking.coworking_space.address,
                "start_date": next_booking.start_date.isoformat(),
                "end_date": next_booking.end_date.isoformat(),
                "booking_type": next_booking.booking_type
            }
        
        result.append(employee_info)
    
    return result

# ✅ Nearby coworking spaces for selected employee
@router.get("/coworking-spaces")
def list_verified_nearby_coworking_spaces(
    employee_id: int = Query(...),
    max_distance_km: float = Query(10.0),
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    employee = db.query(employee_model.Employee).join(
        EmployerEmployee,
        employee_model.Employee.id == EmployerEmployee.employee_id
    ).filter(
        employee_model.Employee.id == employee_id,
        EmployerEmployee.employer_id == current["user"].id
    ).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if not employee.latitude or not employee.longitude:
        raise HTTPException(status_code=400, detail="Employee location not set")

    emp_coords = (employee.latitude, employee.longitude)
    print(f"Employee coordinates: {emp_coords}, Max distance: {max_distance_km} km")

    all_spaces = db.query(coworking_model.CoworkingSpaceListing).filter_by(is_verified=True).all()
    print(f"Total verified spaces in database: {len(all_spaces)}")

    nearby_spaces = []
    for space in all_spaces:
        if space.latitude is None or space.longitude is None:
            continue
        distance_km = haversine(emp_coords, (space.latitude, space.longitude), unit=Unit.KILOMETERS)
        print(f"Space '{space.title}' distance: {distance_km:.2f} km (within {max_distance_km} km: {distance_km <= max_distance_km})")
        if distance_km <= max_distance_km:
            # Parse packages and add images for each package
            packages_with_images = []
            if space.packages:
                try:
                    import json
                    packages = json.loads(space.packages) if isinstance(space.packages, str) else space.packages
                    for package in packages:
                        # Fetch images for this package with thumbnail URLs
                        package_images = db.execute(
                            text("SELECT image_url, image_name, is_primary, thumbnail_url, thumbnail_medium_url, thumbnail_small_url FROM coworking_images WHERE package_id = :package_id ORDER BY is_primary DESC, id ASC"),
                            {"package_id": str(package.get('id', ''))}
                        ).fetchall()
                        
                        # Add images to package
                        package_with_images = package.copy()
                        package_with_images['images'] = []
                        for img in package_images:
                            print(f"🖼️ RAW IMAGE DATA: {img}")
                            
                            # Force thumbnail URLs - completely override any original image paths
                            original_path = img[0]  # /uploads/coworking_images/filename.jpg
                            thumbnail_medium_path = img[4] if len(img) > 4 and img[4] else None
                            
                            print(f"📁 Original path: {original_path}")
                            print(f"🎯 Thumbnail medium path: {thumbnail_medium_path}")
                            
                            # Use database thumbnail URL first, fallback to constructed URL
                            if thumbnail_medium_path and thumbnail_medium_path.strip():
                                final_url = f"http://localhost:8001{thumbnail_medium_path}"
                                print(f"🎯 Using database thumbnail URL: {final_url}")
                            else:
                                # Fallback: construct thumbnail URL from filename
                                filename = original_path.split('/')[-1]
                                final_url = f"http://localhost:8001/uploads/coworking_images/thumbnails/medium/{filename}"
                                print(f"🔄 Using constructed thumbnail URL: {final_url}")
                            
                            print(f"✅ FINAL URL BEING RETURNED: {final_url}")
                            
                            package_with_images['images'].append({
                                'url': final_url,  # FORCE thumbnail URL
                                'name': img[1],
                                'is_primary': bool(img[2]),
                                'image_url': f"http://localhost:8001{original_path}",  # Original for fallback
                                'thumbnail_url': f"http://localhost:8001{img[3]}" if len(img) > 3 and img[3] else final_url,
                                'thumbnail_medium_url': final_url,
                                'thumbnail_small_url': f"http://localhost:8001{img[5]}" if len(img) > 5 and img[5] else final_url
                            })
                        packages_with_images.append(package_with_images)
                except Exception as e:
                    print(f"Error parsing packages for space {space.id}: {e}")
                    packages_with_images = []
            
            nearby_spaces.append({
                "id": space.id,
                "title": space.title,
                "address": space.address,
                "city": space.city,
                "latitude": space.latitude,
                "longitude": space.longitude,
                "distance_km": round(distance_km, 2),
                "packages": json.dumps(packages_with_images) if packages_with_images else space.packages,
                "amenities": space.amenities,
                "opening_hours": space.opening_hours,
            })

    print(f"Returning {len(nearby_spaces)} spaces within {max_distance_km} km radius")
    return sorted(nearby_spaces, key=lambda x: x["distance_km"])


# Pydantic schema for payment intent request
class PaymentIntentRequest(BaseModel):
    amount: int  # Amount in cents
    currency: str = "usd"
    payment_method_id: str
    booking_data: dict
    coworking_space_id: int
    package_id: str

# Pydantic schema for subscription request
class SubscriptionRequest(BaseModel):
    payment_method_id: str
    customer_email: str
    customer_name: str
    booking_data: dict
    coworking_space_id: int
    package_id: str


# ✅ Create Stripe Payment Intent
@router.post("/create-payment-intent")
def create_payment_intent(
    data: PaymentIntentRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        print(f"🔍 Creating payment intent with data: {data}")
        print(f"💰 Amount: {data.amount}, Currency: {data.currency}")
        print(f"🏢 Coworking Space ID: {data.coworking_space_id}")
        print(f"📦 Package ID: {data.package_id}")
        print(f"📋 Booking Data: {data.booking_data}")
        print(f"👤 Current User: {current_user}")
        print(f"🔑 Current User Keys: {current_user.keys() if isinstance(current_user, dict) else 'Not a dict'}")
        
        # Get employer ID from current_user (handle different possible key names)
        employer_id = current_user.get("id") or current_user.get("user_id") or current_user.get("sub") or "unknown"
        print(f"👤 Employer ID: {employer_id}")
        
        # Create payment intent with Stripe (without immediate confirmation)
        intent = stripe.PaymentIntent.create(
            amount=data.amount,
            currency=data.currency,
            automatic_payment_methods={
                'enabled': True,
            },
            metadata={
                'employer_id': str(employer_id),
                'coworking_space_id': str(data.coworking_space_id),
                'package_id': str(data.package_id),
                'booking_frequency': data.booking_data.get('bookingFrequency', ''),
                'booking_type': data.booking_data.get('bookingType', ''),
                'customer_email': data.booking_data.get('customerEmail', ''),
                'customer_name': data.booking_data.get('customerName', ''),
                'package_name': data.booking_data.get('packageName', ''),
                'coworking_space_name': data.booking_data.get('coworkingSpaceName', ''),
            }
        )
        
        print(f"✅ Payment intent created successfully: {intent.id}")
        
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "status": intent.status
        }
        
    except stripe.error.CardError as e:
        # Card was declined
        print(f"❌ Stripe Card Error: {e}")
        print(f"🔍 Error details: {e.user_message}")
        raise HTTPException(status_code=400, detail=f"Card declined: {e.user_message}")
    except stripe.error.StripeError as e:
        # Other Stripe errors
        print(f"❌ Stripe API Error: {e}")
        print(f"🔍 Error type: {type(e).__name__}")
        print(f"🔍 Error message: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Payment error: {str(e)}")
    except Exception as e:
        # General errors
        print(f"❌ General Error: {e}")
        print(f"🔍 Error type: {type(e).__name__}")
        print(f"🔍 Error message: {str(e)}")
        import traceback
        print(f"🔍 Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


# ✅ Create Stripe Prorated Subscription for ongoing day bookings
@router.post("/create-prorated-subscription")
def create_prorated_subscription(
    data: SubscriptionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        print(f"🔄 Creating prorated subscription with data: {data}")
        
        # Get employer ID from current_user
        employer_id = current_user.get("id") or current_user.get("user_id") or current_user.get("sub") or "unknown"
        
        # Extract booking data
        booking_data = data.booking_data
        selected_week_days = booking_data.get('selectedWeekDays', [])
        start_date_str = booking_data.get('startDate')
        
        if not selected_week_days or not start_date_str:
            raise HTTPException(status_code=400, detail="Missing selected days or start date")
        
        # Parse start date
        from datetime import datetime, timedelta
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        
        # Calculate prorated billing amounts
        coworking_space = db.query(coworking_model.CoworkingSpaceListing).filter_by(id=data.coworking_space_id).first()
        if not coworking_space:
            raise HTTPException(status_code=404, detail="Coworking space not found")
        
        # Parse packages from JSON
        import json
        packages = json.loads(coworking_space.packages) if coworking_space.packages else []
        selected_package = None
        
        for package in packages:
            if str(package.get('id')) == str(data.package_id) or package.get('name') == data.package_id:
                selected_package = package
                break
        
        if not selected_package:
            raise HTTPException(status_code=404, detail="Package not found")
        
        # Calculate pricing
        daily_price = float(selected_package.get('per_day', 20))
        subscription_mode = booking_data.get('subscriptionMode', 'full_time')
        hours_per_day = booking_data.get('hoursPerDay', 8)
        
        # Adjust for half-day pricing
        base_daily_price = daily_price
        if hours_per_day == 4 or subscription_mode == 'half_day':
            base_daily_price = daily_price / 2
        
        # Calculate remaining days in current month
        start_month = start_date.month
        start_year = start_date.year
        
        # Get last day of the month
        if start_month == 12:
            last_day_of_month = datetime(start_year + 1, 1, 1) - timedelta(days=1)
        else:
            last_day_of_month = datetime(start_year, start_month + 1, 1) - timedelta(days=1)
        
        # Count remaining days in current month
        remaining_days_count = 0
        current_date = start_date
        while current_date <= last_day_of_month:
            if current_date.weekday() + 1 in [day % 7 for day in selected_week_days]:  # Convert to Monday=1 format
                remaining_days_count += 1
            current_date += timedelta(days=1)
        
        # Calculate amounts
        prorated_amount = int(base_daily_price * remaining_days_count * 100)  # Convert to cents
        
        # Use dynamic monthly calculation based on actual days in next month
        daily_rate_cents = int(base_daily_price * 100)
        next_month_amount, next_month_days, next_year, next_month = get_next_month_billing_amount(
            selected_week_days, daily_rate_cents, subscription_mode
        )
        
        print(f"💰 Prorated calculation: {remaining_days_count} days × ${base_daily_price} = ${prorated_amount/100}")
        print(f"💰 Next month calculation: {next_month_days} days in {next_year}-{next_month:02d} × ${base_daily_price} = ${next_month_amount/100}")
        
        # Create or retrieve customer
        customers = stripe.Customer.list(email=data.customer_email, limit=1)
        if customers.data:
            customer = customers.data[0]
            print(f"✅ Found existing customer: {customer.id}")
        else:
            customer = stripe.Customer.create(
                email=data.customer_email,
                name=data.customer_name,
                metadata={
                    'employer_id': str(employer_id),
                    'coworking_space_id': str(data.coworking_space_id),
                }
            )
            print(f"✅ Created new customer: {customer.id}")
        
        # Attach payment method to customer
        stripe.PaymentMethod.attach(
            data.payment_method_id,
            customer=customer.id,
        )
        
        # Set as default payment method
        stripe.Customer.modify(
            customer.id,
            invoice_settings={
                'default_payment_method': data.payment_method_id,
            },
        )
        
        # Step 1: Create immediate prorated payment intent for remaining days
        # Create prorated payment intent for remaining days this month
        prorated_payment_intent = stripe.PaymentIntent.create(
            amount=prorated_amount,
            currency='usd',
            customer=customer.id,
            payment_method=data.payment_method_id,
            confirm=False,  # Don't auto-confirm, let frontend handle confirmation
            automatic_payment_methods={'enabled': True, 'allow_redirects': 'never'},
            metadata={
                'type': 'prorated_billing',
                'employer_id': str(employer_id),
                'coworking_space_id': str(data.coworking_space_id),
                'package_id': str(data.package_id),
                'remaining_days': str(remaining_days_count),
                'start_date': start_date_str,
            }
        )
        print(f"✅ Prorated payment created: {prorated_payment_intent.id} for ${prorated_amount/100}")
        
        # Step 2: Create monthly subscription starting from next month
        next_month_start = datetime(start_year, start_month + 1, 1) if start_month < 12 else datetime(start_year + 1, 1, 1)
        
        # Create product for monthly subscription
        product_name = f"Coworking Monthly - {selected_package.get('name', 'Package')}"
        product = stripe.Product.create(
            name=product_name,
            metadata={
                'coworking_space_id': str(data.coworking_space_id),
                'package_id': str(data.package_id),
                'selected_days': ','.join(map(str, selected_week_days)),
            }
        )
        
        # Create price for next month's billing (dynamic amount)
        price = stripe.Price.create(
            product=product.id,
            unit_amount=next_month_amount,
            currency='usd',
            recurring={'interval': 'month'},
            metadata={
                'dynamic_billing': 'true',
                'days_count': str(next_month_days),
                'billing_month': f"{next_year}-{next_month:02d}",
            }
        )
        
        # Create subscription starting from next month
        # Fix: Remove billing_cycle_anchor to avoid Stripe error
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{'price': price.id}],
            metadata={
                'employer_id': str(employer_id),
                'coworking_space_id': str(data.coworking_space_id),
                'package_id': str(data.package_id),
                'booking_frequency': 'ongoing',
                'booking_type': 'per_day',
                'selected_days': ','.join(map(str, selected_week_days)),
                'start_date': start_date_str,
                'prorated_payment_intent': prorated_payment_intent.id if prorated_payment_intent else '',
                'dynamic_billing': 'true',
                'daily_rate_cents': str(daily_rate_cents),
                'subscription_mode': subscription_mode,
            }
        )
        
        print(f"✅ Monthly subscription created: {subscription.id} starting {next_month_start.strftime('%Y-%m-%d')}")
        
        return {
            "prorated_payment_intent_id": prorated_payment_intent.id if prorated_payment_intent else None,
            "prorated_amount": prorated_amount / 100,
            "subscription_id": subscription.id,
            "monthly_amount": next_month_amount / 100,
            "next_billing_date": next_month_start.strftime('%Y-%m-%d'),
            "customer_id": customer.id,
            "status": "success",
        }
        
    except stripe.error.CardError as e:
        print(f"❌ Stripe Card Error: {e}")
        raise HTTPException(status_code=400, detail=f"Card declined: {e.user_message}")
    except stripe.error.StripeError as e:
        print(f"❌ Stripe API Error: {e}")
        raise HTTPException(status_code=400, detail=f"Payment error: {str(e)}")
    except Exception as e:
        print(f"❌ General Error: {e}")
        import traceback
        print(f"🔍 Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


# ✅ Create Stripe Subscription for ongoing bookings (original endpoint)
@router.post("/create-subscription")
def create_subscription(
    data: SubscriptionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        print(f"🔄 Creating subscription with data: {data}")
        print(f"📧 Customer Email: {data.customer_email}")
        print(f"👤 Customer Name: {data.customer_name}")
        print(f"💳 Payment Method ID: {data.payment_method_id}")
        
        # Get employer ID from current_user
        employer_id = current_user.get("id") or current_user.get("user_id") or current_user.get("sub") or "unknown"
        
        # Create or retrieve customer
        customers = stripe.Customer.list(email=data.customer_email, limit=1)
        if customers.data:
            customer = customers.data[0]
            print(f"✅ Found existing customer: {customer.id}")
        else:
            customer = stripe.Customer.create(
                email=data.customer_email,
                name=data.customer_name,
                metadata={
                    'employer_id': str(employer_id),
                    'coworking_space_id': str(data.coworking_space_id),
                }
            )
            print(f"✅ Created new customer: {customer.id}")
        
        # Attach payment method to customer
        stripe.PaymentMethod.attach(
            data.payment_method_id,
            customer=customer.id,
        )
        
        # Set as default payment method
        stripe.Customer.modify(
            customer.id,
            invoice_settings={
                'default_payment_method': data.payment_method_id,
            },
        )
        
        # Create product for the coworking package
        product_name = f"Coworking - {data.booking_data.get('packageName', 'Package')}"
        product = stripe.Product.create(
            name=product_name,
            metadata={
                'coworking_space_id': str(data.coworking_space_id),
                'package_id': str(data.package_id),
            }
        )
        
        # Determine billing interval based on booking type
        booking_type = data.booking_data.get('bookingType', 'per_day')
        if booking_type == 'per_month':
            interval = 'month'
        elif booking_type == 'per_week':
            interval = 'week'
        else:  # per_day or default
            interval = 'month'  # Bill monthly for daily bookings
        
        # Calculate price (convert to cents)
        # For ongoing bookings, we'll use monthly pricing
        print(f"💰 Calculating subscription price for booking type: {booking_type}")
        
        # Get the coworking space and package details to calculate correct pricing
        coworking_space = db.query(coworking_model.CoworkingSpaceListing).filter_by(id=data.coworking_space_id).first()
        if not coworking_space:
            raise HTTPException(status_code=404, detail="Coworking space not found")
        
        # Parse packages from JSON
        import json
        packages = json.loads(coworking_space.packages) if coworking_space.packages else []
        selected_package = None
        
        for package in packages:
            if str(package.get('id')) == str(data.package_id) or package.get('name') == data.package_id:
                selected_package = package
                break
        
        if not selected_package:
            raise HTTPException(status_code=404, detail="Package not found")
        
        # Calculate monthly price based on package pricing
        if booking_type == 'monthly':
            # Use per_month pricing directly
            monthly_price = int(float(selected_package.get('per_month', 40)) * 100)  # Convert to cents
        else:
            # For daily ongoing bookings, calculate monthly rate (assume 22 working days)
            daily_rate = float(selected_package.get('per_day', 2))
            monthly_price = int(daily_rate * 22 * 100)  # 22 working days per month, convert to cents
        
        print(f"💰 Package pricing - Daily: ${selected_package.get('per_day', 0)}, Monthly: ${selected_package.get('per_month', 0)}")
        print(f"💰 Calculated monthly subscription price: ${monthly_price/100}")
        
        # Create price for the product
        price = stripe.Price.create(
            product=product.id,
            unit_amount=monthly_price,
            currency='usd',
            recurring={'interval': interval},
        )
        
        # Create subscription with simpler configuration
        print(f"🔄 Creating subscription for customer {customer.id} with price {price.id}")
        
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{'price': price.id}],
            metadata={
                'employer_id': str(employer_id),
                'coworking_space_id': str(data.coworking_space_id),
                'package_id': str(data.package_id),
                'booking_frequency': data.booking_data.get('bookingFrequency', ''),
                'booking_type': data.booking_data.get('bookingType', ''),
                'start_date': data.booking_data.get('startDate', ''),
            }
        )
        
        print(f"✅ Subscription created successfully: {subscription.id}")
        print(f"📊 Subscription status: {subscription.status}")
        
        print(f"✅ Subscription created: {subscription.id}")
        
        return {
            "subscription_id": subscription.id,
            "customer_id": customer.id,
            "status": subscription.status,
            "latest_invoice": subscription.latest_invoice if hasattr(subscription, 'latest_invoice') and subscription.latest_invoice else None,
        }
        
    except stripe.error.CardError as e:
        print(f"❌ Stripe Card Error: {e}")
        raise HTTPException(status_code=400, detail=f"Card declined: {e.user_message}")
    except stripe.error.StripeError as e:
        print(f"❌ Stripe API Error: {e}")
        raise HTTPException(status_code=400, detail=f"Subscription error: {str(e)}")
    except Exception as e:
        print(f"❌ General Error: {e}")
        import traceback
        print(f"🔍 Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


# ✅ Book coworking space
@router.post("/book-coworking")
def book_coworking_space(
    data: booking_schema.CoworkingBookingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        print(f"🔍 Booking request data: {data}")
        print(f"🔍 Booking request dict: {data.dict()}")
        if current_user["role"] != "employer":
            raise HTTPException(status_code=403, detail="Unauthorized")

        coworking = db.query(coworking_model.CoworkingSpaceListing).filter_by(
            id=data.coworking_space_id, is_verified=True
        ).first()
        if not coworking:
            raise HTTPException(status_code=404, detail="Coworking space not found or not verified")
    except Exception as e:
        print(f"💥 Error in booking validation: {str(e)}")
        print(f"💥 Error type: {type(e)}")
        if hasattr(e, 'errors'):
            print(f"💥 Validation errors: {e.errors()}")
        raise

    # Basic check: prevent overlaps for one-time bookings
    try:
        print(f"🔍 Checking overlaps - is_ongoing: {data.is_ongoing}")
        if not data.is_ongoing:
            # Check for conflicts based on booking type
            if data.employee_id:
                print(f"🔍 Checking employee booking conflicts for employee_id: {data.employee_id}")
                # Employee booking - check for conflicts with same employee only
                overlapping = db.query(booking_model.CoworkingBooking).filter(
                    booking_model.CoworkingBooking.employee_id == data.employee_id,
                    booking_model.CoworkingBooking.start_date <= data.end_date,
                    booking_model.CoworkingBooking.end_date >= data.start_date
                ).first()
                if overlapping:
                    print(f"❌ Employee booking conflict found: {overlapping.id}")
                    raise HTTPException(status_code=400, detail="Employee already has a booking in that date range")
            else:
                print(f"🔍 Checking employer self-booking conflicts for employer_id: {current_user['user'].id}")
                # Employer self-booking - check for conflicts with other employer self-bookings only
                # Note: employee_id.is_(None) ensures we only check employer personal bookings
                overlapping = db.query(booking_model.CoworkingBooking).filter(
                    booking_model.CoworkingBooking.employer_id == current_user["user"].id,
                    booking_model.CoworkingBooking.employee_id.is_(None),  # Only employer self-bookings (no employee)
                    booking_model.CoworkingBooking.start_date <= data.end_date,
                    booking_model.CoworkingBooking.end_date >= data.start_date
                ).first()
                if overlapping:
                    print(f"❌ Employer self-booking conflict found: {overlapping.id} ({overlapping.start_date} to {overlapping.end_date})")
                    raise HTTPException(status_code=400, detail="You already have a personal booking in that date range")
                else:
                    print("✅ No booking conflicts found")
    except HTTPException:
        raise
    except Exception as overlap_error:
        print(f"💥 Error checking overlaps: {str(overlap_error)}")
        raise HTTPException(status_code=500, detail=f"Error checking booking conflicts: {str(overlap_error)}")

    # Create booking entry
    try:
        print(f"🔍 Creating booking with data:")
        print(f"  - employer_id: {current_user['user'].id}")
        print(f"  - employee_id: {data.employee_id}")
        print(f"  - coworking_space_id: {data.coworking_space_id}")
        print(f"  - booking_type: {data.booking_type}")
        print(f"  - start_date: {data.start_date}")
        print(f"  - end_date: {data.end_date}")
        print(f"  - subscription_mode: {data.subscription_mode}")
        
        booking = booking_model.CoworkingBooking(
            employer_id=current_user["user"].id,
            employee_id=data.employee_id,
            coworking_space_id=data.coworking_space_id,
            booking_type=data.booking_type,
            start_date=data.start_date,
            end_date=data.end_date,
            subscription_mode=data.subscription_mode,
            is_ongoing=data.is_ongoing,
            days_of_week=data.days_of_week,
            duration_per_day=data.duration_per_day,
            total_cost=data.total_cost,
            notes=data.notes,
            payment_intent_id=data.payment_intent_id,
            subscription_id=getattr(data, 'subscription_id', None),
            payment_status=data.payment_status or "pending"
        )
        
        print(f"✅ Booking object created successfully")
        
        db.add(booking)
        db.commit()
        db.refresh(booking)
        
        print(f"✅ Booking saved to database with ID: {booking.id}")
        
    except Exception as booking_error:
        print(f"💥 Error creating booking: {str(booking_error)}")
        print(f"💥 Error type: {type(booking_error)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating booking: {str(booking_error)}")

    return {
        "message": "Booking confirmed", 
        "booking_id": booking.id,
        "id": booking.id,
        "start_date": booking.start_date.isoformat() if booking.start_date else None,
        "end_date": booking.end_date.isoformat() if booking.end_date else None,
        "total_amount": booking.total_cost,
        "employee_id": booking.employee_id,
        "coworking_space_id": booking.coworking_space_id,
        "booking_type": booking.booking_type,
        "notes": booking.notes,
        "payment_intent_id": booking.payment_intent_id,
        "subscription_id": booking.subscription_id,
        "payment_status": booking.payment_status
    }



# ✅ Nearby coworking spaces from employer's profile
@router.post("/employer-profile-coworking-spaces", response_model=List[NearbyCoworkingSpaceOut])
def find_coworking_by_address(
    data: coworking_schema.CoworkingAddressSearch,
    db: Session = Depends(get_db)
):
    import json
    
    # ✅ Use passed lat/lon directly
    lat, lon = data.latitude, data.longitude
    if not lat or not lon:
        raise HTTPException(status_code=400, detail="Latitude/longitude required")

    all_spaces = db.query(coworking_model.CoworkingSpaceListing).filter_by(is_verified=True).all()
    results = []
    for space in all_spaces:
        if space.latitude and space.longitude:
            distance = haversine((lat, lon), (space.latitude, space.longitude), unit=Unit.KILOMETERS)
            if distance <= data.radius_km:
                results.append({
                    "id": space.id,
                    "title": space.title,
                    "latitude": space.latitude,
                    "longitude": space.longitude,
                    "full_address": f"{space.address}, {space.city}, {space.country}",
                    "distance_km": round(distance, 2),
                    "price_per_hour": space.price_per_hour,
                    "price_per_day": space.price_per_day,
                    "price_per_week": space.price_per_week,
                    "price_per_month": space.price_per_month,
                    "description": space.description,
                    "opening_hours": space.opening_hours,
                    "amenities": space.amenities,
                    "packages": space.packages,  # Keep as JSON string for schema compatibility
                })
    return sorted(results, key=lambda x: x["distance_km"])


@router.get("/coworking-space/{space_id}/images")
def get_coworking_space_images(space_id: int, db: Session = Depends(get_db)):
    """Get images for a coworking space organized by packages (public endpoint for employers)"""
    from shared.models.coworking_images import CoworkingImage
    from shared.models.coworkingspacelisting import CoworkingSpaceListing
    import json
    
    # Verify space exists and is verified
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id,
        CoworkingSpaceListing.is_verified == True
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Coworking space not found")
    
    # Parse packages from JSON
    packages = []
    if space.packages:
        try:
            packages = json.loads(space.packages)
        except:
            packages = []
    
    # Get all images for this space
    images = db.query(CoworkingImage).filter(
        CoworkingImage.space_id == space_id
    ).order_by(CoworkingImage.is_primary.desc(), CoworkingImage.id).all()
    
    # Group images by package
    package_images = {}
    general_images = []
    
    for img in images:
        # FORCE thumbnail URLs for better performance
        filename = img.image_url.split('/')[-1] if img.image_url else ''
        thumbnail_url = f"http://localhost:8000/uploads/coworking_images/thumbnails/medium/{filename}"
        
        image_data = {
            "id": img.id,
            "url": thumbnail_url,  # Use thumbnail URL instead of original
            "name": img.image_name,
            "description": img.image_description,
            "is_primary": bool(img.is_primary),
            "package_id": img.package_id,
            "image_url": f"http://localhost:8000{img.image_url}" if img.image_url else "",
            "thumbnail_url": f"http://localhost:8000{img.thumbnail_url}" if img.thumbnail_url else thumbnail_url,
            "thumbnail_medium_url": f"http://localhost:8000{img.thumbnail_medium_url}" if img.thumbnail_medium_url else thumbnail_url,
            "thumbnail_small_url": f"http://localhost:8000{img.thumbnail_small_url}" if img.thumbnail_small_url else thumbnail_url
        }
        
        if img.package_id:
            if img.package_id not in package_images:
                package_images[img.package_id] = []
            package_images[img.package_id].append(image_data)
        else:
            general_images.append(image_data)
    
    # Build response with package information including amenities
    packages_with_images = []
    for package in packages:
        package_id = str(package.get('id', ''))
        
        # Extract package amenities
        package_amenities = []
        if package.get('amenities'):
            try:
                if isinstance(package['amenities'], list):
                    package_amenities = package['amenities']
                elif isinstance(package['amenities'], str):
                    package_amenities = json.loads(package['amenities'])
            except:
                package_amenities = []
        
        package_info = {
            "package_id": package_id,
            "package_name": package.get('name', 'Unknown Package'),
            "package_type": package.get('type', ''),
            "package_amenities": package_amenities,  # Add package-specific amenities
            "images": package_images.get(package_id, [])
        }
        packages_with_images.append(package_info)
    
    return {
        "space_id": space_id,
        "space_title": space.title,
        "general_images": general_images,
        "packages": packages_with_images,
        "total_images": len(images)
    }


# ✅ Manual coworking search by address
class FindCoworkingRequest(BaseModel):
    address: str
    city: str
    state: str
    country: str
    zip_code: Optional[str] = None
    radius_km: float = 10.0

@router.post("/find-coworking-by-address", response_model=List[CoworkingSpaceOut])
def find_coworking_by_custom_address(
    data: FindCoworkingRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_employer_user)
):
    full_address = ", ".join(filter(None, [data.address, data.city, data.state, data.zip_code, data.country]))
    lat, lon = get_coordinates_from_address(full_address)
    if not lat or not lon:
        raise HTTPException(status_code=400, detail="Failed to geocode custom address")

    all_spaces = db.query(coworking_model.CoworkingSpaceListing).filter_by(is_verified=True).all()
    results = []
    for space in all_spaces:
        if space.latitude and space.longitude:
            distance = haversine((lat, lon), (space.latitude, space.longitude), unit=Unit.KILOMETERS)
            if distance <= data.radius_km:
                results.append({
                    "id": space.id,
                    "title": space.title,
                    "full_address": f"{space.address}, {space.city}, {space.country}",
                    "distance_km": round(distance, 2)
                })
    return sorted(results, key=lambda x: x["distance_km"])

# ✅ List all bookings for employees of this employer
@router.get("/bookings", response_model=List[BookingListItem])
def list_bookings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_employer_user)
):
    if current_user["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    employer_id = current_user["user"].id

    bookings = (
        db.query(booking_model.CoworkingBooking)
        .join(employee_model.Employee)
        .join(coworking_model.CoworkingSpaceListing)
        .join(
            EmployerEmployee,
            employee_model.Employee.id == EmployerEmployee.employee_id
        )
        .filter(EmployerEmployee.employer_id == employer_id)
        .all()
    )

    return [
        booking_schema.BookingListItem(
            id=b.id,
            employee_name=f"{b.employee.first_name} {b.employee.last_name}",
            coworking_space_name=b.coworking_space.title,
            coworking_space_address=b.coworking_space.address,
            start_date=b.start_date,
            end_date=b.end_date,
            total_cost=b.total_cost,
            booking_type=b.booking_type,
        )
        for b in bookings
    ]


# ✅ Get booking detail
@router.get("/bookings/{booking_id}", response_model=BookingDetail)
def get_booking_detail(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_employer_user)
):
    if current_user["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    booking = (
        db.query(booking_model.CoworkingBooking)
        .join(employee_model.Employee)
        .join(coworking_model.CoworkingSpaceListing)
        .filter(booking_model.CoworkingBooking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.employer_id != current_user["user"].id:
        raise HTTPException(status_code=403, detail="Not your booking")

    return booking_schema.BookingDetail(
        id=booking.id,
        start_date=booking.start_date,
        end_date=booking.end_date,
        created_at=booking.created_at,
        total_cost=booking.total_cost,
        booking_type=booking.booking_type,
        subscription_mode=booking.subscription_mode,
        is_ongoing=booking.is_ongoing,
        days_of_week=booking.days_of_week,
        duration_per_day=booking.duration_per_day,
        notes=booking.notes,

        employee_name=f"{booking.employee.first_name} {booking.employee.last_name}",
        employee_email=booking.employee.email,
        employee_contact=booking.employee.phone_number,
        employee_address=booking.employee.address,
        employee_city=booking.employee.city,
        employee_country=booking.employee.country,

        coworking_name=booking.coworking_space.title,
        coworking_address=booking.coworking_space.address,
        coworking_city=booking.coworking_space.city,
        coworking_country=booking.coworking_space.country,
    )


# ✅ Get Bookings for a Specific Employee (Employer Scope)
@router.get("/bookings/employee/{employee_id}", response_model=List[booking_schema.BookingListItem])
def get_bookings_for_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user),
):
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    bookings = db.query(booking_model.CoworkingBooking)\
        .join(employee_model.Employee, employee_model.Employee.id == booking_model.CoworkingBooking.employee_id)\
        .join(coworking_model.CoworkingSpaceListing, coworking_model.CoworkingSpaceListing.id == booking_model.CoworkingBooking.coworking_space_id)\
        .filter(booking_model.CoworkingBooking.employer_id == current["user"].id)\
        .filter(booking_model.CoworkingBooking.employee_id == employee_id)\
        .order_by(booking_model.CoworkingBooking.start_date.asc())\
        .all()

    result = [
        booking_schema.BookingListItem(
            id=b.id,
            employee_name=f"{b.employee.first_name} {b.employee.last_name}",
            coworking_space_name=b.coworking_space.title,
            coworking_space_address=b.coworking_space.address,
            start_date=b.start_date,
            end_date=b.end_date,
            total_cost=b.total_cost,
            booking_type=b.booking_type,
        )
        for b in bookings
    ]
    return result

# ✅ Delete coworking booking
@router.delete("/bookings/{booking_id}")
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    booking = db.query(booking_model.CoworkingBooking).filter_by(id=booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Ensure the employer owns this booking
    if booking.employer_id != current_user["user"].id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this booking")

    db.delete(booking)
    db.commit()

    return {"message": "Booking successfully deleted"}

# ✅ Update coworking booking
@router.put("/bookings/{booking_id}")
def update_coworking_booking(
    booking_id: int,
    data: booking_schema.CoworkingBookingUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Get booking owned by current employer
    booking = db.query(booking_model.CoworkingBooking).filter_by(
        id=booking_id,
        employer_id=current_user["user"].id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # ✅ Check for overlapping bookings (based on employee_id already in booking)
    overlapping = db.query(booking_model.CoworkingBooking).filter(
        booking_model.CoworkingBooking.employee_id == booking.employee_id,
        booking_model.CoworkingBooking.id != booking_id,
        booking_model.CoworkingBooking.start_date <= data.end_date,
        booking_model.CoworkingBooking.end_date >= data.start_date
    ).first()

    if overlapping:
        raise HTTPException(status_code=400, detail="Another booking exists in the selected date range")

    # ✅ Update booking fields (except employee_id and coworking_space_id)
    booking.booking_type = data.booking_type
    booking.start_date = data.start_date
    booking.end_date = data.end_date
    booking.subscription_mode = data.subscription_mode
    booking.is_ongoing = data.is_ongoing
    booking.days_of_week = data.days_of_week
    booking.duration_per_day = data.duration_per_day
    booking.total_cost = data.total_cost
    booking.notes = data.notes

    db.commit()
    db.refresh(booking)

    return {"message": "Booking updated successfully", "booking_id": booking.id}


# ✅ Dashboard Stats
# ✅ Task Management Endpoints

# Get all tasks for employer
@router.get("/tasks")
def get_tasks(
    status: Optional[str] = Query(None, description="Filter by task status"),
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Get all tasks for the employer with optional status filtering"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    query = db.query(task_model.Task).filter(
        task_model.Task.employer_id == employer_id
    )
    
    if status:
        query = query.filter(task_model.Task.status == status)
    
    tasks = query.order_by(task_model.Task.created_at.desc()).all()
    
    result = []
    for task in tasks:
        # Get task assignments
        assignments = db.query(task_assignment_model.TaskAssignment).filter(
            task_assignment_model.TaskAssignment.task_id == task.id
        ).all()
        
        assigned_employees = []
        for assignment in assignments:
            employee = db.query(employee_model.Employee).filter(
                employee_model.Employee.id == assignment.employee_id
            ).first()
            if employee:
                assigned_employees.append({
                    "id": employee.id,
                    "name": f"{employee.first_name} {employee.last_name}",
                    "email": employee.email
                })
        
        result.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status.value if task.status else "pending",
            "priority": task.priority.value if task.priority else "medium",
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "updated_at": task.updated_at.isoformat() if task.updated_at else None,
            "assigned_employees": assigned_employees
        })
    
    return result


# Create new task
@router.post("/tasks", response_model=TaskOut)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Create a new task"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    # Parse due_date if provided
    parsed_due_date = None
    if task_data.due_date:
        try:
            parsed_due_date = datetime.fromisoformat(task_data.due_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid due_date format")
    
    # Create task
    new_task = task_model.Task(
        title=task_data.title,
        description=task_data.description,
        priority=getattr(task_model.TaskPriority, task_data.priority.upper(), task_model.TaskPriority.MEDIUM),
        due_date=parsed_due_date,
        employer_id=employer_id,
        created_by_id=employer_id
    )
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    # Create task assignments if employee IDs provided
    if task_data.assigned_employee_ids:
        for employee_id in task_data.assigned_employee_ids:
            # Verify employee belongs to this employer
            employee_relation = db.query(EmployerEmployee).filter(
                EmployerEmployee.employer_id == employer_id,
                EmployerEmployee.employee_id == employee_id
            ).first()
            
            if employee_relation:
                assignment = task_assignment_model.TaskAssignment(
                    task_id=new_task.id,
                    employee_id=employee_id,
                    employer_id=employer_id,
                    assigned_by_id=employer_id,
                    assigned_at=datetime.utcnow()
                )
                db.add(assignment)
    
    db.commit()
    
    # Get assigned employees for response
    assigned_employees = []
    if task_data.assigned_employee_ids:
        for employee_id in task_data.assigned_employee_ids:
            employee = db.query(Employee).filter(
                Employee.id == employee_id
            ).first()
            if employee:
                assigned_employees.append({
                    "id": employee.id,
                    "name": f"{employee.first_name} {employee.last_name}",
                    "email": employee.email
                })
    
    return TaskOut(
        id=new_task.id,
        title=new_task.title,
        description=new_task.description,
        priority=new_task.priority.value,
        status=new_task.status.value,
        due_date=new_task.due_date,
        created_at=new_task.created_at,
        updated_at=new_task.updated_at,
        employer_id=new_task.employer_id,
        created_by_id=new_task.created_by_id,
        assigned_employees=assigned_employees
    )


# Get task details
@router.get("/tasks/{task_id}")
def get_task_details(
    task_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Get detailed information about a specific task"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    task = db.query(task_model.Task).filter(
        task_model.Task.id == task_id,
        task_model.Task.employer_id == employer_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get task assignments
    assignments = db.query(task_assignment_model.TaskAssignment).filter(
        task_assignment_model.TaskAssignment.task_id == task_id
    ).all()
    
    assigned_employees = []
    for assignment in assignments:
        employee = db.query(employee_model.Employee).filter(
            employee_model.Employee.id == assignment.employee_id
        ).first()
        if employee:
            assigned_employees.append({
                "id": employee.id,
                "first_name": employee.first_name,
                "last_name": employee.last_name,
                "name": f"{employee.first_name} {employee.last_name}",
                "email": employee.email,
                "assigned_at": assignment.assigned_at.isoformat() if assignment.assigned_at else None,
                "completed_at": assignment.completed_at.isoformat() if assignment.completed_at else None,
                "notes": assignment.notes
            })
    
    # Get task comments
    comments = db.query(task_comment_model.TaskComment).filter(
        task_comment_model.TaskComment.task_id == task_id
    ).order_by(task_comment_model.TaskComment.created_at.asc()).all()
    
    task_comments = []
    for comment in comments:
        author = db.query(employer_model.Employer).filter(
            employer_model.Employer.id == comment.author_id
        ).first()
        task_comments.append({
            "id": comment.id,
            "content": comment.content,
            "author_id": comment.author_id,
            "author_name": f"{author.first_name} {author.last_name}" if author else "Unknown",
            "created_at": comment.created_at.isoformat(),
            "updated_at": comment.updated_at.isoformat()
        })
    
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status.value if task.status else "pending",
        "priority": task.priority.value if task.priority else "medium",
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "created_at": task.created_at.isoformat() if task.created_at else None,
        "updated_at": task.updated_at.isoformat() if task.updated_at else None,
        "assigned_employees": assigned_employees,
        "comments": task_comments
    }


# Update task
@router.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Update an existing task"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    task = db.query(task_model.Task).filter(
        task_model.Task.id == task_id,
        task_model.Task.employer_id == employer_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update fields if provided
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.status is not None:
        task.status = getattr(task_model.TaskStatus, task_data.status.upper(), task.status)
    if task_data.priority is not None:
        task.priority = getattr(task_model.TaskPriority, task_data.priority.upper(), task.priority)
    if task_data.due_date is not None:
        try:
            task.due_date = datetime.fromisoformat(task_data.due_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid due_date format")
    
    # Handle employee assignments if provided
    if task_data.assigned_employee_ids is not None:
        # Remove existing assignments
        db.query(task_assignment_model.TaskAssignment).filter(
            task_assignment_model.TaskAssignment.task_id == task_id
        ).delete()
        
        # Add new assignments
        for employee_id in task_data.assigned_employee_ids:
            # Verify employee exists and belongs to employer
            employee_exists = db.query(EmployerEmployee).filter(
                EmployerEmployee.employer_id == employer_id,
                EmployerEmployee.employee_id == employee_id
            ).first()
            
            if employee_exists:
                assignment = task_assignment_model.TaskAssignment(
                    task_id=task_id,
                    employee_id=employee_id,
                    employer_id=employer_id,
                    assigned_by_id=employer_id,
                    assigned_at=datetime.utcnow()
                )
                db.add(assignment)
    
    task.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(task)
    
    # Get updated task with assignments
    task_with_assignments = db.query(task_model.Task).options(
        joinedload(task_model.Task.task_assignments).joinedload(task_assignment_model.TaskAssignment.employee)
    ).filter(task_model.Task.id == task_id).first()
    
    assigned_employees = []
    for assignment in task_with_assignments.task_assignments:
        assigned_employees.append({
            "id": assignment.employee.id,
            "first_name": assignment.employee.first_name,
            "last_name": assignment.employee.last_name,
            "email": assignment.employee.email
        })
    
    return TaskOut(
        id=task.id,
        title=task.title,
        description=task.description,
        priority=task.priority.value,
        status=task.status.value,
        due_date=task.due_date,
        created_at=task.created_at,
        updated_at=task.updated_at,
        employer_id=task.employer_id,
        created_by_id=task.created_by_id,
        assigned_employees=assigned_employees
    )


# Delete task
@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Delete a task"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    task = db.query(task_model.Task).filter(
        task_model.Task.id == task_id,
        task_model.Task.employer_id == employer_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Delete task (assignments will be deleted due to cascade)
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}


# ✅ Task Comment Endpoints

# Add comment to task
@router.post("/tasks/{task_id}/comments")
def add_task_comment(
    task_id: int,
    comment_data: task_comment_schema.TaskCommentCreate,
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Add a comment to a task"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    # Verify task exists and belongs to employer
    task = db.query(task_model.Task).filter(
        task_model.Task.id == task_id,
        task_model.Task.employer_id == employer_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Create comment
    new_comment = task_comment_model.TaskComment(
        content=comment_data.content,
        task_id=task_id,
        author_id=employer_id
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    # Get author info for response
    author = db.query(employer_model.Employer).filter(
        employer_model.Employer.id == employer_id
    ).first()
    
    return {
        "message": "Comment added successfully",
        "comment": {
            "id": new_comment.id,
            "content": new_comment.content,
            "author_id": new_comment.author_id,
            "author_name": f"{author.first_name} {author.last_name}" if author else "Unknown",
            "created_at": new_comment.created_at.isoformat(),
            "updated_at": new_comment.updated_at.isoformat()
        }
    }


# Get comments for a task
@router.get("/tasks/{task_id}/comments")
def get_task_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Get all comments for a task"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    # Verify task exists and belongs to employer
    task = db.query(task_model.Task).filter(
        task_model.Task.id == task_id,
        task_model.Task.employer_id == employer_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get comments
    comments = db.query(task_comment_model.TaskComment).filter(
        task_comment_model.TaskComment.task_id == task_id
    ).order_by(task_comment_model.TaskComment.created_at.asc()).all()
    
    task_comments = []
    for comment in comments:
        author = db.query(employer_model.Employer).filter(
            employer_model.Employer.id == comment.author_id
        ).first()
        task_comments.append({
            "id": comment.id,
            "content": comment.content,
            "author_id": comment.author_id,
            "author_name": f"{author.first_name} {author.last_name}" if author else "Unknown",
            "created_at": comment.created_at.isoformat(),
            "updated_at": comment.updated_at.isoformat()
        })
    
    return {"comments": task_comments}


# Update a comment
@router.put("/tasks/{task_id}/comments/{comment_id}")
def update_task_comment(
    task_id: int,
    comment_id: int,
    comment_data: task_comment_schema.TaskCommentUpdate,
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Update a task comment"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    # Verify task exists and belongs to employer
    task = db.query(task_model.Task).filter(
        task_model.Task.id == task_id,
        task_model.Task.employer_id == employer_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get comment and verify ownership
    comment = db.query(task_comment_model.TaskComment).filter(
        task_comment_model.TaskComment.id == comment_id,
        task_comment_model.TaskComment.task_id == task_id,
        task_comment_model.TaskComment.author_id == employer_id
    ).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found or not authorized")
    
    # Update comment
    if comment_data.content is not None:
        comment.content = comment_data.content
        comment.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(comment)
    
    # Get author info for response
    author = db.query(employer_model.Employer).filter(
        employer_model.Employer.id == employer_id
    ).first()
    
    return {
        "message": "Comment updated successfully",
        "comment": {
            "id": comment.id,
            "content": comment.content,
            "author_id": comment.author_id,
            "author_name": f"{author.first_name} {author.last_name}" if author else "Unknown",
            "created_at": comment.created_at.isoformat(),
            "updated_at": comment.updated_at.isoformat()
        }
    }


# Delete a comment
@router.delete("/tasks/{task_id}/comments/{comment_id}")
def delete_task_comment(
    task_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Delete a task comment"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    # Verify task exists and belongs to employer
    task = db.query(task_model.Task).filter(
        task_model.Task.id == task_id,
        task_model.Task.employer_id == employer_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get comment and verify ownership
    comment = db.query(task_comment_model.TaskComment).filter(
        task_comment_model.TaskComment.id == comment_id,
        task_comment_model.TaskComment.task_id == task_id,
        task_comment_model.TaskComment.author_id == employer_id
    ).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found or not authorized")
    
    # Delete comment
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}


# ✅ Get tasks assigned to a specific employee
@router.get("/employees/{employee_id}/tasks")
def get_employee_tasks(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_employer_user)
):
    """Get all tasks assigned to a specific employee"""
    # Verify the employee belongs to this employer
    employee_relationship = db.query(EmployerEmployee).filter(
        EmployerEmployee.employee_id == employee_id,
        EmployerEmployee.employer_id == current_user["user"].id
    ).first()
    
    if not employee_relationship:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Get all tasks assigned to this employee
    tasks = db.query(task_model.Task).join(
        task_assignment_model.TaskAssignment,
        task_model.Task.id == task_assignment_model.TaskAssignment.task_id
    ).filter(
        task_assignment_model.TaskAssignment.employee_id == employee_id
    ).all()
    
    # Format the response with task assignment details
    result = []
    for task in tasks:
        assignment = db.query(task_assignment_model.TaskAssignment).filter(
            task_assignment_model.TaskAssignment.task_id == task.id,
            task_assignment_model.TaskAssignment.employee_id == employee_id
        ).first()
        
        task_data = {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "status": task.status,
            "due_date": task.due_date,
            "created_at": task.created_at,
            "assigned_date": assignment.assigned_at if assignment else None
        }
        result.append(task_data)
    
    return result


@router.get("/employees/{employee_id}/attendance")
def get_employee_attendance(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_employer_user)
):
    """Get attendance records for a specific employee"""
    # Verify the employee belongs to this employer
    employee_relationship = db.query(EmployerEmployee).filter(
        EmployerEmployee.employee_id == employee_id,
        EmployerEmployee.employer_id == current_user["user"].id
    ).first()
    
    if not employee_relationship:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Get attendance records for this employee (last 60 days to ensure current month is included)
    from datetime import datetime, timedelta
    sixty_days_ago = datetime.now() - timedelta(days=60)
    
    attendance_records = db.query(attendance_model.Attendance).filter(
        attendance_model.Attendance.employee_id == employee_id,
        attendance_model.Attendance.date >= sixty_days_ago.date()
    ).order_by(attendance_model.Attendance.date.desc()).all()
    
    # Format the response
    result = []
    for record in attendance_records:
        attendance_data = {
            "id": record.id,
            "work_date": record.date,
            "check_in_time": record.clock_in,
            "check_out_time": record.clock_out,
            "status": record.status.value if record.status else 'absent',
            "total_hours": record.total_hours,
            "notes": record.notes
        }
        result.append(attendance_data)
    
    return result


# ✅ NOTIFICATIONS ENDPOINTS

# Get all notifications for employer
@router.get("/notifications")
def get_notifications(
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Get all notifications for the current employer"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    # Import notification model
    from shared.models.notification import Notification
    
    notifications = db.query(Notification).filter(
        Notification.employer_id == employer_id
    ).order_by(Notification.created_at.desc()).all()
    
    return [
        {
            "id": notif.id,
            "type": notif.type,
            "title": notif.title,
            "message": notif.message,
            "is_read": notif.is_read,
            "created_at": notif.created_at.isoformat(),
            "read_at": notif.read_at.isoformat() if notif.read_at else None
        }
        for notif in notifications
    ]


# Mark notification as read
@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Mark a specific notification as read"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    # Import notification model
    from shared.models.notification import Notification
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.employer_id == employer_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        db.commit()
        db.refresh(notification)
    
    return {
        "message": "Notification marked as read",
        "notification": {
            "id": notification.id,
            "type": notification.type,
            "title": notification.title,
            "message": notification.message,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat(),
            "read_at": notification.read_at.isoformat() if notification.read_at else None
        }
    }


# Get dashboard stats (including unread notifications count)
@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Get dashboard statistics for the employer"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    # Import notification model
    from shared.models.notification import Notification
    
    # Count employees
    employee_count = db.query(employee_model.Employee).join(
        EmployerEmployee
    ).filter(
        EmployerEmployee.employer_id == employer_id,
        EmployerEmployee.status == "active"
    ).count()
    
    # Count active tasks
    active_tasks = db.query(task_model.Task).filter(
        task_model.Task.employer_id == employer_id,
        task_model.Task.status.in_([TaskStatus.PENDING, TaskStatus.IN_PROGRESS])
    ).count()
    
    # Count monthly bookings (current month)
    current_month = datetime.now().replace(day=1)
    monthly_bookings = db.query(booking_model.CoworkingBooking).filter(
        booking_model.CoworkingBooking.employer_id == employer_id,
        booking_model.CoworkingBooking.start_date >= current_month
    ).count()
    
    # Count unread notifications
    unread_notifications = db.query(Notification).filter(
        Notification.employer_id == employer_id,
        Notification.is_read == False
    ).count()
    
    return {
        "employees": employee_count,
        "active_tasks": active_tasks,
        "monthly_bookings": monthly_bookings,
        "unread_notifications": unread_notifications
    }


# ✅ Billing Info Management

# Get billing info for employer
@router.get("/billing-info")
def get_billing_info(
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Get billing information for the current employer"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    billing_info = db.query(billing_model.BillingInfo).filter(
        billing_model.BillingInfo.employer_id == employer_id,
        billing_model.BillingInfo.is_active == True
    ).first()
    
    if not billing_info:
        return None
    
    return {
        "id": billing_info.id,
        "company_name": billing_info.company_name,
        "billing_email": billing_info.billing_email,
        "phone_number": billing_info.phone_number,
        "address_line_1": billing_info.address_line_1,
        "address_line_2": billing_info.address_line_2,
        "city": billing_info.city,
        "state_province": billing_info.state_province,
        "postal_code": billing_info.postal_code,
        "country": billing_info.country,
        "tax_id": billing_info.tax_id,
        "preferred_payment_method": billing_info.preferred_payment_method,
        "is_default": billing_info.is_default
    }


# Create or update billing info
@router.post("/billing-info")
def create_or_update_billing_info(
    data: dict,
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Create or update billing information for the current employer"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    # Check if billing info already exists
    existing_billing = db.query(billing_model.BillingInfo).filter(
        billing_model.BillingInfo.employer_id == employer_id,
        billing_model.BillingInfo.is_active == True
    ).first()
    
    if existing_billing:
        # Update existing billing info
        for key, value in data.items():
            if hasattr(existing_billing, key):
                setattr(existing_billing, key, value)
        existing_billing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_billing)
        return {"message": "Billing info updated successfully", "id": existing_billing.id}
    else:
        # Create new billing info with field mapping and defaults
        new_billing = billing_model.BillingInfo(
            employer_id=employer_id,
            company_name=data.get("company_name") or f"{data.get('first_name', '')} {data.get('last_name', '')}".strip() or "Default Company",
            billing_email=data.get("billing_email") or data.get("email") or current["user"].email,
            phone_number=data.get("phone_number") or data.get("phone"),
            address_line_1=data.get("address_line_1") or data.get("address") or "Default Address",
            address_line_2=data.get("address_line_2"),
            city=data.get("city") or "Lahore",
            state_province=data.get("state_province") or data.get("state") or "Punjab",
            postal_code=data.get("postal_code") or data.get("zip_code") or "00000",
            country=data.get("country") or "Pakistan",
            tax_id=data.get("tax_id"),
            preferred_payment_method=data.get("preferred_payment_method", "credit_card")
        )
        
        db.add(new_billing)
        db.commit()
        db.refresh(new_billing)
        return {"message": "Billing info created successfully", "id": new_billing.id}


# ✅ Employee Task Performance Comparison
@router.get("/employees/task-performance")
def get_employee_task_performance(
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Get task performance comparison for all employees"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    # Get all employees for this employer
    employees = db.query(employee_model.Employee).join(
        EmployerEmployee
    ).filter(
        EmployerEmployee.employer_id == employer_id
    ).all()
    
    performance_data = []
    
    for employee in employees:
        # Get task assignments for this employee
        task_assignments = db.query(task_assignment_model.TaskAssignment).join(
            task_model.Task
        ).filter(
            task_assignment_model.TaskAssignment.employee_id == employee.id,
            task_model.Task.employer_id == employer_id
        ).all()
        
        total_tasks = len(task_assignments)
        completed_tasks = 0
        on_time_completions = 0
        overdue_tasks = 0
        avg_completion_days = 0
        
        if total_tasks > 0:
            completion_days = []
            
            for assignment in task_assignments:
                task = assignment.task
                
                # Count completed tasks
                if task.status == task_model.TaskStatus.COMPLETED and assignment.completed_at:
                    completed_tasks += 1
                    
                    # Calculate completion time
                    if task.due_date:
                        completion_days_count = (assignment.completed_at.date() - assignment.assigned_at.date()).days
                        completion_days.append(completion_days_count)
                        
                        # Check if completed on time
                        if assignment.completed_at <= task.due_date:
                            on_time_completions += 1
                        else:
                            overdue_tasks += 1
                
                # Count currently overdue tasks
                elif task.due_date and task.due_date < datetime.now() and task.status != task_model.TaskStatus.COMPLETED:
                    overdue_tasks += 1
            
            # Calculate average completion time
            if completion_days:
                avg_completion_days = sum(completion_days) / len(completion_days)
        
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        on_time_rate = (on_time_completions / completed_tasks * 100) if completed_tasks > 0 else 0
        
        performance_data.append({
            "employee_id": employee.id,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "email": employee.email,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round(completion_rate, 1),
            "on_time_completions": on_time_completions,
            "on_time_rate": round(on_time_rate, 1),
            "overdue_tasks": overdue_tasks,
            "avg_completion_days": round(avg_completion_days, 1),
            "efficiency_score": round((completion_rate * 0.6 + on_time_rate * 0.4), 1)
        })
    
    # Sort by efficiency score descending
    performance_data.sort(key=lambda x: x["efficiency_score"], reverse=True)
    
    return {
        "employees": performance_data,
        "summary": {
            "total_employees": len(performance_data),
            "avg_completion_rate": round(sum(emp["completion_rate"] for emp in performance_data) / len(performance_data), 1) if performance_data else 0,
            "avg_on_time_rate": round(sum(emp["on_time_rate"] for emp in performance_data) / len(performance_data), 1) if performance_data else 0
        }
    }



    
    for employee in employees:
        # Get attendance records for this employee in the date range
        attendance_records = db.query(attendance_model.Attendance).filter(
            attendance_model.Attendance.employee_id == employee.id,
            attendance_model.Attendance.date >= start_date,
            attendance_model.Attendance.date <= end_date
        ).all()
        
        total_working_days = days  # Simplified - could exclude weekends/holidays
        present_days = len([record for record in attendance_records if record.check_in_time])
        absent_days = total_working_days - present_days
        
        # Calculate total hours worked
        total_hours = 0
        late_arrivals = 0
        early_departures = 0
        
        for record in attendance_records:
            if record.check_in_time and record.check_out_time:
                # Calculate hours worked for the day
                work_duration = record.check_out_time - record.check_in_time
                total_hours += work_duration.total_seconds() / 3600
                
                # Check for late arrivals (assuming 9 AM start time)
                expected_start = record.check_in_time.replace(hour=9, minute=0, second=0, microsecond=0)
                if record.check_in_time > expected_start:
                    late_arrivals += 1
                
                # Check for early departures (assuming 5 PM end time)
                expected_end = record.check_out_time.replace(hour=17, minute=0, second=0, microsecond=0)
                if record.check_out_time < expected_end:
                    early_departures += 1
        
        attendance_rate = (present_days / total_working_days * 100) if total_working_days > 0 else 0
        avg_hours_per_day = (total_hours / present_days) if present_days > 0 else 0
        punctuality_score = ((present_days - late_arrivals) / present_days * 100) if present_days > 0 else 0
        
        performance_data.append({
            "employee_id": employee.id,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "email": employee.email,
            "total_working_days": total_working_days,
            "present_days": present_days,
            "absent_days": absent_days,
            "attendance_rate": round(attendance_rate, 1),
            "total_hours": round(total_hours, 1),
            "avg_hours_per_day": round(avg_hours_per_day, 1),
            "late_arrivals": late_arrivals,
            "early_departures": early_departures,
            "punctuality_score": round(punctuality_score, 1),
            "overall_score": round((attendance_rate * 0.7 + punctuality_score * 0.3), 1)
        })
    
    # Sort by overall score descending
    performance_data.sort(key=lambda x: x["overall_score"], reverse=True)
    
    return {
        "employees": performance_data,
        "date_range": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days_analyzed": days
        },
        "summary": {
            "total_employees": len(performance_data),
            "avg_attendance_rate": round(sum(emp["attendance_rate"] for emp in performance_data) / len(performance_data), 1) if performance_data else 0,
            "avg_punctuality_score": round(sum(emp["punctuality_score"] for emp in performance_data) / len(performance_data), 1) if performance_data else 0,
            "total_hours_worked": round(sum(emp["total_hours"] for emp in performance_data), 1)
        }
    }


# Process booking payment and confirm booking
@router.post("/process-booking-payment")
def process_booking_payment(
    data: dict,
    db: Session = Depends(get_db),
    current=Depends(get_current_employer_user)
):
    """Process payment and confirm coworking booking"""
    if current["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    employer_id = current["user"].id
    
    try:
        # Get booking data
        booking_data = data.get("booking_data")
        billing_info = data.get("billing_info")
        payment_method = data.get("payment_method", "credit_card")
        
        # Create or update billing info
        if billing_info:
            existing_billing = db.query(billing_model.BillingInfo).filter(
                billing_model.BillingInfo.employer_id == employer_id,
                billing_model.BillingInfo.is_active == True
            ).first()
            
            if existing_billing:
                for key, value in billing_info.items():
                    if hasattr(existing_billing, key):
                        setattr(existing_billing, key, value)
                existing_billing.updated_at = datetime.utcnow()
            else:
                # Provide default values for required fields if not provided
                billing_defaults = {
                    'company_name': billing_info.get('company_name') or 'Default Company',
                    'billing_email': billing_info.get('billing_email') or current["user"].email,
                    'address_line_1': billing_info.get('address_line_1') or 'Default Address',
                    'city': billing_info.get('city') or 'Lahore',
                    'state_province': billing_info.get('state_province') or 'Punjab',
                    'postal_code': billing_info.get('postal_code') or '00000',
                    'country': billing_info.get('country') or 'Pakistan',
                    'preferred_payment_method': payment_method,
                    'is_default': True,
                    'is_active': True
                }
                # Merge with provided billing info
                billing_defaults.update(billing_info)
                
                new_billing = billing_model.BillingInfo(
                    employer_id=employer_id,
                    **billing_defaults
                )
                db.add(new_billing)
        
        # Create the booking
        new_booking = booking_model.CoworkingBooking(
            employer_id=employer_id,
            employee_id=booking_data.get("employee_id"),
            coworking_space_id=booking_data.get("coworking_space_id"),
            booking_type=booking_data.get("booking_type"),
            subscription_mode=booking_data.get("subscription_mode"),
            is_ongoing=booking_data.get("is_ongoing", False),
            start_date=datetime.strptime(booking_data.get("start_date"), "%Y-%m-%d").date(),
            end_date=datetime.strptime(booking_data.get("end_date"), "%Y-%m-%d").date(),
            days_of_week=booking_data.get("days_of_week"),
            duration_per_day=booking_data.get("duration_per_day"),
            total_cost=booking_data.get("total_cost"),
            notes=booking_data.get("notes")
        )
        
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
        
        # TODO: Integrate with Stripe payment processing here
        # For now, we'll simulate a successful payment
        
        return {
            "success": True,
            "message": "Booking confirmed successfully!",
            "booking_id": new_booking.id,
            "payment_status": "completed",
            "transaction_id": f"mock_txn_{new_booking.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Booking failed: {str(e)}")


# ✅ Update Subscription Pricing for Dynamic Billing
def update_subscription_pricing_for_next_month(subscription_id: str) -> dict:
    """
    Update subscription pricing based on actual selected days count in the upcoming month.
    This function should be called before each billing cycle.
    """
    try:
        # Retrieve subscription details
        subscription = stripe.Subscription.retrieve(subscription_id)
        metadata = subscription.metadata
        
        # Check if this is a dynamic billing subscription
        if metadata.get('dynamic_billing') != 'true':
            return {"status": "skipped", "reason": "Not a dynamic billing subscription"}
        
        # Extract subscription details from metadata
        selected_days = [int(x) for x in metadata.get('selected_days', '').split(',') if x]
        daily_rate_cents = int(metadata.get('daily_rate_cents', '0'))
        subscription_mode = metadata.get('subscription_mode', 'full_day')
        
        if not selected_days or not daily_rate_cents:
            return {"status": "error", "reason": "Missing subscription details in metadata"}
        
        # Calculate next month's billing amount
        next_amount, next_days_count, next_year, next_month = get_next_month_billing_amount(
            selected_days, daily_rate_cents, subscription_mode
        )
        
        # Get current price item
        current_price_id = subscription.items.data[0].price.id
        current_amount = subscription.items.data[0].price.unit_amount
        
        # Only update if the amount has changed
        if next_amount != current_amount:
            # Create new price with updated amount
            product_id = subscription.items.data[0].price.product
            new_price = stripe.Price.create(
                product=product_id,
                unit_amount=next_amount,
                currency='usd',
                recurring={'interval': 'month'},
                metadata={
                    'dynamic_billing': 'true',
                    'days_count': str(next_days_count),
                    'billing_month': f"{next_year}-{next_month:02d}",
                }
            )
            
            # Update subscription with new price
            stripe.Subscription.modify(
                subscription_id,
                items=[{
                    'id': subscription.items.data[0].id,
                    'price': new_price.id,
                }],
                proration_behavior='none',  # Don't prorate since we're calculating exact amounts
            )
            
            print(f"✅ Updated subscription {subscription_id}: ${current_amount/100} → ${next_amount/100} ({next_days_count} days in {next_year}-{next_month:02d})")
            
            return {
                "status": "updated",
                "subscription_id": subscription_id,
                "old_amount": current_amount / 100,
                "new_amount": next_amount / 100,
                "days_count": next_days_count,
                "billing_month": f"{next_year}-{next_month:02d}"
            }
        else:
            return {
                "status": "no_change",
                "subscription_id": subscription_id,
                "amount": next_amount / 100,
                "days_count": next_days_count,
                "billing_month": f"{next_year}-{next_month:02d}"
            }
            
    except Exception as e:
        print(f"❌ Error updating subscription pricing: {e}")
        return {"status": "error", "reason": str(e)}


# ✅ Stripe Webhook for Dynamic Billing Updates
@router.post("/stripe-webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhooks for dynamic billing updates.
    This endpoint should be called by Stripe before each billing cycle.
    """
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
        
        # Handle invoice.upcoming event (fired ~1 hour before billing)
        if event['type'] == 'invoice.upcoming':
            invoice = event['data']['object']
            subscription_id = invoice.get('subscription')
            
            if subscription_id:
                # Update subscription pricing for next billing cycle
                result = update_subscription_pricing_for_next_month(subscription_id)
                print(f"🔄 Webhook processed: {result}")
                
                return {"status": "success", "result": result}
        
        return {"status": "ignored", "event_type": event['type']}
        
    except ValueError as e:
        print(f"❌ Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        print(f"❌ Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        print(f"❌ Webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ✅ Manual Subscription Update Endpoint (for testing/admin use)
@router.post("/update-subscription-pricing/{subscription_id}")
def manual_update_subscription_pricing(
    subscription_id: str,
    current_user=Depends(get_current_user)
):
    """
    Manually update subscription pricing for testing or admin purposes.
    """
    if current_user["role"] != "employer":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    result = update_subscription_pricing_for_next_month(subscription_id)
    return result
