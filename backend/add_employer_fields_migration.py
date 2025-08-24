#!/usr/bin/env python3
"""
Migration script to add website, industry, and size fields to the employer table.
Run this script to update the database schema.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from shared.database import get_db

def run_migration():
    """Add new columns to employer table"""
    db = next(get_db())
    
    try:
        print("🔄 Starting migration: Adding website, industry, and size columns to employer table...")
        
        # Check if columns already exist using SQLite PRAGMA
        result = db.execute(text("PRAGMA table_info(employers)"))
        existing_columns = [row[1] for row in result.fetchall()]  # row[1] is column name
        print(f"Existing columns: {existing_columns}")
        
        # Add website column if it doesn't exist
        if 'website' not in existing_columns:
            db.execute(text("ALTER TABLE employers ADD COLUMN website VARCHAR(255)"))
            print("✅ Added 'website' column")
        else:
            print("ℹ️  'website' column already exists")
            
        # Add industry column if it doesn't exist
        if 'industry' not in existing_columns:
            db.execute(text("ALTER TABLE employers ADD COLUMN industry VARCHAR(255)"))
            print("✅ Added 'industry' column")
        else:
            print("ℹ️  'industry' column already exists")
            
        # Add size column if it doesn't exist
        if 'size' not in existing_columns:
            db.execute(text("ALTER TABLE employers ADD COLUMN size VARCHAR(255)"))
            print("✅ Added 'size' column")
        else:
            print("ℹ️  'size' column already exists")
        
        # Commit the changes
        db.commit()
        print("🎉 Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
