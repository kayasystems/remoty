#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import sessionmaker
from shared.database import engine, Base
from shared.models.amenity import Amenity, SpaceAmenity, PackageAmenity
from shared.models.coworkingspacelisting import CoworkingSpaceListing
from shared.models.coworking_user import CoworkingUser
import json

# Create all tables
Base.metadata.create_all(bind=engine)

# Create a session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = SessionLocal()

def create_amenities_data():
    """Create comprehensive amenities data"""
    
    # Define comprehensive amenities with categories and icons
    amenities_data = [
        # Connectivity & Technology
        {"name": "High-Speed WiFi", "description": "Reliable high-speed internet connection", "icon": "wifi", "category": "connectivity"},
        {"name": "Ethernet Connection", "description": "Wired internet connection available", "icon": "ethernet", "category": "connectivity"},
        {"name": "Video Conferencing Setup", "description": "Professional video conferencing equipment", "icon": "video", "category": "connectivity"},
        {"name": "Projector/TV", "description": "Large screen display for presentations", "icon": "tv", "category": "connectivity"},
        {"name": "Audio/Visual Equipment", "description": "Professional AV equipment available", "icon": "speaker", "category": "connectivity"},
        
        # Workspaces & Furniture
        {"name": "Ergonomic Furniture", "description": "Comfortable ergonomic chairs and desks", "icon": "chair", "category": "workspace"},
        {"name": "Standing Desks", "description": "Height-adjustable standing desks", "icon": "desk", "category": "workspace"},
        {"name": "Private Phone Booths", "description": "Soundproof phone booths for calls", "icon": "phone", "category": "workspace"},
        {"name": "Meeting Rooms", "description": "Private meeting rooms available", "icon": "meeting", "category": "workspace"},
        {"name": "Conference Rooms", "description": "Large conference rooms for teams", "icon": "conference", "category": "workspace"},
        {"name": "Quiet Zones", "description": "Designated quiet work areas", "icon": "quiet", "category": "workspace"},
        {"name": "Collaboration Areas", "description": "Open spaces for team collaboration", "icon": "collaborate", "category": "workspace"},
        
        # Office Services
        {"name": "Printing Services", "description": "High-quality printing and copying", "icon": "printer", "category": "services"},
        {"name": "Scanner/Copier", "description": "Document scanning and copying services", "icon": "scanner", "category": "services"},
        {"name": "Mail Handling", "description": "Mail and package handling services", "icon": "mail", "category": "services"},
        {"name": "Reception Services", "description": "Professional reception and concierge", "icon": "reception", "category": "services"},
        {"name": "IT Support", "description": "On-site technical support", "icon": "support", "category": "services"},
        {"name": "Business Mentoring", "description": "Access to business mentors and advisors", "icon": "mentor", "category": "services"},
        
        # Food & Beverage
        {"name": "Premium Coffee", "description": "High-quality coffee and espresso", "icon": "coffee", "category": "food"},
        {"name": "Tea Station", "description": "Variety of teas and hot beverages", "icon": "tea", "category": "food"},
        {"name": "Kitchen Facilities", "description": "Full kitchen with appliances", "icon": "kitchen", "category": "food"},
        {"name": "Microwave", "description": "Microwave for heating meals", "icon": "microwave", "category": "food"},
        {"name": "Refrigerator", "description": "Shared refrigerator space", "icon": "fridge", "category": "food"},
        {"name": "Snack Bar", "description": "Snacks and light refreshments", "icon": "snack", "category": "food"},
        {"name": "Water Cooler", "description": "Fresh drinking water", "icon": "water", "category": "food"},
        
        # Security & Access
        {"name": "24/7 Access", "description": "Round-the-clock building access", "icon": "clock", "category": "security"},
        {"name": "Security System", "description": "CCTV and security monitoring", "icon": "security", "category": "security"},
        {"name": "Key Card Access", "description": "Secure key card entry system", "icon": "keycard", "category": "security"},
        {"name": "Lockers", "description": "Personal storage lockers", "icon": "locker", "category": "security"},
        {"name": "Safe Storage", "description": "Secure storage for valuables", "icon": "safe", "category": "security"},
        
        # Comfort & Environment
        {"name": "Air Conditioning", "description": "Climate-controlled environment", "icon": "ac", "category": "comfort"},
        {"name": "Heating", "description": "Comfortable heating system", "icon": "heat", "category": "comfort"},
        {"name": "Natural Light", "description": "Abundant natural lighting", "icon": "sun", "category": "comfort"},
        {"name": "Plants & Greenery", "description": "Indoor plants and green spaces", "icon": "plant", "category": "comfort"},
        {"name": "Comfortable Seating", "description": "Lounge areas with comfortable seating", "icon": "sofa", "category": "comfort"},
        
        # Transportation & Parking
        {"name": "Parking", "description": "On-site parking available", "icon": "car", "category": "transport"},
        {"name": "Bike Storage", "description": "Secure bicycle storage", "icon": "bike", "category": "transport"},
        {"name": "Electric Vehicle Charging", "description": "EV charging stations", "icon": "ev", "category": "transport"},
        {"name": "Public Transport Access", "description": "Near public transportation", "icon": "bus", "category": "transport"},
        
        # Wellness & Recreation
        {"name": "Gym Access", "description": "On-site or partner gym facilities", "icon": "gym", "category": "wellness"},
        {"name": "Shower Facilities", "description": "Clean shower and changing rooms", "icon": "shower", "category": "wellness"},
        {"name": "Meditation Room", "description": "Quiet space for meditation", "icon": "meditation", "category": "wellness"},
        {"name": "Game Room", "description": "Recreation area with games", "icon": "game", "category": "wellness"},
        {"name": "Outdoor Terrace", "description": "Outdoor workspace and relaxation area", "icon": "terrace", "category": "wellness"},
        {"name": "Library/Reading Area", "description": "Quiet library space", "icon": "book", "category": "wellness"},
        
        # Events & Community
        {"name": "Event Space", "description": "Space for hosting events", "icon": "event", "category": "community"},
        {"name": "Networking Events", "description": "Regular networking opportunities", "icon": "network", "category": "community"},
        {"name": "Workshop Rooms", "description": "Rooms for workshops and training", "icon": "workshop", "category": "community"},
        {"name": "Community Manager", "description": "Dedicated community management", "icon": "manager", "category": "community"},
        
        # Special Services
        {"name": "Cleaning Services", "description": "Regular professional cleaning", "icon": "clean", "category": "services"},
        {"name": "Pet Friendly", "description": "Pets welcome in the workspace", "icon": "pet", "category": "special"},
        {"name": "Childcare Services", "description": "On-site or partner childcare", "icon": "child", "category": "special"},
        {"name": "Whiteboard/Flipchart", "description": "Writing boards for brainstorming", "icon": "whiteboard", "category": "workspace"},
        {"name": "Podcast Studio", "description": "Professional podcast recording setup", "icon": "podcast", "category": "special"},
        {"name": "Photography Studio", "description": "Professional photography space", "icon": "camera", "category": "special"}
    ]
    
    print("Creating amenities...")
    created_amenities = []
    
    for amenity_data in amenities_data:
        # Check if amenity already exists
        existing_amenity = session.query(Amenity).filter(Amenity.name == amenity_data["name"]).first()
        if not existing_amenity:
            amenity = Amenity(
                name=amenity_data["name"],
                description=amenity_data["description"],
                icon=amenity_data["icon"],
                category=amenity_data["category"],
                is_active=True
            )
            session.add(amenity)
            created_amenities.append(amenity_data["name"])
        else:
            print(f"Amenity '{amenity_data['name']}' already exists")
    
    session.commit()
    print(f"Created {len(created_amenities)} new amenities")
    
    return created_amenities

def assign_amenities_to_spaces():
    """Assign amenities to existing coworking spaces and packages"""
    
    # Get all coworking spaces
    spaces = session.query(CoworkingSpaceListing).all()
    amenities = session.query(Amenity).all()
    
    print(f"Found {len(spaces)} coworking spaces and {len(amenities)} amenities")
    
    for space in spaces:
        print(f"\nProcessing space: {space.title}")
        
        # Parse existing amenities from JSON if they exist
        existing_amenities = []
        if space.amenities:
            try:
                existing_amenities = json.loads(space.amenities)
            except:
                existing_amenities = []
        
        # Assign some common amenities to each space
        common_amenities = [
            "High-Speed WiFi", "Air Conditioning", "Natural Light", 
            "Premium Coffee", "Printing Services", "Security System",
            "Reception Services", "Comfortable Seating", "Cleaning Services"
        ]
        
        # Add category-specific amenities based on space type
        if "premium" in space.title.lower() or "executive" in space.title.lower():
            common_amenities.extend([
                "Meeting Rooms", "Conference Rooms", "Business Mentoring",
                "IT Support", "Mail Handling", "Concierge Services"
            ])
        
        if "tech" in space.title.lower() or "startup" in space.title.lower():
            common_amenities.extend([
                "Video Conferencing Setup", "Projector/TV", "Private Phone Booths",
                "Collaboration Areas", "Event Space", "Networking Events"
            ])
        
        # Assign amenities to space
        for amenity_name in common_amenities:
            amenity = session.query(Amenity).filter(Amenity.name == amenity_name).first()
            if amenity and space.coworking_user_id:
                # Check if already assigned
                existing_assignment = session.query(SpaceAmenity).filter(
                    SpaceAmenity.space_id == space.id,
                    SpaceAmenity.amenity_id == amenity.id
                ).first()
                
                if not existing_assignment:
                    space_amenity = SpaceAmenity(
                        space_id=space.id,
                        amenity_id=amenity.id,
                        coworking_user_id=space.coworking_user_id,
                        is_available=True
                    )
                    session.add(space_amenity)
        
        # Assign amenities to packages if they exist
        if space.packages:
            try:
                packages = json.loads(space.packages)
                for package in packages:
                    package_id = str(package.get('id', ''))
                    if package_id:
                        # Assign package-specific amenities
                        package_amenities = common_amenities[:6]  # First 6 common amenities
                        
                        if package.get('name') == 'Private Office':
                            package_amenities.extend(['Meeting Rooms', 'Private Phone Booths', 'Lockers'])
                        elif package.get('name') == 'Dedicated Desk':
                            package_amenities.extend(['Lockers', 'Personal Storage'])
                        
                        for amenity_name in package_amenities:
                            amenity = session.query(Amenity).filter(Amenity.name == amenity_name).first()
                            if amenity and space.coworking_user_id:
                                # Check if already assigned
                                existing_assignment = session.query(PackageAmenity).filter(
                                    PackageAmenity.package_id == package_id,
                                    PackageAmenity.space_id == space.id,
                                    PackageAmenity.amenity_id == amenity.id
                                ).first()
                                
                                if not existing_assignment:
                                    package_amenity = PackageAmenity(
                                        package_id=package_id,
                                        space_id=space.id,
                                        amenity_id=amenity.id,
                                        coworking_user_id=space.coworking_user_id,
                                        is_included=True
                                    )
                                    session.add(package_amenity)
            except Exception as e:
                print(f"Error processing packages for space {space.id}: {e}")
    
    session.commit()
    print("Amenities assigned to spaces and packages")

def display_all_amenities():
    """Display all amenities in the database"""
    amenities = session.query(Amenity).order_by(Amenity.category, Amenity.name).all()
    
    print(f"\n{'='*80}")
    print(f"ALL AMENITIES IN DATABASE ({len(amenities)} total)")
    print(f"{'='*80}")
    
    current_category = None
    for amenity in amenities:
        if current_category != amenity.category:
            current_category = amenity.category
            print(f"\n🏷️  {current_category.upper()}")
            print("-" * 40)
        
        print(f"  {amenity.id:2d}. {amenity.name}")
        print(f"      📝 {amenity.description}")
        print(f"      🎨 Icon: {amenity.icon}")
        print()
    
    # Show space assignments
    print(f"\n{'='*80}")
    print("SPACE AMENITY ASSIGNMENTS")
    print(f"{'='*80}")
    
    spaces = session.query(CoworkingSpaceListing).all()
    for space in spaces:
        space_amenities = session.query(SpaceAmenity).filter(
            SpaceAmenity.space_id == space.id
        ).join(Amenity).all()
        
        print(f"\n🏢 {space.title} (ID: {space.id})")
        print(f"   📍 {space.city}, {space.country}")
        print(f"   🎯 Amenities ({len(space_amenities)}):")
        
        for sa in space_amenities:
            status = "✅" if sa.is_available else "❌"
            print(f"      {status} {sa.amenity.name}")
    
    # Show package assignments
    print(f"\n{'='*80}")
    print("PACKAGE AMENITY ASSIGNMENTS")
    print(f"{'='*80}")
    
    package_amenities = session.query(PackageAmenity).join(Amenity).all()
    package_groups = {}
    
    for pa in package_amenities:
        key = f"{pa.space_id}-{pa.package_id}"
        if key not in package_groups:
            package_groups[key] = {
                'space_id': pa.space_id,
                'package_id': pa.package_id,
                'amenities': []
            }
        package_groups[key]['amenities'].append(pa)
    
    for key, group in package_groups.items():
        space = session.query(CoworkingSpaceListing).filter(
            CoworkingSpaceListing.id == group['space_id']
        ).first()
        
        print(f"\n📦 Package ID: {group['package_id']} (Space: {space.title if space else 'Unknown'})")
        print(f"   🎯 Package Amenities ({len(group['amenities'])}):")
        
        for pa in group['amenities']:
            status = "✅" if pa.is_included else "❌"
            cost = f" (+${pa.additional_cost/100:.2f})" if pa.additional_cost > 0 else ""
            print(f"      {status} {pa.amenity.name}{cost}")

if __name__ == "__main__":
    try:
        print("Starting amenities database setup...")
        
        # Create amenities
        created_amenities = create_amenities_data()
        
        # Assign amenities to spaces and packages
        assign_amenities_to_spaces()
        
        # Display all amenities
        display_all_amenities()
        
        print(f"\n✅ Amenities database setup completed successfully!")
        print(f"📊 Summary:")
        print(f"   - Created {len(created_amenities)} new amenities")
        print(f"   - Assigned amenities to existing spaces and packages")
        print(f"   - Database tables: amenities, space_amenities, package_amenities")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        session.rollback()
    finally:
        session.close()
