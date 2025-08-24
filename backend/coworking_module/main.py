"""
Coworking Module Main Application
FastAPI application for coworking space management
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from coworking_module.routes.coworking_complete import router as coworking_router

app = FastAPI(
    title="Coworking Module API",
    description="API for coworking space management",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(coworking_router, prefix="/coworking")

@app.get("/")
def read_root():
    return {"message": "Coworking Module API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "coworking-module"}
