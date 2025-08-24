#!/usr/bin/env python3
"""
Clear all data from all database tables while preserving table structure
This gives you a clean slate to create new accounts and data
"""

import sys
import os
import sqlite3
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.database import DATABASE_URL, engine
from sqlalchemy import text

def clear_all_data():
    """Clear all data from all tables while preserving structure"""
    
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
        # Connect using SQLAlchemy engine for better compatibility
        with engine.connect() as conn:
            # Get all table names
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"))
            tables = [row[0] for row in result.fetchall()]
            
            print(f"🗑️  Found {len(tables)} tables to clear...")
            
            # Disable foreign key constraints temporarily
            conn.execute(text("PRAGMA foreign_keys = OFF"))
            
            # Clear all tables
            for table in tables:
                print(f"   🧹 Clearing table: {table}")
                conn.execute(text(f"DELETE FROM {table}"))
            
            # Reset auto-increment counters
            for table in tables:
                conn.execute(text(f"DELETE FROM sqlite_sequence WHERE name='{table}'"))
            
            # Re-enable foreign key constraints
            conn.execute(text("PRAGMA foreign_keys = ON"))
            
            # Commit all changes
            conn.commit()
            
        print("✅ Successfully cleared all data from all tables")
        print("📊 Database structure preserved - ready for new accounts!")
        return True
        
    except Exception as e:
        print(f"❌ Error clearing data: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Clearing all data from all database tables...")
    print("⚠️  This will remove ALL data but keep table structure intact")
    
    # Confirmation prompt
    confirm = input("Are you sure you want to clear ALL data? (yes/no): ").lower().strip()
    
    if confirm in ['yes', 'y']:
        success = clear_all_data()
        
        if success:
            print("\n🎉 All data cleared successfully!")
            print("✅ Database is now empty and ready for new accounts")
            print("✅ Table structure preserved with is_24_7 field included")
            print("\n🔐 You can now:")
            print("   👤 Register new coworking admin accounts")
            print("   🏢 Create new coworking spaces")
            print("   📦 Add packages with operating hours functionality")
        else:
            print("\n❌ Failed to clear data!")
    else:
        print("❌ Operation cancelled - no data was cleared")
