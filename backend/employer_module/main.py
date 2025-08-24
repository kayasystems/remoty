"""
Employer Module Main Application
FastAPI application for employer management
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from employer_module.routes.employer import router as employer_router

app = FastAPI(
    title="Employer Module API",
    description="API for employer management",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(employer_router, prefix="/employer")

@app.get("/")
def read_root():
    return {"message": "Employer Module API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "employer-module"}
