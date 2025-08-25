from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
import sqlite3
import os
import math
from typing import Optional, List

app = FastAPI(title="Remoty API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://theremoty.com",
        "https://www.theremoty.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Database connection
def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), "secondhire.db")
    return sqlite3.connect(db_path)

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    user_type: str = "employer"

class EmployerProfile(BaseModel):
    id: int
    email: str
    company_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class Employee(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    phone_number: Optional[str] = None
    status: Optional[str] = None

class CoworkingSpace(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    address: str
    city: str
    state: Optional[str] = None
    country: str
    latitude: float
    longitude: float
    price_per_hour: Optional[float] = None
    price_per_day: Optional[float] = None
    price_per_week: Optional[float] = None
    price_per_month: Optional[float] = None
    amenities: Optional[str] = None
    packages: Optional[str] = None
    distance_km: Optional[float] = None
    full_address: Optional[str] = None

class CoworkingSearchRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 10
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None

# Routes
@app.get("/")
def read_root():
    return {"message": "Remoty Backend API is running!", "status": "success", "auto_deploy": "enabled"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "remoty-api"}

@app.post("/employer/login", response_model=LoginResponse)
def employer_login(request: LoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Query employer from database
        cursor.execute("SELECT id, email, password_hash FROM employers WHERE email = ?", (request.email,))
        employer = cursor.fetchone()
        
        if not employer:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        employer_id, email, password_hash = employer
        
        # Verify password
        if not verify_password(request.password, password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Generate mock JWT token
        mock_token = f"mock_token_{employer_id}_employer"
        
        return LoginResponse(
            access_token=mock_token,
            user_type="employer"
        )
    
    finally:
        conn.close()

@app.get("/employer/profile", response_model=EmployerProfile)
def get_employer_profile():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get first employer for testing with full address data
        cursor.execute("""
            SELECT id, email, company_name, first_name, last_name, 
                   address, city, state, zip_code, country, latitude, longitude 
            FROM employers LIMIT 1
        """)
        employer = cursor.fetchone()
        
        if not employer:
            raise HTTPException(status_code=404, detail="Employer not found")
        
        return EmployerProfile(
            id=employer[0],
            email=employer[1],
            company_name=employer[2],
            first_name=employer[3],
            last_name=employer[4],
            address=employer[5],
            city=employer[6],
            state=employer[7],
            zip_code=employer[8],
            country=employer[9],
            latitude=employer[10],
            longitude=employer[11]
        )
    
    finally:
        conn.close()

# Add alias endpoint for frontend compatibility
@app.get("/employer/me", response_model=EmployerProfile)
def get_employer_me():
    return get_employer_profile()

@app.get("/employer/employees", response_model=List[Employee])
def get_employees():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT id, first_name, last_name, email, address, city, country, 
                   phone_number, status 
            FROM employees 
            ORDER BY first_name, last_name
        """)
        employees = cursor.fetchall()
        
        result = []
        for emp in employees:
            result.append(Employee(
                id=emp[0],
                first_name=emp[1],
                last_name=emp[2],
                email=emp[3],
                address=emp[4],
                city=emp[5],
                country=emp[6],
                phone_number=emp[7],
                status=emp[8]
            ))
        
        return result
    
    finally:
        conn.close()

@app.post("/employer/employer-profile-coworking-spaces", response_model=List[CoworkingSpace])
def search_coworking_spaces(request: CoworkingSearchRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print(f"🔍 Search request: lat={request.latitude}, lng={request.longitude}, radius={request.radius_km}")
        
        # If no coordinates provided, use employer's coordinates
        search_lat = request.latitude
        search_lng = request.longitude
        
        if not search_lat or not search_lng:
            cursor.execute("SELECT latitude, longitude FROM employers LIMIT 1")
            emp_coords = cursor.fetchone()
            if emp_coords:
                search_lat, search_lng = emp_coords
                print(f"🏢 Using employer coordinates: lat={search_lat}, lng={search_lng}")
        
        # Calculate distance using Haversine formula in SQL
        cursor.execute("""
            SELECT id, title, description, address, city, latitude, longitude, 
                   price_per_hour, price_per_day, price_per_week, price_per_month,
                   state, amenities, images, country, packages,
                   (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
                    cos(radians(longitude) - radians(?)) + 
                    sin(radians(?)) * sin(radians(latitude)))) AS distance_km
            FROM coworkingspacelistings
            WHERE (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
                   cos(radians(longitude) - radians(?)) + 
                   sin(radians(?)) * sin(radians(latitude)))) <= ?
            ORDER BY distance_km
        """, (search_lat, search_lng, search_lat, search_lat, search_lng, search_lat, request.radius_km))
        
        spaces = cursor.fetchall()
        print(f"📍 Found {len(spaces)} spaces within {request.radius_km}km")
        
        result = []
        for space in spaces:
            # Build full address
            full_address = space[3]  # address
            if space[4]:  # city
                full_address += f", {space[4]}"
            if space[11]:  # state
                full_address += f", {space[11]}"
            if space[14]:  # country
                full_address += f", {space[14]}"
            
            result.append(CoworkingSpace(
                id=space[0],
                title=space[1],
                description=space[2],
                address=space[3],
                city=space[4],
                state=space[11],
                country=space[14],
                latitude=space[5],
                longitude=space[6],
                price_per_hour=space[7],
                price_per_day=space[8],
                price_per_week=space[9],
                price_per_month=space[10],
                amenities=space[12],
                packages=space[15],
                distance_km=round(space[16], 2),
                full_address=full_address
            ))
        
        return result
    
    finally:
        conn.close()

# Dashboard and stats endpoints
@app.get("/employer/dashboard/stats")
def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get employee count
        cursor.execute("SELECT COUNT(*) FROM employees")
        employee_count = cursor.fetchone()[0]
        
        # Get active bookings count
        cursor.execute("SELECT COUNT(*) FROM coworking_bookings WHERE payment_status = 'succeeded'")
        active_bookings = cursor.fetchone()[0]
        
        # Get task count (mock for now)
        active_tasks = 0
        
        return {
            "employees": employee_count,
            "active_bookings": active_bookings,
            "active_tasks": active_tasks,
            "total_spent": 0
        }
    finally:
        conn.close()

@app.get("/employer/employees/attendance-stats")
def get_attendance_stats(days: int = 30):
    # Mock attendance data for now
    return {
        "employees": [
            {"id": 1, "name": "Ayaz", "attendance_rate": 95.5, "days_present": 29, "days_absent": 1},
            {"id": 2, "name": "Mesam", "attendance_rate": 87.3, "days_present": 26, "days_absent": 4}
        ]
    }

@app.get("/employer/employees/task-performance")
def get_task_performance(days: int = 30):
    # Mock task performance data
    return {
        "employees": [
            {"id": 1, "name": "Ayaz", "completed_tasks": 15, "pending_tasks": 3, "performance_score": 92.5},
            {"id": 2, "name": "Mesam", "completed_tasks": 12, "pending_tasks": 5, "performance_score": 85.2}
        ]
    }

# Bookings endpoints
@app.get("/employer/bookings")
def get_bookings(employee_id: int = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if employee_id:
            cursor.execute("""
                SELECT cb.*, cs.title as space_title, e.first_name, e.last_name
                FROM coworking_bookings cb
                JOIN coworkingspacelistings cs ON cb.coworking_space_id = cs.id
                JOIN employees e ON cb.employee_id = e.id
                WHERE cb.employee_id = ?
                ORDER BY cb.created_at DESC
            """, (employee_id,))
        else:
            cursor.execute("""
                SELECT cb.*, cs.title as space_title, e.first_name, e.last_name
                FROM coworking_bookings cb
                JOIN coworkingspacelistings cs ON cb.coworking_space_id = cs.id
                JOIN employees e ON cb.employee_id = e.id
                ORDER BY cb.created_at DESC
            """)
        
        bookings = cursor.fetchall()
        result = []
        
        for booking in bookings:
            result.append({
                "id": booking[0],
                "employer_id": booking[1],
                "employee_id": booking[2],
                "coworking_space_id": booking[3],
                "booking_type": booking[4],
                "subscription_mode": booking[5],
                "is_ongoing": booking[6],
                "start_date": booking[7],
                "end_date": booking[8],
                "days_of_week": booking[9],
                "duration_per_day": booking[10],
                "total_cost": booking[11],
                "notes": booking[12],
                "created_at": booking[13],
                "payment_status": booking[15],
                "space_title": booking[17],
                "employee_name": f"{booking[18]} {booking[19]}"
            })
        
        return result
    finally:
        conn.close()

@app.get("/employer/bookings/{booking_id}")
def get_booking_detail(booking_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT cb.*, cs.title as space_title, cs.address, cs.city, e.first_name, e.last_name
            FROM coworking_bookings cb
            JOIN coworkingspacelistings cs ON cb.coworking_space_id = cs.id
            JOIN employees e ON cb.employee_id = e.id
            WHERE cb.id = ?
        """, (booking_id,))
        
        booking = cursor.fetchone()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        return {
            "id": booking[0],
            "employer_id": booking[1],
            "employee_id": booking[2],
            "coworking_space_id": booking[3],
            "booking_type": booking[4],
            "subscription_mode": booking[5],
            "is_ongoing": booking[6],
            "start_date": booking[7],
            "end_date": booking[8],
            "days_of_week": booking[9],
            "duration_per_day": booking[10],
            "total_cost": booking[11],
            "notes": booking[12],
            "created_at": booking[13],
            "payment_status": booking[15],
            "space_title": booking[17],
            "space_address": booking[18],
            "space_city": booking[19],
            "employee_name": f"{booking[20]} {booking[21]}"
        }
    finally:
        conn.close()

@app.get("/employer/bookings/employee/{employee_id}")
def get_employee_bookings(employee_id: int):
    return get_bookings(employee_id=employee_id)

# Employee detail endpoint
@app.get("/employer/employees/{employee_id}")
def get_employee_detail(employee_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT id, first_name, last_name, email, address, city, country, 
                   phone_number, status, latitude, longitude, created_at
            FROM employees 
            WHERE id = ?
        """, (employee_id,))
        
        employee = cursor.fetchone()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        return {
            "id": employee[0],
            "first_name": employee[1],
            "last_name": employee[2],
            "email": employee[3],
            "address": employee[4],
            "city": employee[5],
            "country": employee[6],
            "phone_number": employee[7],
            "status": employee[8],
            "latitude": employee[9],
            "longitude": employee[10],
            "created_at": employee[11]
        }
    finally:
        conn.close()

# Tasks endpoints (mock for now)
@app.get("/employer/tasks")
def get_tasks(employee_id: int = None):
    # Mock task data
    tasks = [
        {"id": 1, "title": "Complete project setup", "status": "in_progress", "employee_id": 1, "due_date": "2024-01-15"},
        {"id": 2, "title": "Review documentation", "status": "pending", "employee_id": 2, "due_date": "2024-01-20"}
    ]
    
    if employee_id:
        tasks = [t for t in tasks if t["employee_id"] == employee_id]
    
    return tasks

@app.get("/employer/tasks/{task_id}")
def get_task_detail(task_id: int):
    # Mock task detail
    return {
        "id": task_id,
        "title": "Sample Task",
        "description": "Task description",
        "status": "in_progress",
        "employee_id": 1,
        "due_date": "2024-01-15",
        "created_at": "2024-01-01"
    }

# Attendance endpoint (mock)
@app.get("/employer/attendance/employee/{employee_id}")
def get_employee_attendance(employee_id: int, start_date: str = None, end_date: str = None):
    # Mock attendance data
    return {
        "employee_id": employee_id,
        "attendance_records": [
            {"date": "2024-01-01", "status": "present", "hours_worked": 8},
            {"date": "2024-01-02", "status": "present", "hours_worked": 8},
            {"date": "2024-01-03", "status": "absent", "hours_worked": 0}
        ]
    }

# Notifications endpoint (mock)
@app.get("/employer/notifications")
def get_notifications():
    return {
        "notifications": [
            {"id": 1, "title": "New booking confirmed", "message": "Employee booking confirmed", "read": False, "created_at": "2024-01-01"}
        ]
    }

@app.get("/employer/coworking-space/{space_id}/images")
def get_space_images(space_id: int):
    # Return mock image data for now since we don't have images in the database
    return {
        "general_images": [
            "https://via.placeholder.com/400x300?text=Workspace+1",
            "https://via.placeholder.com/400x300?text=Workspace+2"
        ],
        "packages": [
            {
                "name": "Hot Desk",
                "images": ["https://via.placeholder.com/400x300?text=Hot+Desk"]
            }
        ],
        "total_images": 3
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
