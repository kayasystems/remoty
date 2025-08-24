#!/usr/bin/env python3
"""
Migration script to add is_24_7 column to existing coworkingspacelistings table
This preserves all existing data while adding the new column.
"""

import sqlite3
import os
import sys

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.database import DATABASE_URL

def add_is_24_7_column():
    """Add is_24_7 column to coworkingspacelistings table if it doesn't exist"""
    
    # Extract database path from DATABASE_URL
    if DATABASE_URL.startswith('sqlite:///'):
        db_path = DATABASE_URL.replace('sqlite:///', '')
    else:
        print("❌ This migration only works with SQLite databases")
        return False
    
    if not os.path.exists(db_path):
        print(f"❌ Database file not found: {db_path}")
        return False
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if is_24_7 column already exists
        cursor.execute("PRAGMA table_info(coworkingspacelistings)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'is_24_7' in columns:
            print("✅ is_24_7 column already exists in coworkingspacelistings table")
            conn.close()
            return True
        
        # Add the is_24_7 column
        print("🔄 Adding is_24_7 column to coworkingspacelistings table...")
        cursor.execute("ALTER TABLE coworkingspacelistings ADD COLUMN is_24_7 BOOLEAN DEFAULT 0")
        
        # Commit the changes
        conn.commit()
        conn.close()
        
        print("✅ Successfully added is_24_7 column to coworkingspacelistings table")
        print("📊 All existing data has been preserved")
        return True
        
    except Exception as e:
        print(f"❌ Error adding is_24_7 column: {e}")
        if 'conn' in locals():
            conn.close()
        return False

if __name__ == "__main__":
    print("🚀 Running migration to add is_24_7 column...")
    
    success = add_is_24_7_column()
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("✅ Your existing coworking spaces and packages are preserved")
        print("✅ Operating hours functionality will now work correctly")
    else:
        print("\n❌ Migration failed!")
        print("⚠️  Please check the error messages above")
