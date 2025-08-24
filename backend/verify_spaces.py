#!/usr/bin/env python3
"""
Mark coworking spaces as verified in the database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.database import get_db
from shared.models.coworkingspacelisting import CoworkingSpaceListing
from sqlalchemy.orm import Session

def verify_coworking_spaces():
    """Mark all coworking spaces as verified"""
    
    try:
        # Get database session
        db = next(get_db())
        
        # Get all coworking spaces
        spaces = db.query(CoworkingSpaceListing).all()
        
        if not spaces:
            print("❌ No coworking spaces found in the database")
            db.close()
            return False
        
        print(f"🏢 Found {len(spaces)} coworking spaces:")
        
        # Mark all spaces as verified
        verified_count = 0
        for space in spaces:
            print(f"   📍 {space.title} (ID: {space.id}) - Current status: {'Verified' if space.is_verified else 'Not Verified'}")
            
            if not space.is_verified:
                space.is_verified = True
                verified_count += 1
                print(f"      ✅ Marked as verified")
            else:
                print(f"      ⏭️  Already verified")
        
        # Commit changes
        if verified_count > 0:
            db.commit()
            print(f"\n🎉 Successfully verified {verified_count} coworking spaces!")
        else:
            print(f"\n✅ All {len(spaces)} coworking spaces were already verified!")
        
        # Show final status
        print(f"\n📊 Final status:")
        verified_spaces = db.query(CoworkingSpaceListing).filter(CoworkingSpaceListing.is_verified == True).all()
        for space in verified_spaces:
            print(f"   ✅ {space.title} - VERIFIED")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Error verifying spaces: {e}")
        if 'db' in locals():
            db.rollback()
            db.close()
        return False

if __name__ == "__main__":
    print("🚀 Marking coworking spaces as verified...")
    
    success = verify_coworking_spaces()
    
    if success:
        print("\n🎉 Verification completed successfully!")
        print("✅ Verified coworking spaces will now be visible to employers")
        print("✅ Spaces can now receive bookings from the employer platform")
    else:
        print("\n❌ Failed to verify spaces!")
