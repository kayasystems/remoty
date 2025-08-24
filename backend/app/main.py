from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import admin
from employer_module.routes import employer, employee
# Coworking routes removed - use main_coworking.py for coworking server

# Import all models to ensure SQLAlchemy can establish relationships
from shared.models import coworking_user, coworkingspacelisting, coworking_images, booking

app = FastAPI()

# ✅ CORS Middleware - Comprehensive development setup
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

# ✅ Include routes
app.include_router(employer.router)
app.include_router(admin.router, prefix="/admin")
app.include_router(employee.router, prefix="/employee")
# Coworking routes removed - this main.py is for shared/legacy use only
# Use main_employer.py for employer server (port 8000)
# Use main_coworking.py for coworking server (port 8001)

# Mount static files for image serving
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "SecondHire API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
