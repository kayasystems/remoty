"""
🧑‍💼 EMPLOYEE MAIN APP - RUNS ON PORT 8003
==========================================
CRITICAL: This app serves on port 8003 ONLY

PORT ARCHITECTURE:
- Port 8000: Employer Backend (main_employer.py)
  - All employer-related APIs (/employer/*)
  - Admin APIs (/admin/*)
  - Employee APIs (/employee/*)
  - Employer authentication & JWT
  - Static file serving for employer uploads

- Port 8001: Coworking Backend (main_coworking.py)
  - All coworking APIs (/coworking/*)
  - Coworking authentication & JWT
  - Static file serving for coworking images
  - Public image endpoints for employer frontend

- Port 8002: Admin Backend (main_admin.py)
  - All admin APIs (/admin/*)
  - Admin authentication & JWT
  - Admin dashboard and management

- Port 8003: Employee Backend (THIS FILE)
  - All employee APIs (/employee/*)
  - Employee authentication & JWT
  - Employee dashboard and profile management

⚠️  NEVER CHANGE PORT WITHOUT UPDATING ALL REFERENCES

Employee Module - Independent FastAPI Application
Handles all employee-related functionality without dependencies on other modules
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import all models to ensure they're loaded for SQLAlchemy relationships
from shared.models.employee import Employee
from shared.models.employer import Employer
from shared.models.coworkingspacelisting import CoworkingSpaceListing
from shared.models.booking import CoworkingBooking

# Import complete employee routes (independent module)
from employee_module.routes import employee_complete

app = FastAPI(
    title="Remoty - Employee API",
    description="Independent Employee Management System",
    version="1.0.0"
)

# ✅ CORS Middleware - Employee specific
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002"
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

# ✅ Include complete employee routes
app.include_router(employee_complete.router)

@app.get("/")
def root():
    return {
        "message": "Remoty Employee API is running",
        "module": "employee",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "module": "employee",
        "service": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)  # Dedicated port for employee module
