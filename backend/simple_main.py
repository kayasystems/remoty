from fastapi import FastAPI
from coworking_module.routes.coworking_complete import router as coworking_router

app = FastAPI(title="Remoty Backend", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Remoty Backend is running!", "status": "success"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Mount coworking module routes (serves /coworking/login, /coworking/*)
app.include_router(coworking_router, prefix="/coworking")
