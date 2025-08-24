#!/usr/bin/env python3
"""
Script to delete booking records from the database
This allows testing the booking process from scratch
"""

import sqlite3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def delete_bookings():
    """Delete all booking records from the database"""
    
    # Try different possible database files
    possible_dbs = [
        'app.db',
        'second_hire.db', 
        'secondhire.db',
        'remoty.db'
    ]
    
    for db_file in possible_dbs:
        if os.path.exists(db_file):
            print(f"🔍 Found database: {db_file}")
            
            try:
                conn = sqlite3.connect(db_file)
                cursor = conn.cursor()
                
                # Get list of tables
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = cursor.fetchall()
                print(f"📋 Available tables: {[table[0] for table in tables]}")
                
                # Delete from booking-related tables
                booking_tables = ['bookings', 'booking', 'employer_bookings', 'coworking_bookings']
                
                for table_name in booking_tables:
                    try:
                        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                        count = cursor.fetchone()[0]
                        if count > 0:
                            cursor.execute(f"DELETE FROM {table_name}")
                            print(f"🗑️  Deleted {count} records from {table_name}")
                    except sqlite3.OperationalError as e:
                        if "no such table" not in str(e):
                            print(f"⚠️  Error with table {table_name}: {e}")
                
                conn.commit()
                conn.close()
                print(f"✅ Successfully cleaned booking data from {db_file}")
                
            except Exception as e:
                print(f"❌ Error accessing {db_file}: {e}")
        else:
            print(f"❌ Database file not found: {db_file}")

if __name__ == "__main__":
    print("🧹 Starting booking cleanup...")
    delete_bookings()
    print("✅ Booking cleanup complete!")
