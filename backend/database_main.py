from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import os

# Import database and models
from shared.database import SessionLocal, engine
from shared.models.employer import Employer
from shared.models import Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Remoty API", version="1.0.0")

# CORS configuration for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://theremoty.com",
        "https://www.theremoty.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_type: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    user_type: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@app.get("/")
def root():
    return {"message": "Remoty API is running", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "remoty-api"}

@app.post("/employer/login", response_model=LoginResponse)
def employer_login(request: LoginRequest, db: Session = Depends(get_db)):
    # Temporary: Allow specific test credentials while database is being set up
    if request.email == "farrukh.naseem@kayasystems.com" and request.password == "admin1":
        mock_token = f"mock_token_1_employer"
        return LoginResponse(
            access_token=mock_token,
            user_type="employer"
        )
    
    # Query employer from database
    employer = db.query(Employer).filter(Employer.email == request.email).first()
    
    if not employer:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(request.password, employer.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate mock JWT token - replace with real JWT generation
    mock_token = f"mock_token_{employer.id}_employer"
    
    return LoginResponse(
        access_token=mock_token,
        user_type="employer"
    )

@app.get("/employer/profile", response_model=UserResponse)
def get_employer_profile(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    
    # Mock token validation - replace with real JWT validation
    if not token.startswith("mock_token_"):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        parts = token.split("_")
        employer_id = int(parts[2])
        
        # Temporary: Return test user data for specific token
        if employer_id == 1:
            return UserResponse(
                id=1,
                email="farrukh.naseem@kayasystems.com",
                name="Farrukh Naseem",
                user_type="employer"
            )
        
        # Get employer from database
        employer = db.query(Employer).filter(Employer.id == employer_id).first()
        if not employer:
            raise HTTPException(status_code=401, detail="User not found")
        
        return UserResponse(
            id=employer.id,
            email=employer.email,
            name=f"{employer.first_name} {employer.last_name}",
            user_type="employer"
        )
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/employer/dashboard")
def employer_dashboard(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return {"message": "Employer dashboard data", "status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
