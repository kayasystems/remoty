"""
Script to generate thumbnails for existing coworking images
Run this after the database migration to create thumbnails for existing images
"""
import os
import sys
import sqlite3
from pathlib import Path

# Add the parent directory to the path to import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from coworking_module.utils.thumbnail_generator import ThumbnailGenerator
except ImportError as e:
    print(f"❌ Error importing ThumbnailGenerator: {e}")
    print("Make sure you're running this from the backend directory")
    sys.exit(1)

def generate_thumbnails_for_existing_images():
    """Generate thumbnails for all existing coworking images"""
    
    # Find the database file
    db_path = None
    possible_paths = [
        "secondhire.db",
        "second_hire.db",
        "coworking.db",
        "database.db", 
        "app.db"
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            db_path = path
            break
    
    if not db_path:
        print("❌ Database file not found. Please specify the correct path.")
        return False
    
    print(f"📁 Using database: {db_path}")
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all existing images
        cursor.execute("""
            SELECT id, image_url, image_name 
            FROM coworking_images 
            WHERE thumbnail_url IS NULL OR thumbnail_url = ''
        """)
        
        images = cursor.fetchall()
        
        if not images:
            print("✅ No images need thumbnail generation!")
            conn.close()
            return True
        
        print(f"🔄 Found {len(images)} images that need thumbnails...")
        
        # Initialize thumbnail generator
        thumbnail_generator = ThumbnailGenerator()
        
        success_count = 0
        error_count = 0
        
        for image_id, image_url, image_name in images:
            try:
                print(f"\n📸 Processing image {image_id}: {image_name}")
                
                # Convert URL to file path
                if image_url.startswith('/'):
                    file_path = image_url[1:]  # Remove leading slash
                else:
                    file_path = image_url
                
                if not os.path.exists(file_path):
                    print(f"⚠️ Original image file not found: {file_path}")
                    error_count += 1
                    continue
                
                # Generate thumbnails
                filename = os.path.basename(image_url)
                base_filename = os.path.splitext(filename)[0]
                
                thumbnail_urls = thumbnail_generator.generate_thumbnails(file_path, base_filename)
                
                # Update database with thumbnail URLs
                cursor.execute("""
                    UPDATE coworking_images 
                    SET thumbnail_url = ?, 
                        thumbnail_small_url = ?, 
                        thumbnail_medium_url = ?
                    WHERE id = ?
                """, (
                    thumbnail_urls.get('large'),
                    thumbnail_urls.get('small'),
                    thumbnail_urls.get('medium'),
                    image_id
                ))
                
                print(f"✅ Generated thumbnails for {image_name}")
                success_count += 1
                
            except Exception as e:
                print(f"❌ Error processing image {image_id}: {str(e)}")
                error_count += 1
                continue
        
        # Commit all changes
        conn.commit()
        conn.close()
        
        print(f"\n📊 Summary:")
        print(f"   ✅ Successfully processed: {success_count} images")
        print(f"   ❌ Errors: {error_count} images")
        
        return error_count == 0
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting thumbnail generation for existing images...")
    success = generate_thumbnails_for_existing_images()
    
    if success:
        print("\n✅ Thumbnail generation completed successfully!")
    else:
        print("\n⚠️ Thumbnail generation completed with some errors.")
    
    print("\n📝 Next steps:")
    print("   1. Check the generated thumbnails in uploads/coworking_images/thumbnails/")
    print("   2. Update your frontend to use thumbnail URLs instead of full images")
    print("   3. Test the image loading performance improvement")
