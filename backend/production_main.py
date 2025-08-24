from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import os

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

# Basic models for API responses
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

# Mock data for testing - replace with real database later
MOCK_USERS = {
    "employer@test.com": {
        "id": 1,
        "email": "employer@test.com",
        "password": "password123",
        "name": "Test Employer",
        "user_type": "employer"
    },
    "employee@test.com": {
        "id": 2,
        "email": "employee@test.com", 
        "password": "password123",
        "name": "Test Employee",
        "user_type": "employee"
    }
}

@app.get("/")
def root():
    return {"message": "Remoty API is running", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "remoty-api"}

@app.post("/auth/login", response_model=LoginResponse)
def login(request: LoginRequest):
    user = MOCK_USERS.get(request.email)
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Mock JWT token - replace with real JWT generation
    mock_token = f"mock_token_{user['id']}_{user['user_type']}"
    
    return LoginResponse(
        access_token=mock_token,
        user_type=user["user_type"]
    )

@app.get("/auth/me", response_model=UserResponse)
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    # Mock token validation - replace with real JWT validation
    if not token.startswith("mock_token_"):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        parts = token.split("_")
        user_id = int(parts[2])
        user_type = parts[3]
        
        # Find user by ID
        for user in MOCK_USERS.values():
            if user["id"] == user_id and user["user_type"] == user_type:
                return UserResponse(
                    id=user["id"],
                    email=user["email"],
                    name=user["name"],
                    user_type=user["user_type"]
                )
    except:
        pass
    
    raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/employer/dashboard")
def employer_dashboard(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return {"message": "Employer dashboard data", "status": "success"}

@app.get("/employee/dashboard") 
def employee_dashboard(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return {"message": "Employee dashboard data", "status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
