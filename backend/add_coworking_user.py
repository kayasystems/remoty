#!/usr/bin/env python3
"""
Add a new coworking user to the database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.database import get_db
from shared.models.coworking_user import CoworkingUser
from passlib.context import CryptContext
from datetime import datetime

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def add_coworking_user():
    """Add the new coworking user"""
    db = next(get_db())
    
    try:
        # Check if user already exists
        existing_user = db.query(CoworkingUser).filter_by(email="contact@kayasaas.com").first()
        if existing_user:
            print("✅ User contact@kayasaas.com already exists!")
            print(f"   ID: {existing_user.id}")
            print(f"   Name: {existing_user.first_name} {existing_user.last_name}")
            return existing_user.id
        
        # Create new coworking user
        hashed_password = hash_password("admin")
        
        new_user = CoworkingUser(
            first_name="Contact",
            last_name="KayaSaaS",
            email="contact@kayasaas.com",
            password_hash=hashed_password,
            phone="+1-555-0123",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(new_user)
        db.commit()
        
        print("✅ Successfully created coworking user:")
        print(f"   Email: contact@kayasaas.com")
        print(f"   Password: admin")
        print(f"   ID: {new_user.id}")
        
        return new_user.id
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    add_coworking_user()
