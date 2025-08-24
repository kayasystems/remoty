"""
Complete Coworking Routes - Independent from Employer Module
All coworking-related endpoints in one place
"""
import json
import os
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile, Form
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import text, func, extract
from pydantic import BaseModel

from shared.database import get_db
from shared.models.coworking_user import CoworkingUser
from shared.models.coworkingspacelisting import CoworkingSpaceListing
from shared.models.booking import CoworkingBooking
from shared.models.coworking_images import CoworkingImage
from shared.models.amenity import Amenity
from coworking_module.auth.coworking_auth import get_current_coworking_user as auth_get_current_coworking_user
from coworking_module.utils.thumbnail_generator import ThumbnailGenerator
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter(tags=["Coworking"])

# ===== AUTHENTICATION ENDPOINTS =====

class CoworkingUserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    password: str

class CoworkingUserLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
def register_coworking_user(data: CoworkingUserCreate, db: Session = Depends(get_db)):
    """Register a new coworking space owner"""
    existing = db.query(CoworkingUser).filter_by(email=data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = hash_password(data.password)
    
    new_user = CoworkingUser(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
        password_hash=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Coworking user registered successfully", "id": new_user.id}

@router.post("/login")
def login_coworking_user(data: CoworkingUserLogin, db: Session = Depends(get_db)):
    """Login coworking space owner"""
    user = db.query(CoworkingUser).filter_by(email=data.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email address. Please check your email or register for a new account.")
    
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password. Please check your password and try again.")

    token = create_access_token({"sub": str(user.id), "role": "coworking"})
    return {"access_token": token, "token_type": "bearer"}

# ===== PROFILE ENDPOINTS =====

def get_current_coworking_user(current_user = Depends(auth_get_current_coworking_user)):
    """Get current coworking user from token using coworking auth system"""
    return current_user

@router.get("/me")
def get_coworking_profile(current_user=Depends(auth_get_current_coworking_user)):
    """Get coworking user profile"""
    return {
        "id": current_user["user"].id,
        "first_name": current_user["user"].first_name,
        "last_name": current_user["user"].last_name,
        "email": current_user["user"].email,
        "phone": current_user["user"].phone,
        "created_at": current_user["user"].created_at
    }

# ===== SPACE MANAGEMENT ENDPOINTS =====

class SpaceCreate(BaseModel):
    title: str
    description: str
    address: str
    city: str
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: str
    latitude: Optional[float] = 0.0
    longitude: Optional[float] = 0.0
    price_per_hour: Optional[float] = 0.0
    price_per_day: Optional[float] = 0.0
    price_per_week: Optional[float] = 0.0
    price_per_month: Optional[float] = 0.0
    amenities: Optional[str] = None
    packages: Optional[str] = None  # JSON string of packages
    opening_hours: Optional[str] = None
    timezone: Optional[str] = None
    is_24_7: Optional[bool] = False
    is_verified: Optional[bool] = False

@router.post("/spaces")
def create_space(data: SpaceCreate, current_user=Depends(auth_get_current_coworking_user), db: Session = Depends(get_db)):
    """Create a new coworking space listing"""
    
    new_space = CoworkingSpaceListing(
        title=data.title,
        description=data.description,
        address=data.address,
        city=data.city,
        state=data.state,
        zip_code=data.zip_code,
        country=data.country,
        latitude=data.latitude,
        longitude=data.longitude,
        price_per_hour=data.price_per_hour,
        price_per_day=data.price_per_day,
        price_per_week=data.price_per_week,
        price_per_month=data.price_per_month,
        amenities=data.amenities,
        packages=data.packages,
        opening_hours=data.opening_hours,
        timezone=data.timezone,
        coworking_user_id=current_user["user"].id,
        is_verified=data.is_verified
    )
    
    db.add(new_space)
    db.commit()
    db.refresh(new_space)
    
    return {"message": "Space created successfully", "space_id": new_space.id}

@router.get("/spaces")
def get_my_spaces(current_user=Depends(auth_get_current_coworking_user), db: Session = Depends(get_db)):
    """Get all spaces owned by current user with packages and images"""
    import json
    from shared.models.coworking_images import CoworkingImage
    
    spaces = db.query(CoworkingSpaceListing).filter_by(coworking_user_id=current_user["user"].id).all()
    
    result_spaces = []
    for space in spaces:
        # Parse packages JSON
        packages_data = []
        if space.packages:
            try:
                packages_json = json.loads(space.packages)
                if isinstance(packages_json, list):
                    for pkg in packages_json:
                        # Get images for this package
                        package_images = db.query(CoworkingImage).filter_by(
                            space_id=space.id,
                            package_id=str(pkg.get('id', ''))
                        ).all()
                        
                        packages_data.append({
                            "id": pkg.get('id'),
                            "name": pkg.get('name'),
                            "description": pkg.get('description'),
                            "price_per_hour": pkg.get('price_per_hour'),
                            "price_per_day": pkg.get('price_per_day'),
                            "price_per_week": pkg.get('price_per_week'),
                            "price_per_month": pkg.get('price_per_month'),
                            "amenities": pkg.get('amenities'),
                            "images": [
                                {
                                    "id": img.id,
                                    "image_url": img.image_url,
                                    "thumbnail_url": img.thumbnail_url,
                                    "thumbnail_small_url": img.thumbnail_small_url,
                                    "thumbnail_medium_url": img.thumbnail_medium_url,
                                    "image_name": img.image_name,
                                    "image_description": img.image_description,
                                    "is_primary": img.is_primary
                                }
                                for img in package_images
                            ]
                        })
            except (json.JSONDecodeError, TypeError):
                packages_data = []
        
        # Get space-level images (not associated with any specific package)
        space_images = db.query(CoworkingImage).filter_by(
            space_id=space.id,
            package_id=None
        ).all()
        
        result_spaces.append({
            "id": space.id,
            "title": space.title,
            "description": space.description,
            "address": space.address,
            "city": space.city,
            "state": space.state,
            "country": space.country,
            "price_per_hour": space.price_per_hour,
            "price_per_day": space.price_per_day,
            "price_per_week": space.price_per_week,
            "price_per_month": space.price_per_month,
            "amenities": space.amenities,
            "opening_hours": space.opening_hours,
            "timezone": space.timezone,
            "is_verified": space.is_verified,
            "packages": packages_data,
            "images": [
                {
                    "id": img.id,
                    "image_url": img.image_url,
                    "thumbnail_url": img.thumbnail_url,
                    "thumbnail_small_url": img.thumbnail_small_url,
                    "thumbnail_medium_url": img.thumbnail_medium_url,
                    "image_name": img.image_name,
                    "image_description": img.image_description,
                    "is_primary": img.is_primary
                }
                for img in space_images
            ]
        })
    
    return {
        "spaces": result_spaces
    }

# ===== BOOKING MANAGEMENT ENDPOINTS =====

@router.get("/bookings")
def get_space_bookings(current=Depends(get_current_coworking_user), db: Session = Depends(get_db)):
    """Get all bookings for spaces owned by current user"""
    user = current["user"]
    
    # Get all spaces owned by this user
    user_spaces = db.query(CoworkingSpaceListing).filter_by(coworking_user_id=user.id).all()
    space_ids = [space.id for space in user_spaces]
    
    if not space_ids:
        return {"bookings": []}
    
    # Get all bookings for these spaces
    bookings = db.query(CoworkingBooking).filter(
        CoworkingBooking.coworking_space_id.in_(space_ids)
    ).options(
        joinedload(CoworkingBooking.coworking_space)
    ).all()
    
    return {
        "bookings": [
            {
                "id": booking.id,
                "space_name": booking.coworking_space.title,
                "booking_type": booking.booking_type,
                "start_date": booking.start_date,
                "end_date": booking.end_date,
                "total_cost": booking.total_cost,
                "duration_per_day": booking.duration_per_day,
                "status": "active",  # You can add status field to model
                "created_at": booking.created_at
            }
            for booking in bookings
        ]
    }

# ===== DASHBOARD STATS ENDPOINTS =====

class CoworkingStats(BaseModel):
    total_spaces: int
    total_bookings: int
    monthly_revenue: float
    active_bookings: int

@router.get("/dashboard/stats")
def get_coworking_stats(current=Depends(get_current_coworking_user), db: Session = Depends(get_db)):
    """Get dashboard statistics for coworking space owner"""
    user = current["user"]
    
    # Get all spaces owned by this user
    user_spaces = db.query(CoworkingSpaceListing).filter_by(coworking_user_id=user.id).all()
    space_ids = [space.id for space in user_spaces]
    
    total_spaces = len(user_spaces)
    
    if not space_ids:
        return CoworkingStats(
            total_spaces=0,
            total_bookings=0,
            monthly_revenue=0.0,
            active_bookings=0
        )
    
    # Get booking statistics
    total_bookings = db.query(CoworkingBooking).filter(
        CoworkingBooking.coworking_space_id.in_(space_ids)
    ).count()
    
    # Get current month revenue
    current_month = datetime.now().replace(day=1)
    monthly_revenue = db.query(func.sum(CoworkingBooking.total_cost)).filter(
        CoworkingBooking.coworking_space_id.in_(space_ids),
        CoworkingBooking.created_at >= current_month
    ).scalar() or 0.0
    
    # Get active bookings (current and future)
    today = datetime.now().date()
    active_bookings = db.query(CoworkingBooking).filter(
        CoworkingBooking.coworking_space_id.in_(space_ids),
        CoworkingBooking.end_date >= today
    ).count()
    
    return CoworkingStats(
        total_spaces=total_spaces,
        total_bookings=total_bookings,
        monthly_revenue=float(monthly_revenue),
        active_bookings=active_bookings
    )

# ===== REVENUE ANALYTICS ENDPOINTS =====

@router.get("/analytics/revenue")
def get_revenue_analytics(
    days: int = Query(30, description="Number of days to analyze"),
    current=Depends(get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Get revenue analytics for the last N days"""
    user = current["user"]
    
    # Get all spaces owned by this user
    user_spaces = db.query(CoworkingSpaceListing).filter_by(coworking_user_id=user.id).all()
    space_ids = [space.id for space in user_spaces]
    
    if not space_ids:
        return {"daily_revenue": [], "total_revenue": 0.0}
    
    # Get revenue data for the last N days
    start_date = datetime.now() - timedelta(days=days)
    
    bookings = db.query(CoworkingBooking).filter(
        CoworkingBooking.coworking_space_id.in_(space_ids),
        CoworkingBooking.created_at >= start_date
    ).all()
    
    # Group by date
    daily_revenue = {}
    total_revenue = 0.0
    
    for booking in bookings:
        date_key = booking.created_at.date().isoformat()
        if date_key not in daily_revenue:
            daily_revenue[date_key] = 0.0
        daily_revenue[date_key] += float(booking.total_cost)
        total_revenue += float(booking.total_cost)
    
    return {
        "daily_revenue": [
            {"date": date, "revenue": revenue}
            for date, revenue in sorted(daily_revenue.items())
        ],
        "total_revenue": total_revenue,
        "period_days": days
    }

# ===== PROFILE MANAGEMENT ENDPOINTS =====

class CoworkingUserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

@router.put("/update")
def update_coworking_profile(
    data: CoworkingUserUpdate,
    current=Depends(get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Update coworking user profile"""
    user = current["user"]
    
    # Update only provided fields
    if data.first_name is not None:
        user.first_name = data.first_name
    if data.last_name is not None:
        user.last_name = data.last_name
    if data.phone is not None:
        user.phone = data.phone
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone": user.phone
        }
    }

# ===== SECTION-SPECIFIC UPDATE ENDPOINTS =====

class BasicInfoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PackagesUpdate(BaseModel):
    packages: str  # JSON string of packages

class ImagesUpdate(BaseModel):
    images: Optional[str] = None  # JSON string of image data

class HoursUpdate(BaseModel):
    opening_hours: Optional[str] = None
    timezone: Optional[str] = None
    is_24_7: Optional[bool] = None
    weekly_schedule: Optional[dict] = None  # Weekly schedule data

class AmenitiesUpdate(BaseModel):
    amenities: str  # JSON string of amenities

class PackageUpdateData(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_per_hour: Optional[float] = None
    price_per_day: Optional[float] = None
    price_per_week: Optional[float] = None
    price_per_month: Optional[float] = None
    amenities: Optional[str] = None  # JSON string of amenities
    images: Optional[List[Dict]] = None  # List of image data

@router.put("/spaces/{space_id}/basic-info")
def update_space_basic_info(
    space_id: int,
    data: BasicInfoUpdate,
    current=Depends(get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Update basic information of a coworking space"""
    user = current["user"]  # Extract user from auth response
    
    # Get the space and verify ownership
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id,
        CoworkingSpaceListing.coworking_user_id == user.id
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Space not found or access denied")
    
    # Update only provided fields
    update_data = data.dict(exclude_unset=True)
    print(f"Updating space {space_id} with data: {update_data}")  # Debug log
    
    for field, value in update_data.items():
        if hasattr(space, field):
            print(f"Setting {field} = {value}")  # Debug log
            setattr(space, field, value)
        else:
            print(f"Warning: Field {field} does not exist on CoworkingSpaceListing model")
    
    try:
        db.commit()
        db.refresh(space)
        print(f"Successfully updated space {space_id}")  # Debug log
        return {"message": "Basic information updated successfully", "updated_fields": list(update_data.keys())}
    except Exception as e:
        print(f"Error committing changes: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update space: {str(e)}")

@router.put("/spaces/{space_id}/packages")
def update_space_packages(
    space_id: int,
    data: PackagesUpdate,
    current=Depends(get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Update packages of a coworking space"""
    user = current["user"]
    
    # Get the space and verify ownership
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id,
        CoworkingSpaceListing.coworking_user_id == user.id
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Space not found or access denied")
    
    space.packages = data.packages
    space.updated_at = datetime.now()
    db.commit()
    
    return {"message": "Packages updated successfully"}

@router.put("/spaces/{space_id}/packages/{package_id}")
def update_single_package(
    space_id: int,
    package_id: str,
    data: PackageUpdateData,
    current_user=Depends(auth_get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Update a single package with its images and amenities"""
    user = current_user["user"]  # Extract user from auth response
    
    # Get the space and verify ownership
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id,
        CoworkingSpaceListing.coworking_user_id == user.id
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Space not found or access denied")
    
    # Parse existing packages
    try:
        packages = json.loads(space.packages) if space.packages else []
    except json.JSONDecodeError:
        packages = []
    
    # Find and update the specific package
    package_found = False
    for i, pkg in enumerate(packages):
        if str(pkg.get('id')) == str(package_id):
            package_found = True
            # Update package fields
            if data.name is not None:
                pkg['name'] = data.name
            if data.description is not None:
                pkg['description'] = data.description
            if data.price_per_hour is not None:
                pkg['price_per_hour'] = data.price_per_hour
            if data.price_per_day is not None:
                pkg['price_per_day'] = data.price_per_day
            if data.price_per_week is not None:
                pkg['price_per_week'] = data.price_per_week
            if data.price_per_month is not None:
                pkg['price_per_month'] = data.price_per_month
            if data.amenities is not None:
                pkg['amenities'] = data.amenities
            break
    
    if not package_found:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Update packages in database
    space.packages = json.dumps(packages)
    
    # Handle package images if provided
    if data.images is not None:
        # Delete existing package images
        db.query(CoworkingImage).filter(
            CoworkingImage.space_id == space_id,
            CoworkingImage.package_id == str(package_id)
        ).delete()
        
        # Add new package images
        for img_data in data.images:
            new_image = CoworkingImage(
                space_id=space_id,
                package_id=str(package_id),
                image_url=img_data.get('image_url', ''),
                image_name=img_data.get('image_name', ''),
                image_description=img_data.get('image_description', ''),
                is_primary=img_data.get('is_primary', False)
            )
            db.add(new_image)
    
    space.updated_at = datetime.now()
    db.commit()
    
    return {"message": "Package updated successfully"}

@router.put("/spaces/{space_id}/images")
def update_space_images(
    space_id: int,
    data: ImagesUpdate,
    current=Depends(get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Update images of a coworking space"""
    user = current["user"]
    
    # Get the space and verify ownership
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id,
        CoworkingSpaceListing.coworking_user_id == user.id
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Space not found or access denied")
    
    # Update images field if provided
    if data.images is not None:
        space.images = data.images
    
    space.updated_at = datetime.now()
    db.commit()
    
    return {"message": "Images updated successfully"}

@router.put("/spaces/{space_id}/hours")
def update_space_hours(
    space_id: int,
    data: HoursUpdate,
    current=Depends(get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Update operating hours of a coworking space with 24/7 and weekly schedule support"""
    user = current["user"]  # Extract user from auth response
    
    # Get the space and verify ownership
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id,
        CoworkingSpaceListing.coworking_user_id == user.id
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Space not found or access denied")
    
    # Handle 24/7 operation
    if data.is_24_7 is not None:
        space.is_24_7 = data.is_24_7
        
        if data.is_24_7:
            # If 24/7 is enabled, set opening hours to indicate 24/7 operation
            twenty_four_seven_schedule = {
                "Monday": {"isOpen": True, "startTime": "00:00", "endTime": "23:59"},
                "Tuesday": {"isOpen": True, "startTime": "00:00", "endTime": "23:59"},
                "Wednesday": {"isOpen": True, "startTime": "00:00", "endTime": "23:59"},
                "Thursday": {"isOpen": True, "startTime": "00:00", "endTime": "23:59"},
                "Friday": {"isOpen": True, "startTime": "00:00", "endTime": "23:59"},
                "Saturday": {"isOpen": True, "startTime": "00:00", "endTime": "23:59"},
                "Sunday": {"isOpen": True, "startTime": "00:00", "endTime": "23:59"}
            }
            space.opening_hours = json.dumps(twenty_four_seven_schedule)
    
    # Handle weekly schedule (only if not 24/7)
    if data.weekly_schedule is not None and not data.is_24_7:
        space.opening_hours = json.dumps(data.weekly_schedule)
    
    # Handle timezone
    if data.timezone is not None:
        space.timezone = data.timezone
    
    # Handle custom opening hours string (legacy support)
    if data.opening_hours is not None and not data.is_24_7:
        space.opening_hours = data.opening_hours
    
    space.updated_at = datetime.now()
    db.commit()
    
    return {
        "message": "Operating hours updated successfully",
        "is_24_7": space.is_24_7,
        "opening_hours": space.opening_hours,
        "timezone": space.timezone
    }

@router.put("/spaces/{space_id}/amenities")
def update_space_amenities(
    space_id: int,
    data: AmenitiesUpdate,
    current=Depends(get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Update amenities of a coworking space"""
    user = current["user"]
    
    # Get the space and verify ownership
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id,
        CoworkingSpaceListing.coworking_user_id == user.id
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Space not found or access denied")
    
    space.amenities = data.amenities
    space.updated_at = datetime.now()
    db.commit()
    
    return {"message": "Amenities updated successfully"}

# ===== INDIVIDUAL SPACE MANAGEMENT ENDPOINTS =====


@router.get("/spaces/{space_id}")
def get_space_details(
    space_id: int,
    current_user=Depends(auth_get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific coworking space"""
    user = current_user["user"]
    
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id,
        CoworkingSpaceListing.coworking_user_id == user.id
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Space not found or not owned by you")
    
    # Parse JSON fields
    import json
    amenities = []
    packages = []
    
    try:
        if space.amenities:
            amenities = json.loads(space.amenities) if isinstance(space.amenities, str) else space.amenities
    except (json.JSONDecodeError, TypeError):
        amenities = []
    
    try:
        if space.packages:
            packages = json.loads(space.packages) if isinstance(space.packages, str) else space.packages
    except (json.JSONDecodeError, TypeError):
        packages = []
    
    # Get images for this space
    from shared.models.coworking_images import CoworkingImage
    images = db.query(CoworkingImage).filter(CoworkingImage.space_id == space_id).all()
    
    # Group images by package_id
    images_by_package = {}
    general_images = []
    
    for image in images:
        # Convert relative URL to full URL
        # 🌐 PORT ARCHITECTURE: Use port 8001 for coworking backend image serving
        # Port 8000 = Employer Backend | Port 8001 = Coworking Backend
        image_url = image.image_url
        if image_url and not image_url.startswith('http'):
            if image_url.startswith('/'):
                image_url = f"http://localhost:8001{image_url}"
            else:
                image_url = f"http://localhost:8001/{image_url}"
        
        # Convert thumbnail URLs to full URLs
        thumbnail_url = image.thumbnail_url
        thumbnail_small_url = image.thumbnail_small_url
        thumbnail_medium_url = image.thumbnail_medium_url
        
        if thumbnail_url and not thumbnail_url.startswith('http'):
            thumbnail_url = f"http://localhost:8001{thumbnail_url}" if thumbnail_url.startswith('/') else f"http://localhost:8001/{thumbnail_url}"
        if thumbnail_small_url and not thumbnail_small_url.startswith('http'):
            thumbnail_small_url = f"http://localhost:8001{thumbnail_small_url}" if thumbnail_small_url.startswith('/') else f"http://localhost:8001/{thumbnail_small_url}"
        if thumbnail_medium_url and not thumbnail_medium_url.startswith('http'):
            thumbnail_medium_url = f"http://localhost:8001{thumbnail_medium_url}" if thumbnail_medium_url.startswith('/') else f"http://localhost:8001/{thumbnail_medium_url}"

        image_data = {
            "id": image.id,
            "image_url": image_url,
            "thumbnail_url": thumbnail_url,
            "thumbnail_small_url": thumbnail_small_url,
            "thumbnail_medium_url": thumbnail_medium_url,
            "image_name": image.image_name,
            "image_description": image.image_description,
            "is_primary": bool(image.is_primary)
        }
        
        if image.package_id:
            if image.package_id not in images_by_package:
                images_by_package[image.package_id] = []
            images_by_package[image.package_id].append(image_data)
        else:
            general_images.append(image_data)
    
    # Add images to each package and ensure all packages have IDs
    for i, package in enumerate(packages):
        # Ensure every package has an ID - assign sequential IDs starting from 1
        if 'id' not in package or not package['id']:
            package['id'] = i + 1
        
        # Convert package ID to string for matching with image data
        package_id_str = str(package['id'])
        
        # Look for images using the package ID
        package_images = images_by_package.get(package_id_str, [])
        
        # If no images found with numeric ID, try other formats
        if not package_images:
            package_id_name = package.get('name', '').lower().replace(' ', '_')
            package_images = (
                images_by_package.get(package_id_name, []) or
                images_by_package.get(package.get('name', ''), []) or
                images_by_package.get(str(i), [])  # Try zero-based index
            )
        
        package['images'] = package_images
    
    return {
        "id": space.id,
        "title": space.title,
        "description": space.description,
        "address": space.address,
        "city": space.city,
        "state": space.state,
        "zip_code": space.zip_code,
        "country": space.country,
        "latitude": space.latitude,
        "longitude": space.longitude,
        "price_per_hour": space.price_per_hour,
        "price_per_day": space.price_per_day,
        "price_per_week": space.price_per_week,
        "price_per_month": space.price_per_month,
        "opening_hours": space.opening_hours,
        "amenities": amenities,
        "packages": packages,
        "is_verified": space.is_verified,
        "images": general_images
    }

class SpaceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_hour: Optional[float] = None
    price_per_day: Optional[float] = None
    price_per_week: Optional[float] = None
    price_per_month: Optional[float] = None
    amenities: Optional[str] = None
    opening_hours: Optional[str] = None

@router.put("/spaces/{space_id}")
def update_space(
    space_id: int,
    data: SpaceUpdate,
    current=Depends(get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Update a coworking space listing"""
    user = current["user"]
    
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id,
        CoworkingSpaceListing.coworking_user_id == user.id
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Space not found or not owned by you")
    
    # Update only provided fields
    update_data = data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(space, field, value)
    
    db.commit()
    db.refresh(space)
    
    return {
        "message": "Space updated successfully",
        "space_id": space.id
    }

@router.delete("/spaces/{space_id}")
def delete_space(
    space_id: int,
    current=Depends(get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Delete a coworking space listing"""
    user = current["user"]
    
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id,
        CoworkingSpaceListing.coworking_user_id == user.id
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Space not found or not owned by you")
    
    # Check if space has active bookings
    active_bookings = db.query(CoworkingBooking).filter(
        CoworkingBooking.coworking_space_id == space_id,
        CoworkingBooking.end_date >= datetime.now().date()
    ).count()
    
    if active_bookings > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete space with {active_bookings} active bookings"
        )
    
    db.delete(space)
    db.commit()
    
    return {"message": "Space deleted successfully"}

# ===== IMAGE MANAGEMENT ENDPOINTS =====
# Note: These endpoints assume you have a coworking_images table
# For now, I'll create placeholder endpoints that can be implemented when the table exists

@router.get("/spaces/{space_id}/images")
def get_space_images(
    space_id: int,
    current=Depends(get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Get all images for a coworking space"""
    user = current["user"]
    
    # Verify space ownership
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id,
        CoworkingSpaceListing.coworking_user_id == user.id
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Space not found or not owned by you")
    
    # TODO: Implement when coworking_images table is created
    return {
        "space_id": space_id,
        "images": [],
        "message": "Image management will be implemented when coworking_images table is created"
    }

from fastapi import Form

@router.post("/spaces/{space_id}/images")
async def upload_space_image(
    space_id: int,
    file: UploadFile = File(...),
    package_id: Optional[str] = Form(None),
    is_primary: Optional[str] = Form("false"),
    current_user=Depends(auth_get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Upload a new image for a coworking space with package association"""
    
    print(f"🖼️ Image upload request:")
    print(f"   Space ID: {space_id}")
    print(f"   Package ID: {package_id}")
    print(f"   Is Primary: {is_primary}")
    print(f"   File: {file.filename}")
    
    # Verify space ownership
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id,
        CoworkingSpaceListing.coworking_user_id == current_user["user"].id
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Space not found or not owned by you")
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WebP images are allowed")
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads/coworking_images"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")
    
    # Generate thumbnails
    thumbnail_urls = {}
    try:
        thumbnail_generator = ThumbnailGenerator(upload_dir)
        base_filename = os.path.splitext(unique_filename)[0]  # Remove extension
        thumbnail_urls = thumbnail_generator.generate_thumbnails(file_path, base_filename)
        print(f"✅ Generated thumbnails: {thumbnail_urls}")
    except Exception as e:
        print(f"⚠️ Failed to generate thumbnails: {str(e)}")
        # Continue without thumbnails - don't fail the upload
        thumbnail_urls = {'small': None, 'medium': None, 'large': None}
    
    # Convert is_primary string to boolean
    is_primary_bool = is_primary.lower() == "true" if is_primary else False
    
    # Check if this is the first image for this package (make it primary)
    if package_id:
        existing_package_images_count = db.query(CoworkingImage).filter(
            CoworkingImage.space_id == space_id,
            CoworkingImage.package_id == package_id
        ).count()
        should_be_primary = is_primary_bool or (existing_package_images_count == 0)
    else:
        existing_images_count = db.query(CoworkingImage).filter(
            CoworkingImage.space_id == space_id,
            CoworkingImage.package_id.is_(None)
        ).count()
        should_be_primary = is_primary_bool or (existing_images_count == 0)
    
    # Save image record to database with thumbnail URLs
    new_image = CoworkingImage(
        space_id=space_id,
        package_id=package_id,
        image_url=f"/uploads/coworking_images/{unique_filename}",
        image_name=file.filename,
        is_primary=1 if should_be_primary else 0,
        thumbnail_url=thumbnail_urls.get('large'),  # Main thumbnail for display
        thumbnail_small_url=thumbnail_urls.get('small'),  # Small thumbnail for lists
        thumbnail_medium_url=thumbnail_urls.get('medium')  # Medium thumbnail for cards
    )
    
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    
    return {
        "message": "Image uploaded successfully",
        "image_id": new_image.id,
        "image_url": new_image.image_url,
        "thumbnail_url": new_image.thumbnail_url,
        "thumbnail_small_url": new_image.thumbnail_small_url,
        "thumbnail_medium_url": new_image.thumbnail_medium_url,
        "is_primary": new_image.is_primary
    }

@router.delete("/spaces/images/{image_id}")
def delete_space_image(
    image_id: int,
    current_user=Depends(auth_get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Delete an image from a coworking space including its thumbnails"""
    
    # Find the image and verify ownership
    image = db.query(CoworkingImage).join(
        CoworkingSpaceListing,
        CoworkingImage.space_id == CoworkingSpaceListing.id
    ).filter(
        CoworkingImage.id == image_id,
        CoworkingSpaceListing.coworking_user_id == current_user["user"].id
    ).first()
    
    if not image:
        raise HTTPException(status_code=404, detail="Image not found or not owned by you")
    
    # Delete physical files
    try:
        # Delete original image
        if image.image_url:
            original_path = image.image_url.lstrip('/')  # Remove leading slash
            if os.path.exists(original_path):
                os.remove(original_path)
                print(f"🗑️ Deleted original image: {original_path}")
        
        # Delete thumbnails using thumbnail generator
        if image.image_url:
            thumbnail_generator = ThumbnailGenerator()
            # Extract base filename from original image URL
            filename = os.path.basename(image.image_url)
            base_filename = os.path.splitext(filename)[0]
            thumbnail_generator.delete_thumbnails(base_filename)
            print(f"🗑️ Deleted thumbnails for: {base_filename}")
            
    except Exception as e:
        print(f"⚠️ Error deleting physical files: {str(e)}")
        # Continue with database deletion even if file deletion fails
    
    # Delete from database
    db.delete(image)
    db.commit()
    
    return {
        "message": "Image and thumbnails deleted successfully",
        "image_id": image_id
    }

# ===== NOTIFICATIONS ENDPOINT (OPTIONAL) =====

@router.get("/notifications")
def get_notifications(
    current=Depends(get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Get system notifications for coworking space owner"""
    user = current["user"]
    
    # Get recent bookings as notifications
    recent_bookings = db.query(CoworkingBooking).join(
        CoworkingSpaceListing,
        CoworkingBooking.coworking_space_id == CoworkingSpaceListing.id
    ).filter(
        CoworkingSpaceListing.coworking_user_id == user.id,
        CoworkingBooking.created_at >= datetime.now() - timedelta(days=30)
    ).order_by(CoworkingBooking.created_at.desc()).limit(10).all()
    
    notifications = []
    for booking in recent_bookings:
        space = db.query(CoworkingSpaceListing).filter(
            CoworkingSpaceListing.id == booking.coworking_space_id
        ).first()
        
        notifications.append({
            "id": booking.id,
            "type": "booking",
            "title": "New Booking Received",
            "message": f"New booking for {space.title if space else 'your space'}",
            "created_at": booking.created_at,
            "booking_details": {
                "booking_id": booking.id,
                "space_name": space.title if space else "Unknown",
                "check_in": booking.check_in_date,
                "check_out": booking.check_out_date,
                "total_cost": booking.total_cost
            }
        })
    
    return {
        "notifications": notifications,
        "total_count": len(notifications)
    }


# ===== PUBLIC IMAGES ENDPOINT (FOR EMPLOYER FRONTEND) =====

@router.get("/public/spaces/{space_id}/images")
def get_public_space_images(space_id: int, db: Session = Depends(get_db)):
    """Get images for a coworking space organized by packages (public endpoint for employers)"""
    import json
    
    # Verify space exists and is verified
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id,
        CoworkingSpaceListing.is_verified == True
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Coworking space not found")
    
    # Parse packages from JSON
    packages = []
    if space.packages:
        try:
            packages = json.loads(space.packages)
        except:
            packages = []
    
    # Get all images for this space
    images = db.query(CoworkingImage).filter(
        CoworkingImage.space_id == space_id
    ).order_by(CoworkingImage.is_primary.desc(), CoworkingImage.id).all()
    
    # Group images by package
    package_images = {}
    general_images = []
    
    for img in images:
        image_data = {
            "id": img.id,
            "url": img.image_url,
            "name": img.image_name,
            "description": img.image_description,
            "is_primary": bool(img.is_primary),
            "package_id": img.package_id
        }
        
        if img.package_id:
            if img.package_id not in package_images:
                package_images[img.package_id] = []
            package_images[img.package_id].append(image_data)
        else:
            general_images.append(image_data)
    
    # Build response with package information
    packages_with_images = []
    for package in packages:
        package_id = str(package.get('id', ''))
        package_info = {
            "package_id": package_id,
            "package_name": package.get('name', 'Unknown Package'),
            "package_type": package.get('type', ''),
            "images": package_images.get(package_id, [])
        }
        packages_with_images.append(package_info)
    
    return {
        "space_id": space_id,
        "space_title": space.title,
        "general_images": general_images,
        "packages": packages_with_images,
        "total_images": len(images)
    }


# ===== AMENITIES ENDPOINTS =====

@router.get("/amenities")
def get_all_amenities(db: Session = Depends(get_db)):
    """Get all available amenities for coworking spaces"""
    amenities = db.query(Amenity).filter(
        Amenity.is_active == True
    ).order_by(Amenity.category, Amenity.name).all()
    
    # Group amenities by category
    amenities_by_category = {}
    all_amenities = []
    
    for amenity in amenities:
        # Add to category grouping
        if amenity.category not in amenities_by_category:
            amenities_by_category[amenity.category] = []
        
        amenity_data = {
            "id": amenity.id,
            "name": amenity.name,
            "description": amenity.description,
            "icon": amenity.icon,
            "category": amenity.category
        }
        
        amenities_by_category[amenity.category].append(amenity_data)
        all_amenities.append(amenity_data)
    
    return {
        "amenities": all_amenities,
        "amenities_by_category": amenities_by_category,
        "total_count": len(all_amenities)
    }


# ===== DELETE COWORKING USER ACCOUNT =====

@router.delete("/delete")
def delete_coworking_account(
    current_user_data = Depends(auth_get_current_coworking_user),
    db: Session = Depends(get_db)
):
    """Delete coworking user account and all associated data"""
    try:
        # Extract user from auth response
        user = current_user_data["user"]
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        print(f"🔍 Attempting to delete user: {user.id} - {user.email}")
        
        # Simple deletion without checking active bookings for now
        print(f"🔍 Proceeding with user deletion...")
        db.delete(user)
        db.commit()
        print(f"✅ User deleted successfully")
        
        return {"message": "Account deleted successfully"}
        
    except Exception as e:
        print(f"❌ Error during deletion: {str(e)}")
        print(f"❌ Error type: {type(e)}")
        import traceback
        print(f"❌ Full traceback: {traceback.format_exc()}")
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")
