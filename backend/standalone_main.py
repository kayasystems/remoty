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
        # Calculate distance using Haversine formula in SQL
        cursor.execute("""
            SELECT id, title, description, address, city, state, country,
                   latitude, longitude, price_per_hour, price_per_day, 
                   price_per_week, price_per_month, amenities, packages,
                   (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
                   cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
                   sin(radians(latitude)))) AS distance_km
            FROM coworkingspacelistings
            HAVING distance_km <= ?
            ORDER BY distance_km
        """, (request.latitude, request.longitude, request.latitude, request.radius_km))
        
        spaces = cursor.fetchall()
        
        result = []
        for space in spaces:
            # Build full address
            full_address = space[3]  # address
            if space[4]:  # city
                full_address += f", {space[4]}"
            if space[5]:  # state
                full_address += f", {space[5]}"
            if space[6]:  # country
                full_address += f", {space[6]}"
            
            result.append(CoworkingSpace(
                id=space[0],
                title=space[1],
                description=space[2],
                address=space[3],
                city=space[4],
                state=space[5],
                country=space[6],
                latitude=space[7],
                longitude=space[8],
                price_per_hour=space[9],
                price_per_day=space[10],
                price_per_week=space[11],
                price_per_month=space[12],
                amenities=space[13],
                packages=space[14],
                distance_km=round(space[15], 2),
                full_address=full_address
            ))
        
        return result
    
    finally:
        conn.close()

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
