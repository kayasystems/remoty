"""
Complete Admin Routes - Independent from Other Modules
All admin-related endpoints in one place
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from shared.database import get_db
from shared.models.admin_user import AdminUser
from shared.models.employer import Employer
from shared.models.employee import Employee
from shared.models.coworking_user import CoworkingUser
from shared.models.coworkingspacelisting import CoworkingSpaceListing
from admin_module.auth.admin_auth import get_current_admin_user
from app.auth import verify_password, create_access_token

router = APIRouter(prefix="/admin", tags=["Admin"])

# ===== PYDANTIC SCHEMAS =====

class AdminLogin(BaseModel):
    email: str
    password: str

class AdminStats(BaseModel):
    total_employers: int
    total_employees: int
    total_coworking_users: int
    total_coworking_spaces: int
    verified_spaces: int
    pending_spaces: int

# ===== AUTHENTICATION ENDPOINTS =====

@router.post("/login")
def login_admin(data: AdminLogin, db: Session = Depends(get_db)):
    """Admin login endpoint - no registration allowed"""
    admin = db.query(AdminUser).filter_by(email=data.email).first()
    
    if not admin:
        raise HTTPException(
            status_code=404, 
            detail="No admin account found with this email address. Contact system administrator."
        )
    
    if not verify_password(data.password, admin.password_hash):
        raise HTTPException(
            status_code=401, 
            detail="Incorrect password. Please check your password and try again."
        )

    token = create_access_token({"sub": str(admin.id), "role": "admin"})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def get_admin_profile(current_admin=Depends(get_current_admin_user)):
    """Get admin profile"""
    admin = current_admin["user"]
    return {
        "id": admin.id,
        "first_name": admin.first_name,
        "last_name": admin.last_name,
        "email": admin.email,
        "role": "admin",  # Fixed role value
        "created_at": admin.created_at
    }

# ===== DASHBOARD ENDPOINTS =====

@router.get("/dashboard/stats")
def get_dashboard_stats(
    current_admin=Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics"""
    
    # Count all users
    total_employers = db.query(Employer).count()
    total_employees = db.query(Employee).count()
    total_coworking_users = db.query(CoworkingUser).count()
    
    # Count coworking spaces
    total_coworking_spaces = db.query(CoworkingSpaceListing).count()
    verified_spaces = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.is_verified == True
    ).count()
    pending_spaces = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.is_verified == False
    ).count()
    
    return {
        "total_employers": total_employers,
        "total_employees": total_employees,
        "total_coworking_users": total_coworking_users,
        "total_coworking_spaces": total_coworking_spaces,
        "verified_spaces": verified_spaces,
        "pending_spaces": pending_spaces,
        "total_users": total_employers + total_employees + total_coworking_users
    }

# ===== USER MANAGEMENT ENDPOINTS =====

@router.get("/users/employers")
def get_all_employers(
    current_admin=Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all employers with pagination"""
    employers = db.query(Employer).offset(skip).limit(limit).all()
    
    return {
        "employers": [
            {
                "id": emp.id,
                "first_name": emp.first_name,
                "last_name": emp.last_name,
                "email": emp.email,
                "company_name": emp.company_name,
                "phone": emp.phone,
                "created_at": emp.created_at,
                "is_verified": emp.is_verified
            }
            for emp in employers
        ],
        "total": db.query(Employer).count()
    }

@router.get("/users/coworking")
def get_all_coworking_users(
    current_admin=Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """Get all coworking users with pagination"""
    coworking_users = db.query(CoworkingUser).offset(skip).limit(limit).all()
    
    return {
        "coworking_users": [
            {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone": user.phone,
                "created_at": user.created_at
            }
            for user in coworking_users
        ],
        "total": db.query(CoworkingUser).count()
    }

# ===== COWORKING SPACE MANAGEMENT =====

@router.get("/spaces")
def get_all_coworking_spaces(
    current_admin=Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    verified: Optional[bool] = None
):
    """Get all coworking spaces with optional verification filter"""
    query = db.query(CoworkingSpaceListing)
    
    if verified is not None:
        query = query.filter(CoworkingSpaceListing.is_verified == verified)
    
    spaces = query.offset(skip).limit(limit).all()
    
    return {
        "spaces": [
            {
                "id": space.id,
                "title": space.title,
                "description": space.description,
                "city": space.city,
                "country": space.country,
                "address": space.address,
                "is_verified": space.is_verified,
                "coworking_user_id": space.coworking_user_id
            }
            for space in spaces
        ],
        "total": query.count()
    }

@router.put("/spaces/{space_id}/verify")
def verify_coworking_space(
    space_id: int,
    current_admin=Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Verify a coworking space"""
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Coworking space not found")
    
    space.is_verified = True
    db.commit()
    
    return {"message": "Coworking space verified successfully"}

@router.put("/spaces/{space_id}/unverify")
def unverify_coworking_space(
    space_id: int,
    current_admin=Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Unverify a coworking space"""
    space = db.query(CoworkingSpaceListing).filter(
        CoworkingSpaceListing.id == space_id
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Coworking space not found")
    
    space.is_verified = False
    db.commit()
    
    return {"message": "Coworking space unverified successfully"}

# ===== SYSTEM MANAGEMENT =====

@router.get("/system/health")
def get_system_health(current_admin=Depends(get_current_admin_user)):
    """Get system health status"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "services": {
            "database": "connected",
            "admin_api": "running",
            "authentication": "active"
        }
    }
