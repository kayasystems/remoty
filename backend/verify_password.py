#!/usr/bin/env python3
"""
Quick script to verify and fix coworking user password
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
        print(f"Found user: {patrick.first_name} {patrick.last_name}")
        print(f"Email: {patrick.email}")
        
        # Test common passwords
        test_passwords = ["password123", "admin1", "password", "123456"]
        working_password = None
        
        for pwd in test_passwords:
            try:
                if pwd_context.verify(pwd, patrick.password_hash):
                    working_password = pwd
                    print(f"✅ Current password is: {pwd}")
                    break
            except:
                continue
        
        if not working_password:
            # Set password to 'password123'
            new_hash = pwd_context.hash("password123")
            patrick.password_hash = new_hash
            db.commit()
            print("🔑 Password has been reset to: password123")
        
        print(f"\n🎯 Login credentials:")
        print(f"Email: pjaspell@yahoo.com")
        print(f"Password: {working_password or 'password123'}")
    else:
        print("❌ User pjaspell@yahoo.com not found!")

if __name__ == "__main__":
    main()
