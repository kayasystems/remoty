import os
import random
import time
import requests
from math import radians, sin, cos, sqrt, atan2
from app.config import settings
from dotenv import load_dotenv

# ✅ Load from .env
load_dotenv()

# 🔑 Google Maps API key from .env
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
if not GOOGLE_MAPS_API_KEY:
    raise RuntimeError("❌ GOOGLE_MAPS_API_KEY not found in .env file")

# 🔁 Toggle between fake or real geocoding
USE_FAKE_GEOCODING = settings.USE_FAKE_GEOCODING

# 🧠 City-level base location cache for fake mode
city_cache = {}

def geocode_address(full_address: str, retries=3, delay=1.5):
    """
    Geocode full address using Google Maps API, or use fake randomized coords near city.
    """
    if not USE_FAKE_GEOCODING:
        return real_geocode(full_address, retries=retries, delay=delay)

    # FAKE fallback mode – approximate using city base + noise
    city_parts = full_address.split(",")
    city_key = ", ".join(part.strip() for part in city_parts[-2:])

    if city_key not in city_cache:
        latlon = real_geocode(city_key, retries=retries, delay=delay)
        if latlon == (None, None):
            print(f"❌ Fallback failed for {city_key}. Using (0.0, 0.0)")
            latlon = (0.0, 0.0)
        city_cache[city_key] = latlon

    base_lat, base_lon = city_cache[city_key]
    lat = base_lat + random.uniform(-0.03, 0.03)
    lon = base_lon + random.uniform(-0.03, 0.03)

    print(f"📍 [FAKE] Geocoded '{full_address}' → ({lat:.5f}, {lon:.5f}) [Base: {city_key}]")
    return round(lat, 5), round(lon, 5)

def real_geocode(full_address: str, retries=3, delay=1.5):
    """
    Uses Google Maps Geocoding API to get latitude and longitude.
    """
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": full_address,
        "key": GOOGLE_MAPS_API_KEY
    }

    for attempt in range(retries):
        try:
            print(f"🔍 Geocoding: {full_address} (Attempt {attempt + 1})")
            response = requests.get(url, params=params)

            if response.status_code != 200:
                print(f"❌ Error {response.status_code}: {response.text}")
                time.sleep(delay)
                continue

            results = response.json().get("results")
            if results:
                location = results[0]["geometry"]["location"]
                lat = float(location["lat"])
                lon = float(location["lng"])
                print(f"✅ Geocoded '{full_address}' → ({lat}, {lon})")
                return lat, lon

            print(f"⚠️ No results for: {full_address}")
        except Exception as e:
            print(f"⚠️ Exception: {e}")

        time.sleep(delay)

    print(f"❌ Failed to geocode after {retries} attempts: {full_address}")
    return None, None

def calculate_distance_km(lat1, lon1, lat2, lon2):
    """
    Calculates great-circle distance (in kilometers) between two lat/lon coordinates.
    Uses the Haversine formula.
    """
    R = 6371.0  # Radius of the Earth in kilometers
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return round(R * c, 2)

def get_distance_duration(origin_lat, origin_lng, dest_lat, dest_lng, mode="driving"):
    """
    Uses Google Maps Distance Matrix API to get distance and duration between two points.
    mode: 'driving', 'walking', 'bicycling', 'transit'
    """
    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": f"{origin_lat},{origin_lng}",
        "destinations": f"{dest_lat},{dest_lng}",
        "mode": mode,
        "key": GOOGLE_MAPS_API_KEY
    }
    response = requests.get(url, params=params)
    data = response.json()

    if data["status"] == "OK":
        element = data["rows"][0]["elements"][0]
        if element["status"] == "OK":
            return {
                "distance_text": element["distance"]["text"],
                "distance_value": element["distance"]["value"],
                "duration_text": element["duration"]["text"],
                "duration_value": element["duration"]["value"]
            }

    print(f"❌ Distance/Duration API failed: {data}")
    return {
        "distance_text": "N/A",
        "distance_value": 0,
        "duration_text": "N/A",
        "duration_value": 0
    }

def get_directions(origin_lat, origin_lng, dest_lat, dest_lng, mode="driving"):
    """
    Uses Google Maps Directions API to fetch step-by-step directions between two points.
    """
    url = "https://maps.googleapis.com/maps/api/directions/json"
    params = {
        "origin": f"{origin_lat},{origin_lng}",
        "destination": f"{dest_lat},{dest_lng}",
        "mode": mode,
        "key": GOOGLE_MAPS_API_KEY
    }
    response = requests.get(url, params=params)
    return response.json()
