#!/usr/bin/env python3
"""
Drop existing database and create fresh one with updated schema and comprehensive sample data
"""

import sys
import os
import sqlite3
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.database import engine, Base, DATABASE_URL
from shared.models import (
    admin,
    employer, 
    employee,
    coworkingspacelisting,
    attendance,
    invitetoken,
    booking,
    task,
    task_assignment
)

def drop_database():
    """Drop the existing database file"""
    print("🗑️  Dropping existing database...")
    
    # Extract database path from DATABASE_URL
    if DATABASE_URL.startswith('sqlite:///'):
        db_path = DATABASE_URL.replace('sqlite:///', '')
        if os.path.exists(db_path):
            os.remove(db_path)
            print(f"✅ Removed existing database: {db_path}")
        else:
            print("ℹ️  No existing database found")
    else:
        print("⚠️  Non-SQLite database detected, skipping file removal")

def create_fresh_database():
    """Create all database tables with updated schema"""
    print("🗄️  Creating fresh database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Fresh database tables created successfully!")

def populate_sample_data():
    """Run the comprehensive sample data script"""
    print("📊 Populating comprehensive sample data...")
    
    import subprocess
    import sys
    
    result = subprocess.run([sys.executable, '-m', 'app.create_sample_data_comprehensive'], 
                          cwd='/Users/farrukh/second-hire/backend',
                          capture_output=True, text=True)
    
    if result.returncode == 0:
        print(result.stdout)
        print("✅ Sample data populated successfully!")
    else:
        print(f"❌ Error populating sample data: {result.stderr}")
        raise Exception(f"Sample data population failed: {result.stderr}")

if __name__ == "__main__":
    print("🚀 Creating fresh database with comprehensive sample data...")
    
    # Step 1: Drop existing database
    drop_database()
    
    # Step 2: Create fresh tables
    create_fresh_database()
    
    # Step 3: Populate sample data
    populate_sample_data()
    
    print("\n🎉 Fresh database creation complete!")
    print("📊 Your database now contains:")
    print("   👤 1 Employer (employer@test.com / admin)")
    print("   👥 30 Employees across 3 Pakistani cities:")
    print("      📍 10 in Lahore")
    print("      📍 10 in Karachi") 
    print("      📍 10 in Islamabad")
    print("   🏢 60 Real coworking spaces (20 per city)")
    print("   📅 21 Coworking bookings (7 per city)")
    print("   📋 50 Tasks with multiple assignments")
    print("   ⏰ 30 days of attendance records with status:")
    print("      🟢 Green: Full attendance (8+ hours)")
    print("      🟠 Orange: Partial attendance (4-7.9 hours)")
    print("      🔴 Red: Absent (<4 hours)")
    print("\n🔐 Login credentials:")
    print("   Employer: employer@test.com / admin")
    print("   Employees: [firstname].[lastname][1-10]@test.com / admin")
