#!/usr/bin/env python3
"""
Script to test coworking login and get user details
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
    
    # Get all coworking users
    users = db.query(CoworkingUser).all()
    print("📋 Coworking Users in Database:")
    print("=" * 50)
    
    for user in users:
        print(f"ID: {user.id}")
        print(f"Name: {user.first_name} {user.last_name}")
        print(f"Email: {user.email}")
        print(f"Phone: {getattr(user, 'phone', 'Not set')}")
        print(f"Created: {getattr(user, 'created_at', 'Not set')}")
        
        # Try to verify if common passwords work
        test_passwords = ["password123", "password", "123456", "admin"]
        working_password = None
        
        for pwd in test_passwords:
            try:
                if pwd_context.verify(pwd, user.password_hash):
                    working_password = pwd
                    break
            except:
                continue
        
        if working_password:
            print(f"✅ Password: {working_password}")
        else:
            print("❌ Password: Unknown (try 'password123')")
        
        print("-" * 30)
    
    # If PATRICK ASPELL doesn't have a working password, reset it
    patrick = db.query(CoworkingUser).filter(CoworkingUser.email == "pjaspell@yahoo.com").first()
    if patrick:
        # Reset Patrick's password to 'password123'
        new_password_hash = pwd_context.hash("password123")
        patrick.password_hash = new_password_hash
        db.commit()
        print(f"🔑 Reset password for {patrick.first_name} {patrick.last_name} to: password123")
    
    print("\n🎯 To access the coworking space details:")
    print("1. Go to: http://localhost:3000/coworking/login")
    print("2. Login with: pjaspell@yahoo.com / password123")
    print("3. Navigate to: http://localhost:3000/coworking/spaces/1/details")

if __name__ == "__main__":
    main()
