#!/usr/bin/env python3
"""
Test Employee Registration Script
Tests the employee registration endpoint with provided token and email
"""

import requests
import json

# API endpoint
BASE_URL = "http://localhost:8003"
REGISTER_URL = f"{BASE_URL}/employee/register"

# Test data with provided token and email
test_data = {
    "first_name": "Ayaz",
    "last_name": "Khan", 
    "email": "ayaz.test@kayasystems.com",
    "phone_number": "+92-300-1234567",
    "password": "testpassword123",
    "address": "349 sector B, Askari 10",
    "city": "Lahore",
    "zip_code": "54000",
    "country": "Pakistan",
    "latitude": 31.5204,  # Lahore coordinates
    "longitude": 74.3587,
    "timezone": "UTC+05:00",
    "profile_picture_url": "https://via.placeholder.com/150",
    "invite_token": "ewCgv0ij664"
}

def test_employee_registration():
    """Test employee registration with the provided data"""
    print("🚀 Testing Employee Registration")
    print("=" * 50)
    
    print(f"📍 API Endpoint: {REGISTER_URL}")
    print(f"📧 Email: {test_data['email']}")
    print(f"🎫 Token: {test_data['invite_token']}")
    print()
    
    try:
        # Make the registration request
        print("📤 Sending registration request...")
        response = requests.post(REGISTER_URL, json=test_data, timeout=30)
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📄 Response Headers: {dict(response.headers)}")
        
        # Try to parse JSON response
        try:
            response_data = response.json()
            print(f"✅ Response Data: {json.dumps(response_data, indent=2)}")
        except json.JSONDecodeError:
            print(f"❌ Raw Response Text: {response.text}")
        
        if response.status_code == 200:
            print("🎉 Registration successful!")
        else:
            print(f"❌ Registration failed with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Could not connect to the employee service")
        print("💡 Make sure the employee service is running on port 8003")
    except requests.exceptions.Timeout:
        print("❌ Timeout Error: Request took too long")
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")

if __name__ == "__main__":
    test_employee_registration()
