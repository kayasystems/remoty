#!/usr/bin/env python3
"""
Create a login token for testing
"""
import sys
import os

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from shared.database import get_db
from shared.models.employer import Employer
from app.auth import create_access_token

def create_test_token():
    db = next(get_db())
    
    # Get first employer
    employer = db.query(Employer).first()
    if not employer:
        print("No employer found. Please create an employer first.")
        return
    
    print(f"Creating token for employer: {employer.first_name} {employer.last_name} ({employer.email})")
    
    # Create JWT token
    token = create_access_token(data={"sub": str(employer.id), "role": "employer"})
    
    print(f"\n✅ JWT Token created:")
    print(f"Token: {token}")
    print(f"\nTo use this token:")
    print(f"1. Open browser developer tools")
    print(f"2. Go to Application/Local Storage")
    print(f"3. Set key 'token' to: {token}")
    print(f"4. Refresh the page")
    
    db.close()

if __name__ == "__main__":
    create_test_token()
