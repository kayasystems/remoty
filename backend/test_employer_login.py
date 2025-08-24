#!/usr/bin/env python3
"""
Test employer login and get authentication token
"""

import requests
import json

def test_employer_login():
    """Test employer login and get token"""
    
    # Employer login credentials (from the database)
    login_data = {
        "email": "farrukh.naseem@kayasystems.com",
        "password": "admin1"
    }
    
    try:
        # Login to employer backend
        print("🔐 Attempting employer login...")
        response = requests.post(
            "http://localhost:8000/employer/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print(f"✅ Login successful!")
            print(f"🎫 Token: {token[:50]}...")
            
            # Test the /employer/me endpoint with the token
            print("\n🏢 Testing /employer/me endpoint...")
            me_response = requests.get(
                "http://localhost:8000/employer/me",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            )
            
            if me_response.status_code == 200:
                employer_data = me_response.json()
                print(f"✅ Employer data retrieved successfully!")
                print(f"📍 Company: {employer_data.get('company_name')}")
                print(f"📍 Location: {employer_data.get('city')}, {employer_data.get('country')}")
                print(f"📍 Coordinates: ({employer_data.get('latitude')}, {employer_data.get('longitude')})")
                
                # Test coworking spaces endpoint
                print("\n🏢 Testing coworking spaces endpoint...")
                spaces_response = requests.post(
                    "http://localhost:8000/employer/employer-profile-coworking-spaces",
                    json={
                        "address": employer_data.get('address', ''),
                        "city": employer_data.get('city', ''),
                        "state": employer_data.get('state', ''),
                        "zip_code": employer_data.get('zip_code', ''),
                        "country": employer_data.get('country', ''),
                        "radius_km": 10,
                        "latitude": employer_data.get('latitude'),
                        "longitude": employer_data.get('longitude')
                    },
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    }
                )
                
                if spaces_response.status_code == 200:
                    spaces_data = spaces_response.json()
                    print(f"✅ Found {len(spaces_data)} coworking spaces!")
                    for space in spaces_data:
                        packages_str = space.get('packages', '')
                        packages_count = 0
                        package_names = []
                        if packages_str:
                            try:
                                packages = json.loads(packages_str)
                                packages_count = len(packages)
                                package_names = [pkg.get('name', 'Unknown') for pkg in packages]
                            except:
                                packages_count = 0
                        print(f"  📍 {space.get('title')} - {space.get('distance_km')}km - {packages_count} packages")
                        if packages_count > 0:
                            print(f"     Packages: {package_names}")
                else:
                    print(f"❌ Coworking spaces request failed: {spaces_response.status_code}")
                    print(f"Response: {spaces_response.text}")
                    
            else:
                print(f"❌ /employer/me request failed: {me_response.status_code}")
                print(f"Response: {me_response.text}")
                
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            
            # Try to register if login fails
            print("\n🔐 Attempting to register new employer...")
            register_data = {
                "name": "Kaya SaaS",
                "email": "farrukh.naseem@kayasystems.com",
                "password": "password123",
                "contact_number": "+92-300-1234567",
                "address": "123 Tech Street",
                "city": "Lahore",
                "state": "Punjab",
                "country": "Pakistan",
                "industry": "Technology",
                "size": "10-50",
                "timezone": "Asia/Karachi",
                "website": "https://kayasystems.com"
            }
            
            register_response = requests.post(
                "http://localhost:8000/employer/register",
                json=register_data,
                headers={"Content-Type": "application/json"}
            )
            
            if register_response.status_code == 200:
                print("✅ Registration successful! Try logging in now.")
            else:
                print(f"❌ Registration failed: {register_response.status_code}")
                print(f"Response: {register_response.text}")
    
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_employer_login()
