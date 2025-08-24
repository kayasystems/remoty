#!/usr/bin/env python3
"""
Script to fix coworking space ownership issue
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.database import get_db
from shared.models.coworkingspacelisting import CoworkingSpaceListing
from shared.models.coworking_user import CoworkingUser
from passlib.context import CryptContext
import json

# Initialize password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def main():
    db = next(get_db())
    
    # Check existing coworking spaces
    spaces = db.query(CoworkingSpaceListing).all()
    print(f"Found {len(spaces)} coworking spaces in database:")
    
    for space in spaces:
        print(f"  - ID: {space.id}, Title: {space.title}, Owner ID: {space.coworking_user_id}")
    
    # Check existing coworking users
    users = db.query(CoworkingUser).all()
    print(f"\nFound {len(users)} coworking users in database:")
    
    for user in users:
        print(f"  - ID: {user.id}, Name: {user.first_name} {user.last_name}, Email: {user.email}")
    
    # If no coworking users exist, create one
    if not users:
        print("\nCreating a sample coworking user...")
        hashed_password = pwd_context.hash("password123")
        coworking_user = CoworkingUser(
            first_name="Test",
            last_name="Owner",
            email="test@coworking.com",
            password_hash=hashed_password,
            phone="+92-300-1234567"
        )
        db.add(coworking_user)
        db.commit()
        db.refresh(coworking_user)
        print(f"✅ Created coworking user: {coworking_user.first_name} {coworking_user.last_name} (ID: {coworking_user.id})")
        users = [coworking_user]
    
    # Associate existing spaces with the first coworking user
    if spaces and users:
        first_user = users[0]
        for space in spaces:
            if space.coworking_user_id is None:
                space.coworking_user_id = first_user.id
                print(f"✅ Associated space '{space.title}' with user '{first_user.first_name} {first_user.last_name}'")
        
        db.commit()
        print(f"\n✅ All spaces are now associated with coworking users!")
    
    # If no spaces exist, create a sample one
    if not spaces and users:
        print("\nCreating a sample coworking space...")
        first_user = users[0]
        
        # Sample amenities and packages
        amenities = json.dumps([
            "High-speed WiFi", "24/7 Access", "Coffee & Tea", "Printing Services",
            "Meeting Rooms", "Phone Booths", "Parking", "Reception Services"
        ])
        
        packages = json.dumps([
            {
                "name": "Hot Desk",
                "price": 15,
                "description": "Flexible workspace with shared amenities",
                "features": ["WiFi", "Coffee", "Printing"]
            },
            {
                "name": "Dedicated Desk",
                "price": 150,
                "description": "Your own desk in shared office space",
                "features": ["WiFi", "Coffee", "Storage", "24/7 Access"]
            },
            {
                "name": "Private Office",
                "price": 300,
                "description": "Private office space for teams",
                "features": ["WiFi", "Coffee", "Storage", "24/7 Access", "Meeting Room"]
            }
        ])
        
        sample_space = CoworkingSpaceListing(
            title="TechHub Coworking Space",
            description="Modern coworking space in the heart of the city with flexible workspace solutions for freelancers, startups, and remote teams.",
            address="123 Tech Street, Gulberg, Lahore, Pakistan",
            city="Lahore",
            state="Punjab",
            zip_code="54000",
            country="Pakistan",
            latitude=31.5204,
            longitude=74.3587,
            price_per_hour=15.0,
            price_per_day=120.0,
            price_per_week=525.0,
            price_per_month=1800.0,
            opening_hours="Mon-Fri: 8:00 AM - 8:00 PM, Sat-Sun: 9:00 AM - 6:00 PM",
            amenities=amenities,
            packages=packages,
            is_verified=True,
            coworking_user_id=first_user.id
        )
        
        db.add(sample_space)
        db.commit()
        db.refresh(sample_space)
        print(f"✅ Created sample coworking space: {sample_space.title} (ID: {sample_space.id})")
    
    print(f"\n🎉 Database is now ready! You can access coworking space details with any space ID.")
    print(f"📋 Login credentials: test@coworking.com / password123")

if __name__ == "__main__":
    main()
