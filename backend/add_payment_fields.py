#!/usr/bin/env python3
"""
Script to add payment fields to coworking_bookings table
Run this once to update the database schema
"""

import sqlite3
import os

def add_payment_fields():
    # Get database path
    db_path = "secondhire.db"
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(coworking_bookings)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add payment_intent_id column if it doesn't exist
        if 'payment_intent_id' not in columns:
            cursor.execute("ALTER TABLE coworking_bookings ADD COLUMN payment_intent_id TEXT")
            print("✅ Added payment_intent_id column")
        else:
            print("ℹ️ payment_intent_id column already exists")
            
        # Add payment_status column if it doesn't exist
        if 'payment_status' not in columns:
            cursor.execute("ALTER TABLE coworking_bookings ADD COLUMN payment_status TEXT DEFAULT 'pending'")
            print("✅ Added payment_status column")
        else:
            print("ℹ️ payment_status column already exists")
        
        # Commit changes
        conn.commit()
        print("✅ Database schema updated successfully!")
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    add_payment_fields()
