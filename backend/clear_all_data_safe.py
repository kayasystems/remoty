#!/usr/bin/env python3
"""
Clear all data from all database tables safely
"""

import sys
import os
import sqlite3
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.database import DATABASE_URL

def clear_all_data_safe():
    """Clear all data from all tables safely"""
    
    # Extract database path from DATABASE_URL
    if DATABASE_URL.startswith('sqlite:///'):
        db_path = DATABASE_URL.replace('sqlite:///', '')
    else:
        print("❌ This script only works with SQLite databases")
        return False
    
    if not os.path.exists(db_path):
        print(f"❌ Database file not found: {db_path}")
        return False
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        tables = [row[0] for row in cursor.fetchall()]
        
        print(f"🗑️  Clearing {len(tables)} tables...")
        
        # Disable foreign key constraints temporarily
        cursor.execute("PRAGMA foreign_keys = OFF")
        
        # Clear all tables
        for table in tables:
            print(f"   🧹 Clearing table: {table}")
            cursor.execute(f"DELETE FROM {table}")
        
        # Reset auto-increment counters (only if sqlite_sequence exists)
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'")
        if cursor.fetchone():
            cursor.execute("DELETE FROM sqlite_sequence")
        
        # Re-enable foreign key constraints
        cursor.execute("PRAGMA foreign_keys = ON")
        
        # Commit all changes
        conn.commit()
        conn.close()
        
        print("✅ Successfully cleared all data from all tables")
        return True
        
    except Exception as e:
        print(f"❌ Error clearing data: {e}")
        if 'conn' in locals():
            conn.close()
        return False

if __name__ == "__main__":
    print("🚀 Clearing all data from database tables...")
    
    success = clear_all_data_safe()
    
    if success:
        print("\n🎉 All data cleared successfully!")
        print("✅ Database is now completely empty")
        print("✅ Table structure preserved with is_24_7 field")
        print("\n🔐 Ready for new accounts:")
        print("   👤 Register coworking admin accounts")
        print("   🏢 Create coworking spaces")
        print("   📦 Add packages with working operating hours")
    else:
        print("\n❌ Failed to clear data!")
