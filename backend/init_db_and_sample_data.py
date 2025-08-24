#!/usr/bin/env python3
"""
Initialize database with updated schema and populate with comprehensive sample data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shared.database import engine, Base
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

def init_database():
    """Create all database tables"""
    print("🗄️  Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

def populate_sample_data():
    """Run the comprehensive sample data script"""
    print("📊 Populating sample data...")
    
    # Import and run the sample data creation
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
    print("🚀 Initializing database and sample data...")
    
    # Step 1: Create tables
    init_database()
    
    # Step 2: Populate sample data
    populate_sample_data()
    
    print("\n🎉 Database initialization complete!")
    print("📊 You now have:")
    print("   👤 1 Employer (employer@test.com / admin)")
    print("   👥 30 Employees across 3 cities")
    print("   🏢 60 Coworking spaces")
    print("   📅 21 Coworking bookings")
    print("   📋 50 Tasks with assignments")
    print("   ⏰ 30 days of attendance with status colors:")
    print("      🟢 Green: Full attendance (8+ hours)")
    print("      🟠 Orange: Partial attendance (4-7.9 hours)")
    print("      🔴 Red: Absent (<4 hours)")
