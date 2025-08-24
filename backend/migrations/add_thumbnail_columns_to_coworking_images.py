"""
Database migration script to add thumbnail columns to coworking_images table
Run this script to add thumbnail support to existing coworking images
"""
import sqlite3
import os
from pathlib import Path

def migrate_database():
    """Add thumbnail columns to coworking_images table"""
    
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
        
        # Check if table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='coworking_images'
        """)
        
        if not cursor.fetchone():
            print("❌ coworking_images table does not exist yet.")
            conn.close()
            return False
        
        # Check if thumbnail columns already exist
        cursor.execute("PRAGMA table_info(coworking_images)")
        columns = [column[1] for column in cursor.fetchall()]
        
        thumbnail_columns = ['thumbnail_url', 'thumbnail_small_url', 'thumbnail_medium_url']
        existing_thumbnail_columns = [col for col in thumbnail_columns if col in columns]
        
        if existing_thumbnail_columns:
            print(f"✅ Thumbnail columns already exist: {existing_thumbnail_columns}")
            conn.close()
            return True
        
        # Add thumbnail columns
        print("🔄 Adding thumbnail columns to coworking_images table...")
        
        cursor.execute("""
            ALTER TABLE coworking_images 
            ADD COLUMN thumbnail_url TEXT
        """)
        
        cursor.execute("""
            ALTER TABLE coworking_images 
            ADD COLUMN thumbnail_small_url TEXT
        """)
        
        cursor.execute("""
            ALTER TABLE coworking_images 
            ADD COLUMN thumbnail_medium_url TEXT
        """)
        
        # Commit changes
        conn.commit()
        print("✅ Successfully added thumbnail columns!")
        
        # Verify the changes
        cursor.execute("PRAGMA table_info(coworking_images)")
        columns = cursor.fetchall()
        print("\n📋 Updated table structure:")
        for column in columns:
            print(f"   - {column[1]} ({column[2]})")
        
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting coworking_images table migration...")
    success = migrate_database()
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("📝 Next steps:")
        print("   1. Restart your coworking server")
        print("   2. Upload new images to test thumbnail generation")
        print("   3. Existing images will need to be re-uploaded to generate thumbnails")
    else:
        print("\n❌ Migration failed. Please check the errors above.")
