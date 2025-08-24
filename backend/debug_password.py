#!/usr/bin/env python3
"""
Debug password hash for Patrick
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
        print(f"User: {patrick.first_name} {patrick.last_name}")
        print(f"Email: {patrick.email}")
        print(f"Password Hash: {patrick.password_hash}")
        print()
        
        # Test various passwords
        test_passwords = ["admin1", "password123", "password", "123456", "admin", "pjaspell"]
        
        for pwd in test_passwords:
            try:
                is_valid = pwd_context.verify(pwd, patrick.password_hash)
                status = "✅ VALID" if is_valid else "❌ Invalid"
                print(f"{status}: '{pwd}'")
                if is_valid:
                    print(f"🎯 WORKING PASSWORD: {pwd}")
                    break
            except Exception as e:
                print(f"❌ Error testing '{pwd}': {e}")
        
        # Also test if we can create a new hash for admin1
        print(f"\n🔧 Creating new hash for 'admin1'...")
        new_hash = pwd_context.hash("admin1")
        patrick.password_hash = new_hash
        db.commit()
        print(f"✅ Password updated to 'admin1'")
        
        # Verify the new hash works
        if pwd_context.verify("admin1", new_hash):
            print(f"✅ Verification successful: 'admin1' now works")
        else:
            print(f"❌ Verification failed: something went wrong")
            
    else:
        print("❌ User pjaspell@yahoo.com not found!")

if __name__ == "__main__":
    main()
