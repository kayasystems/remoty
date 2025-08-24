#!/usr/bin/env python3
"""
Create Admin User Script
Creates an admin user with specified credentials for the admin module
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from shared.database import SessionLocal, engine, Base
from shared.models.admin_user import AdminUser
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def create_admin_user():
    """Create admin user with specified credentials"""
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create database session
    db: Session = SessionLocal()
    
    try:
        # Check if admin user already exists
        existing_admin = db.query(AdminUser).filter_by(email="farrukh@kayasaas.com").first()
        
        if existing_admin:
            print("❌ Admin user with email 'farrukh@kayasaas.com' already exists!")
            print(f"   Admin ID: {existing_admin.id}")
            print(f"   Name: {existing_admin.first_name} {existing_admin.last_name}")
            print(f"   Email: {existing_admin.email}")
            return
        
        # Create new admin user
        admin_user = AdminUser(
            first_name="Farrukh",
            last_name="Admin",
            email="farrukh@kayasaas.com",
            password_hash=hash_password("admin1")
        )
        
        # Add to database
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user created successfully!")
        print(f"   Admin ID: {admin_user.id}")
        print(f"   Name: {admin_user.first_name} {admin_user.last_name}")
        print(f"   Email: {admin_user.email}")
        print(f"   Password: admin1")
        print("\n🔐 Admin Login Credentials:")
        print("   Email: farrukh@kayasaas.com")
        print("   Password: admin1")
        print("\n🌐 Admin Login URL: http://localhost:3001/admin/login")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Creating Admin User...")
    print("=" * 50)
    create_admin_user()
    print("=" * 50)
