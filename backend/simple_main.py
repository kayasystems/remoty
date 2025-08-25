from fastapi import FastAPI
from fastapi import HTTPException
from pydantic import BaseModel

app = FastAPI(title="Remoty Backend", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Remoty Backend is running!", "status": "success"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Models for login
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    user_type: str = "coworking"

# Minimal coworking login to resolve 404
@app.post("/coworking/login", response_model=LoginResponse)
def coworking_login(request: LoginRequest):
    # Temporary simple check to unblock login; replace with real DB auth if needed
    if request.email.lower() == "pjaspell@yahoo.com" and request.password == "admin1":
        return LoginResponse(access_token="mock_token_coworking_1", user_type="coworking")
    raise HTTPException(status_code=401, detail="Invalid credentials")
