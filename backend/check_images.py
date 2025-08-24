#!/usr/bin/env python3
from shared.database import SessionLocal
from shared.models.coworking_images import CoworkingImage
from shared.models.coworkingspacelisting import CoworkingSpaceListing

def check_coworking_images():
    db = SessionLocal()
    
    try:
        # Get all coworking spaces
        spaces = db.query(CoworkingSpaceListing).all()
        print(f"Found {len(spaces)} coworking spaces:")
        
        for space in spaces[:3]:  # Check first 3 spaces
            print(f"\n🏢 Space: {space.title} (ID: {space.id})")
            print(f"   Address: {space.address}")
            
            # Check images for this space
            images = db.query(CoworkingImage).filter(
                CoworkingImage.space_id == space.id
            ).all()
            
            print(f"   📸 Images: {len(images)}")
            
            if images:
                for img in images:
                    print(f"      - {img.image_name} (URL: {img.image_url})")
                    print(f"        Package ID: {img.package_id}, Primary: {img.is_primary}")
            else:
                print("      ❌ No images found")
                
        # Check total images in database
        total_images = db.query(CoworkingImage).count()
        print(f"\n📊 Total images in database: {total_images}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_coworking_images()
