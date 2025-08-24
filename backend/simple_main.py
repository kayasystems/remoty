from fastapi import FastAPI

app = FastAPI(title="Remoty Backend", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Remoty Backend is running!", "status": "success"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
