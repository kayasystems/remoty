#!/usr/bin/env python3
"""
🏢 EMPLOYER BACKEND SERVER - PORT 8000
=====================================
CRITICAL: This server MUST run on port 8000 ONLY

PORT ARCHITECTURE:
- Port 8000: Employer Backend (THIS FILE)
  - All employer-related APIs (/employer/*)
  - Admin APIs (/admin/*)
  - Employee APIs (/employee/*)
  - Employer authentication & JWT
  - Static file serving for employer uploads

- Port 8001: Coworking Backend (start_coworking.py)
  - All coworking APIs (/coworking/*)
  - Coworking authentication & JWT
  - Static file serving for coworking images

⚠️  NEVER CHANGE THESE PORTS WITHOUT UPDATING:
    - Frontend API configurations (services/api.js)
    - All hardcoded localhost URLs in components
    - Docker configurations
    - Environment variables
"""
import uvicorn
from app.main_employer import app

if __name__ == "__main__":
    print("🏢 Starting Remoty Employer API Server...")
    print("📍 Server will run on: http://localhost:8000")
    print("📋 Available endpoints:")
    print("   - /employer/* (Employer management)")
    print("   - /admin/* (Admin functions)")
    print("   - /employee/* (Employee functions)")
    print("   - /docs (API documentation)")
    print("   - /health (Health check)")
    print("")
    
    uvicorn.run(
        "app.main_employer:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
