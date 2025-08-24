from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from shared.database import get_db
from shared.models.coworking_user import CoworkingUser
from shared.models.coworkingspacelisting import CoworkingSpaceListing
from shared.models.booking import CoworkingBooking
from coworking_module.auth.coworking_auth import get_current_coworking_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/coworking", tags=["coworking-dashboard"])

class CoworkingStats(BaseModel):
    total_spaces: int
    active_bookings: int
    total_revenue: float
    occupancy_rate: float

class CoworkingUserInfo(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    created_at: datetime

class RecentActivity(BaseModel):
    id: int
    type: str
    description: str
    timestamp: datetime

class DashboardResponse(BaseModel):
    stats: CoworkingStats
    user_info: CoworkingUserInfo
    recent_activities: List[RecentActivity]

@router.get("/dashboard/stats", response_model=DashboardResponse)
def get_coworking_dashboard_stats(
    current_user: CoworkingUser = Depends(get_current_coworking_user),
    db: Session = Depends(get_db)
):
    # Get user's coworking spaces
    user_spaces = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.coworking_user_id == current_user.id
    ).all()
    
    total_spaces = len(user_spaces)
    space_ids = [space.id for space in user_spaces]
    
    # Get active bookings for user's spaces
    active_bookings = db.query(CoworkingBooking).filter(
        CoworkingBooking.coworking_space_id.in_(space_ids),
        CoworkingBooking.check_in_date >= datetime.now().date()
    ).count() if space_ids else 0
    
    # Calculate total revenue (sum of all bookings)
    total_revenue_result = db.query(func.sum(CoworkingBooking.total_cost)).filter(
        CoworkingBooking.coworking_space_id.in_(space_ids)
    ).scalar() if space_ids else 0
    
    total_revenue = float(total_revenue_result) if total_revenue_result else 0.0
    
    # Calculate occupancy rate (simplified - active bookings / total capacity)
    total_capacity = sum([space.capacity or 10 for space in user_spaces])  # Default capacity 10
    occupancy_rate = (active_bookings / total_capacity * 100) if total_capacity > 0 else 0
    
    # Get recent activities (recent bookings)
    recent_bookings = db.query(CoworkingBooking).filter(
        CoworkingBooking.coworking_space_id.in_(space_ids)
    ).order_by(CoworkingBooking.created_at.desc()).limit(5).all() if space_ids else []
    
    recent_activities = []
    for booking in recent_bookings:
        space = next((s for s in user_spaces if s.id == booking.coworking_space_id), None)
        if space:
            recent_activities.append(RecentActivity(
                id=booking.id,
                type="booking",
                description=f"New booking at {space.name}",
                timestamp=booking.created_at
            ))
    
    # User info
    user_info = CoworkingUserInfo(
        id=current_user.id,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        email=current_user.email,
        phone=current_user.phone,
        created_at=current_user.created_at
    )
    
    # Stats
    stats = CoworkingStats(
        total_spaces=total_spaces,
        active_bookings=active_bookings,
        total_revenue=total_revenue,
        occupancy_rate=round(occupancy_rate, 1)
    )
    
    return DashboardResponse(
        stats=stats,
        user_info=user_info,
        recent_activities=recent_activities
    )

@router.get("/me", response_model=CoworkingUserInfo)
def get_current_coworking_user_info(
    current_user: CoworkingUser = Depends(get_current_coworking_user)
):
    return CoworkingUserInfo(
        id=current_user.id,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        email=current_user.email,
        phone=current_user.phone,
        created_at=current_user.created_at
    )
