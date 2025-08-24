#!/usr/bin/env python3
"""
🏢 COWORKING BACKEND SERVER - PORT 8001
=======================================
CRITICAL: This server MUST run on port 8001 ONLY

PORT ARCHITECTURE:
- Port 8000: Employer Backend (start_employer.py)
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

⚠️  NEVER CHANGE THESE PORTS WITHOUT UPDATING:
    - Frontend API configurations (services/api.js)
    - All hardcoded localhost URLs in components
    - Docker configurations
    - Environment variables
"""
import uvicorn
from app.main_coworking import app

if __name__ == "__main__":
    print("🏢 Starting Remoty Coworking API Server...")
    print("📍 Server will run on: http://localhost:8001")
    print("📋 Available endpoints:")
    print("   - /coworking/* (Coworking space management)")
    print("   - /docs (API documentation)")
    print("   - /health (Health check)")
    print("")
    
    uvicorn.run(
        "app.main_coworking:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
