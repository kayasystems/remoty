"""
🔧 ADMIN MAIN APP - RUNS ON PORT 8002
=====================================
CRITICAL: This app serves on port 8002 ONLY

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

- Port 8002: Admin Backend (THIS FILE)
  - All admin APIs (/admin/*)
  - Admin authentication & JWT
  - System management endpoints
  - User management and verification

⚠️  NEVER CHANGE PORT WITHOUT UPDATING ALL REFERENCES

Admin Module - Independent FastAPI Application
Handles all admin-related functionality with complete separation
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import all models to ensure they're loaded for SQLAlchemy relationships
from shared.models.admin import Admin
from shared.models.employer import Employer
from shared.models.employee import Employee
from shared.models.coworking_user import CoworkingUser
from shared.models.coworkingspacelisting import CoworkingSpaceListing

# Import admin routes (independent module)
from admin_module.routes import admin_complete

app = FastAPI(
    title="Remoty - Admin API",
    description="Independent Admin Management System",
    version="1.0.0"
)

# ✅ CORS Middleware - Admin specific
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

# ✅ Include admin routes
app.include_router(admin_complete.router)

# ✅ Mount static files for admin uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {
        "message": "Remoty Admin API is running",
        "module": "admin",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "module": "admin",
        "service": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)  # Admin port
