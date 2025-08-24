from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date

from shared.database import get_db
from shared.models import employee as employee_model
from shared.models import invitetoken as token_model
from shared.models import attendance as attendance_model
from app.schemas import employee as employee_schema
from app.schemas.employee import EmployeeUpdate
from app.utils.geocode import geocode_address

from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/employee", tags=["Employee"])

# ✅ Register with invite token and geocoding
@router.post("/register")
def register_employee(data: employee_schema.EmployeeCreate, db: Session = Depends(get_db)):
    token = db.query(token_model.InviteToken).filter_by(token=data.invite_token, is_used=False).first()
    if not token or token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired invite token")

    existing = db.query(employee_model.Employee).filter_by(email=data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        full_address = f"{data.address}, {data.city}"
        latitude, longitude = geocode_address(full_address)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Geocoding failed: {str(e)}")

    new_emp = employee_model.Employee(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        address=data.address,
        city=data.city,
        latitude=latitude,
        longitude=longitude,
        employer_id=token.employer_id
    )

    db.add(new_emp)
    token.is_used = True
    db.commit()
    db.refresh(new_emp)

    return {"message": "Employee registered successfully", "employee_id": new_emp.id}

# ✅ Login
@router.post("/login")
def login_employee(data: employee_schema.EmployeeLogin, db: Session = Depends(get_db)):
    employee = db.query(employee_model.Employee).filter_by(email=data.email).first()
    if not employee or not verify_password(data.password, employee.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": str(employee.id),
        "role": "employee",
        "employer_id": employee.employer_id
    })
    return {"access_token": token, "token_type": "bearer"}

# ✅ Get profile
@router.get("/me")
def get_employee_profile(current_user=Depends(get_current_user)):
    if current_user["role"] != "employee":
        raise HTTPException(status_code=403, detail="Access denied")

    user = current_user["user"]
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": "employee",
        "employer_id": user.employer_id,
        "address": user.address,
        "city": user.city,
        "latitude": user.latitude,
        "longitude": user.longitude
    }

# ✅ Update profile
@router.put("/me")
def update_employee_profile(
    data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current=Depends(get_current_user)
):
    if current["role"] != "employee":
        raise HTTPException(status_code=403, detail="Unauthorized")

    employee = current["user"]

    if data.address:
        employee.address = data.address
    if data.city:
        employee.city = data.city

    if employee.address and employee.city:
        try:
            lat, lon = geocode_address(employee.address, employee.city)
            employee.latitude = lat
            employee.longitude = lon
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Geocoding failed: {str(e)}")

    db.commit()
    return {"detail": "Profile updated successfully"}

# ✅ Clock-in
@router.post("/clock-in")
def clock_in(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user["role"] != "employee":
        raise HTTPException(status_code=403, detail="Access denied")

    user = current_user["user"]
    today = date.today()

    existing = db.query(attendance_model.Attendance).filter_by(
        employee_id=user.id,
        employer_id=user.employer_id,
        date=today
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already clocked in today")

    record = attendance_model.Attendance(
        employee_id=user.id,
        employer_id=user.employer_id,
        date=today,
        clock_in=datetime.utcnow()
    )
    db.add(record)
    db.commit()
    return {"message": "Clocked in successfully"}

# ✅ Clock-out
@router.post("/clock-out")
def clock_out(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user["role"] != "employee":
        raise HTTPException(status_code=403, detail="Access denied")

    user = current_user["user"]
    today = date.today()

    record = db.query(attendance_model.Attendance).filter_by(
        employee_id=user.id,
        employer_id=user.employer_id,
        date=today
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="No clock-in record for today")

    if record.clock_out:
        raise HTTPException(status_code=400, detail="Already clocked out today")

    record.clock_out = datetime.utcnow()
    db.commit()
    return {"message": "Clocked out successfully"}

# ✅ Attendance history
@router.get("/attendance", response_model=list[employee_schema.AttendanceOut])
def get_attendance_history(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user["role"] != "employee":
        raise HTTPException(status_code=403, detail="Access denied")

    records = db.query(attendance_model.Attendance).filter_by(
        employee_id=current_user["user"].id,
        employer_id=current_user["user"].employer_id
    ).order_by(attendance_model.Attendance.date.desc()).all()

    return records
