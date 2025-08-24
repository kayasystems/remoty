#!/usr/bin/env python3
"""
Set Patrick's password to admin1
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.database import get_db
from shared.models.coworking_user import CoworkingUser
from passlib.context import CryptContext

# Initialize password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def main():
    db = next(get_db())
    
    # Get Patrick's user
    patrick = db.query(CoworkingUser).filter(CoworkingUser.email == "pjaspell@yahoo.com").first()
    
    if patrick:
        # Set password to 'admin1'
        new_hash = pwd_context.hash("admin1")
        patrick.password_hash = new_hash
        db.commit()
        print(f"✅ Password updated for {patrick.first_name} {patrick.last_name}")
        print(f"📧 Email: pjaspell@yahoo.com")
        print(f"🔑 Password: admin1")
    else:
        print("❌ User pjaspell@yahoo.com not found!")

if __name__ == "__main__":
    main()
