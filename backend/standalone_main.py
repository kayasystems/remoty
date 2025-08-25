from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
import sqlite3
import os
from typing import Optional

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

# Routes
@app.get("/")
def root():
    return {"message": "Remoty API is running", "status": "healthy"}

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
    # For testing, return a mock profile
    # In production, you'd extract user ID from JWT token
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get first employer for testing
        cursor.execute("SELECT id, email, company_name, first_name, last_name FROM employers LIMIT 1")
        employer = cursor.fetchone()
        
        if not employer:
            raise HTTPException(status_code=404, detail="Employer not found")
        
        employer_id, email, company_name, first_name, last_name = employer
        
        return EmployerProfile(
            id=employer_id,
            email=email,
            company_name=company_name,
            first_name=first_name,
            last_name=last_name
        )
    
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
