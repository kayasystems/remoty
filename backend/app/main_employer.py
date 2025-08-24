"""
🏢 EMPLOYER MAIN APP - RUNS ON PORT 8000
========================================
CRITICAL: This app serves on port 8000 ONLY

PORT ARCHITECTURE:
- Port 8000: Employer Backend (THIS FILE)
  - All employer-related APIs (/employer/*)
  - Admin APIs (/admin/*)
  - Employee APIs (/employee/*)
  - Employer authentication & JWT
  - Static file serving for employer uploads

- Port 8001: Coworking Backend (main_coworking.py)
  - All coworking APIs (/coworking/*)
  - Coworking authentication & JWT
  - Static file serving for coworking images

⚠️  NEVER CHANGE PORT WITHOUT UPDATING ALL REFERENCES

Employer Module - Independent FastAPI Application
Handles all employer-related functionality without coworking dependencies
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import only employer-related routes
from app.routes import admin
from employer_module.routes import employer, employee

app = FastAPI(
    title="Remoty - Employer API",
    description="Independent Employer Management System",
    version="1.0.0"
)

# ✅ CORS Middleware - Employer specific
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "*",
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With"
    ],
    expose_headers=["*"],
)

# ✅ Include only employer-related routes
app.include_router(employer.router)
app.include_router(admin.router, prefix="/admin")
app.include_router(employee.router, prefix="/employee")

@app.get("/")
def root():
    return {
        "message": "Remoty Employer API is running",
        "module": "employer",
        "version": "1.0.0",
        "endpoints": [
            "/employer/*",
            "/admin/*", 
            "/employee/*"
        ]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "module": "employer",
        "service": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
