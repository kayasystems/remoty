"""
🏢 COWORKING MAIN APP - RUNS ON PORT 8001
=========================================
CRITICAL: This app serves on port 8001 ONLY

PORT ARCHITECTURE:
- Port 8000: Employer Backend (main_employer.py)
  - All employer-related APIs (/employer/*)
  - Admin APIs (/admin/*)
  - Employee APIs (/employee/*)
  - Employer authentication & JWT
  - Static file serving for employer uploads

- Port 8001: Coworking Backend (THIS FILE)
  - All coworking APIs (/coworking/*)
  - Coworking authentication & JWT
  - Static file serving for coworking images
  - Public image endpoints for employer frontend

⚠️  NEVER CHANGE PORT WITHOUT UPDATING ALL REFERENCES

Coworking Module - Independent FastAPI Application
Handles all coworking-related functionality without employer dependencies
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import all models to ensure they're loaded for SQLAlchemy relationships
from shared.models.coworking_user import CoworkingUser
from shared.models.coworkingspacelisting import CoworkingSpaceListing
from shared.models.coworking_images import CoworkingImage
from shared.models.booking import CoworkingBooking

# Import complete coworking routes (independent module)
from coworking_module.routes import coworking_complete

app = FastAPI(
    title="Remoty - Coworking API",
    description="Independent Coworking Space Management System",
    version="1.0.0"
)

# ✅ CORS Middleware - Coworking specific
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

# ✅ Include complete coworking routes
app.include_router(coworking_complete.router, prefix="/coworking")

# ✅ Mount static files for image serving
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {
        "message": "Remoty Coworking API is running",
        "module": "coworking",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "module": "coworking",
        "service": "running"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Different port for coworking
