#!/usr/bin/env python3
"""
Populate the amenities table with comprehensive coworking space amenities
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.database import get_db
from shared.models.amenity import Amenity
from sqlalchemy.orm import Session

def populate_amenities():
    """Add comprehensive coworking space amenities to the database"""
    
    # Comprehensive list of coworking space amenities organized by category
    amenities_data = [
        # Internet & Technology
        {"name": "High-Speed WiFi", "description": "Fast and reliable internet connection", "icon": "wifi", "category": "Internet & Technology"},
        {"name": "Free WiFi", "description": "Complimentary wireless internet access", "icon": "wifi", "category": "Internet & Technology"},
        {"name": "Ethernet Connection", "description": "Wired internet connection available", "icon": "cable", "category": "Internet & Technology"},
        {"name": "Power Outlets", "description": "Abundant power outlets for devices", "icon": "power", "category": "Internet & Technology"},
        {"name": "USB Charging Stations", "description": "USB ports for device charging", "icon": "usb", "category": "Internet & Technology"},
        {"name": "Wireless Charging", "description": "Wireless charging pads available", "icon": "battery_charging", "category": "Internet & Technology"},
        {"name": "Tech Support", "description": "On-site technical assistance", "icon": "support", "category": "Internet & Technology"},
        
        # Workspaces
        {"name": "Hot Desks", "description": "Flexible shared workspace", "icon": "desk", "category": "Workspaces"},
        {"name": "Dedicated Desks", "description": "Reserved personal workspace", "icon": "person_desk", "category": "Workspaces"},
        {"name": "Private Offices", "description": "Individual private office space", "icon": "office", "category": "Workspaces"},
        {"name": "Standing Desks", "description": "Height-adjustable standing workstations", "icon": "height", "category": "Workspaces"},
        {"name": "Ergonomic Chairs", "description": "Comfortable ergonomic seating", "icon": "chair", "category": "Workspaces"},
        {"name": "Quiet Zones", "description": "Designated quiet work areas", "icon": "volume_off", "category": "Workspaces"},
        {"name": "Phone Booths", "description": "Private phone call spaces", "icon": "phone", "category": "Workspaces"},
        
        # Meeting & Conference
        {"name": "Meeting Rooms", "description": "Bookable meeting spaces", "icon": "meeting_room", "category": "Meeting & Conference"},
        {"name": "Conference Rooms", "description": "Large conference facilities", "icon": "groups", "category": "Meeting & Conference"},
        {"name": "Video Conferencing", "description": "Video call equipment and setup", "icon": "videocam", "category": "Meeting & Conference"},
        {"name": "Projectors", "description": "Presentation projectors available", "icon": "tv", "category": "Meeting & Conference"},
        {"name": "Whiteboards", "description": "Writing and brainstorming boards", "icon": "draw", "category": "Meeting & Conference"},
        {"name": "Flip Charts", "description": "Large paper charts for presentations", "icon": "article", "category": "Meeting & Conference"},
        {"name": "Audio Equipment", "description": "Sound systems and microphones", "icon": "mic", "category": "Meeting & Conference"},
        
        # Food & Beverage
        {"name": "Coffee", "description": "Complimentary coffee service", "icon": "coffee", "category": "Food & Beverage"},
        {"name": "Tea", "description": "Variety of teas available", "icon": "local_cafe", "category": "Food & Beverage"},
        {"name": "Kitchen", "description": "Fully equipped kitchen facilities", "icon": "kitchen", "category": "Food & Beverage"},
        {"name": "Microwave", "description": "Microwave for food heating", "icon": "microwave", "category": "Food & Beverage"},
        {"name": "Refrigerator", "description": "Shared refrigerator space", "icon": "kitchen", "category": "Food & Beverage"},
        {"name": "Water Cooler", "description": "Fresh drinking water dispenser", "icon": "water_drop", "category": "Food & Beverage"},
        {"name": "Snacks", "description": "Complimentary snacks available", "icon": "fastfood", "category": "Food & Beverage"},
        {"name": "Vending Machines", "description": "Food and drink vending machines", "icon": "storefront", "category": "Food & Beverage"},
        
        # Printing & Office
        {"name": "Printing", "description": "Printing services available", "icon": "print", "category": "Printing & Office"},
        {"name": "Scanning", "description": "Document scanning facilities", "icon": "scanner", "category": "Printing & Office"},
        {"name": "Copying", "description": "Photocopying services", "icon": "content_copy", "category": "Printing & Office"},
        {"name": "Fax", "description": "Fax machine access", "icon": "fax", "category": "Printing & Office"},
        {"name": "Shredder", "description": "Document shredding service", "icon": "delete", "category": "Printing & Office"},
        {"name": "Office Supplies", "description": "Basic office supplies provided", "icon": "inventory", "category": "Printing & Office"},
        {"name": "Stationery", "description": "Pens, paper, and writing materials", "icon": "edit", "category": "Printing & Office"},
        
        # Security & Access
        {"name": "24/7 Access", "description": "Round-the-clock building access", "icon": "schedule", "category": "Security & Access"},
        {"name": "Key Card Access", "description": "Secure key card entry system", "icon": "key", "category": "Security & Access"},
        {"name": "Security System", "description": "CCTV and security monitoring", "icon": "security", "category": "Security & Access"},
        {"name": "Lockers", "description": "Personal storage lockers", "icon": "lock", "category": "Security & Access"},
        {"name": "Reception", "description": "Front desk and reception services", "icon": "person", "category": "Security & Access"},
        {"name": "Mail Handling", "description": "Mail and package receiving", "icon": "mail", "category": "Security & Access"},
        
        # Comfort & Wellness
        {"name": "Air Conditioning", "description": "Climate controlled environment", "icon": "ac_unit", "category": "Comfort & Wellness"},
        {"name": "Heating", "description": "Heating system for comfort", "icon": "thermostat", "category": "Comfort & Wellness"},
        {"name": "Natural Light", "description": "Abundant natural lighting", "icon": "wb_sunny", "category": "Comfort & Wellness"},
        {"name": "Plants", "description": "Indoor plants and greenery", "icon": "local_florist", "category": "Comfort & Wellness"},
        {"name": "Wellness Room", "description": "Quiet space for meditation/rest", "icon": "self_improvement", "category": "Comfort & Wellness"},
        {"name": "Massage Chair", "description": "Relaxation massage chairs", "icon": "chair", "category": "Comfort & Wellness"},
        
        # Transportation & Parking
        {"name": "Parking", "description": "On-site parking available", "icon": "local_parking", "category": "Transportation & Parking"},
        {"name": "Bike Storage", "description": "Secure bicycle storage", "icon": "pedal_bike", "category": "Transportation & Parking"},
        {"name": "EV Charging", "description": "Electric vehicle charging stations", "icon": "ev_station", "category": "Transportation & Parking"},
        {"name": "Public Transport", "description": "Near public transportation", "icon": "train", "category": "Transportation & Parking"},
        
        # Social & Networking
        {"name": "Community Events", "description": "Regular networking events", "icon": "event", "category": "Social & Networking"},
        {"name": "Lounge Area", "description": "Comfortable social lounge", "icon": "weekend", "category": "Social & Networking"},
        {"name": "Game Room", "description": "Recreation and game area", "icon": "sports_esports", "category": "Social & Networking"},
        {"name": "Library", "description": "Quiet reading and study area", "icon": "library_books", "category": "Social & Networking"},
        {"name": "Networking Opportunities", "description": "Professional networking events", "icon": "group", "category": "Social & Networking"},
        
        # Business Services
        {"name": "Business Address", "description": "Professional business address", "icon": "business", "category": "Business Services"},
        {"name": "Virtual Office", "description": "Virtual office services", "icon": "cloud", "category": "Business Services"},
        {"name": "Call Answering", "description": "Professional call answering service", "icon": "call", "category": "Business Services"},
        {"name": "Bookkeeping Support", "description": "Basic bookkeeping assistance", "icon": "calculate", "category": "Business Services"},
        {"name": "Legal Support", "description": "Basic legal consultation", "icon": "gavel", "category": "Business Services"},
        
        # Specialized
        {"name": "Podcast Studio", "description": "Professional podcast recording space", "icon": "mic", "category": "Specialized"},
        {"name": "Photography Studio", "description": "Professional photo studio", "icon": "camera_alt", "category": "Specialized"},
        {"name": "3D Printing", "description": "3D printing facilities", "icon": "precision_manufacturing", "category": "Specialized"},
        {"name": "Maker Space", "description": "Workshop and maker facilities", "icon": "build", "category": "Specialized"},
        {"name": "Gym Access", "description": "On-site or partner gym access", "icon": "fitness_center", "category": "Specialized"},
        {"name": "Childcare", "description": "Childcare facilities available", "icon": "child_care", "category": "Specialized"},
    ]
    
    try:
        # Get database session
        db = next(get_db())
        
        print(f"🚀 Adding {len(amenities_data)} amenities to the database...")
        
        # Add each amenity
        added_count = 0
        for amenity_data in amenities_data:
            # Check if amenity already exists
            existing = db.query(Amenity).filter(Amenity.name == amenity_data["name"]).first()
            
            if not existing:
                amenity = Amenity(
                    name=amenity_data["name"],
                    description=amenity_data["description"],
                    icon=amenity_data["icon"],
                    category=amenity_data["category"],
                    is_active=True
                )
                db.add(amenity)
                added_count += 1
                print(f"   ✅ Added: {amenity_data['name']} ({amenity_data['category']})")
            else:
                print(f"   ⏭️  Skipped: {amenity_data['name']} (already exists)")
        
        # Commit all changes
        db.commit()
        
        print(f"\n🎉 Successfully added {added_count} new amenities!")
        print(f"📊 Total amenities in database: {db.query(Amenity).count()}")
        
        # Show categories summary
        categories = db.query(Amenity.category).distinct().all()
        print(f"\n📋 Available categories ({len(categories)}):")
        for category in sorted(categories):
            count = db.query(Amenity).filter(Amenity.category == category[0]).count()
            print(f"   📂 {category[0]}: {count} amenities")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Error adding amenities: {e}")
        if 'db' in locals():
            db.rollback()
            db.close()
        return False

if __name__ == "__main__":
    print("🏢 Populating coworking space amenities...")
    
    success = populate_amenities()
    
    if success:
        print("\n🎉 Amenities population completed successfully!")
        print("✅ Your coworking spaces can now use these amenities")
        print("✅ Package editing will have full amenities selection")
    else:
        print("\n❌ Failed to populate amenities!")
