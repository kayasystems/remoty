#!/usr/bin/env python3
"""
Create sample data for Coworking Module
Independent from employer module data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from shared.database import get_db, engine
from shared.models.coworking_user import CoworkingUser
from shared.models.coworkingspacelisting import CoworkingSpaceListing
from app.auth import hash_password
import json
from datetime import datetime

def create_coworking_sample_data():
    """Create sample data for coworking module"""
    
    # Get database session
    db = next(get_db())
    
    print("🏢 Creating Coworking Sample Data...")
    
    # Clean existing coworking data
    print("🧹 Cleaning existing coworking data...")
    db.query(CoworkingSpaceListing).delete()
    db.query(CoworkingUser).delete()
    db.commit()
    
    # Create sample coworking users
    print("👤 Creating coworking space owners...")
    
    coworking_users = [
        {
            "first_name": "Ahmed",
            "last_name": "Khan",
            "email": "owner@workspace-lahore.com",
            "phone": "+92-300-1111111",
            "password": "admin123"
        },
        {
            "first_name": "Fatima",
            "last_name": "Ali",
            "email": "owner@cowork-karachi.com", 
            "phone": "+92-300-2222222",
            "password": "admin123"
        },
        {
            "first_name": "Hassan",
            "last_name": "Shah",
            "email": "owner@hub-islamabad.com",
            "phone": "+92-300-3333333",
            "password": "admin123"
        }
    ]
    
    created_users = []
    for user_data in coworking_users:
        user = CoworkingUser(
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            email=user_data["email"],
            phone=user_data["phone"],
            password_hash=hash_password(user_data["password"])
        )
        db.add(user)
        db.flush()
        created_users.append(user)
        print(f"  ✅ Created user: {user.email} - {user.first_name} {user.last_name}")
    
    # Create sample coworking spaces for each user
    print("🏢 Creating coworking spaces...")
    
    space_templates = [
        {
            "title": "Premium Office Suite",
            "description": "Luxury coworking space with premium amenities and 24/7 access",
            "price_per_hour": 15.0,
            "price_per_day": 100.0,
            "price_per_week": 600.0,
            "price_per_month": 2000.0,
            "amenities": ["High-speed WiFi", "24/7 Access", "Premium Coffee", "Meeting Rooms", "Parking", "Reception"],
            "opening_hours": "24/7 Access Available"
        },
        {
            "title": "Startup Hub",
            "description": "Affordable coworking space perfect for startups and entrepreneurs",
            "price_per_hour": 8.0,
            "price_per_day": 50.0,
            "price_per_week": 300.0,
            "price_per_month": 1000.0,
            "amenities": ["High-speed WiFi", "Coffee & Tea", "Printing", "Meeting Rooms", "Event Space"],
            "opening_hours": "Mon-Fri: 8:00 AM - 10:00 PM, Sat-Sun: 9:00 AM - 6:00 PM"
        },
        {
            "title": "Creative Studio",
            "description": "Inspiring workspace for creative professionals and designers",
            "price_per_hour": 12.0,
            "price_per_day": 80.0,
            "price_per_week": 450.0,
            "price_per_month": 1500.0,
            "amenities": ["High-speed WiFi", "Design Software", "Printing", "Photo Studio", "Art Supplies"],
            "opening_hours": "Mon-Fri: 9:00 AM - 9:00 PM, Sat: 10:00 AM - 6:00 PM"
        }
    ]
    
    cities = ["Lahore", "Karachi", "Islamabad"]
    addresses = [
        "94-B Hali Road, Gulberg II, Lahore, Pakistan",
        "Plot 123, Block 7, Clifton, Karachi, Pakistan", 
        "Street 15, F-8 Markaz, Islamabad, Pakistan"
    ]
    
    for i, user in enumerate(created_users):
        for j, template in enumerate(space_templates):
            space = CoworkingSpaceListing(
                title=f"{template['title']} - {cities[i]}",
                description=template["description"],
                address=f"{addresses[i]} - Space {j+1}",
                city=cities[i],
                country="Pakistan",
                latitude=31.5204 + (i * 0.1),  # Slight variations
                longitude=74.3587 + (i * 0.1),
                price_per_hour=template["price_per_hour"],
                price_per_day=template["price_per_day"],
                price_per_week=template["price_per_week"],
                price_per_month=template["price_per_month"],
                amenities=json.dumps(template["amenities"]),
                opening_hours=template["opening_hours"],
                coworking_user_id=user.id,
                is_verified=True
            )
            db.add(space)
            print(f"  ✅ Created space: {space.title}")
    
    # Commit all changes
    db.commit()
    
    print("✅ Coworking sample data created successfully!")
    print(f"📊 Summary:")
    print(f"   - {len(created_users)} coworking space owners")
    print(f"   - {len(created_users) * len(space_templates)} coworking spaces")
    print(f"")
    print(f"🔑 Login Credentials:")
    for user_data in coworking_users:
        print(f"   - {user_data['email']} / {user_data['password']}")
    
    db.close()

if __name__ == "__main__":
    create_coworking_sample_data()
