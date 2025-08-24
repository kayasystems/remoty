from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from shared.database import get_db
from shared.models import admin as admin_model
from shared.models import coworkingspacelisting as coworking_model
from app.schemas import admin as admin_schema
from app.schemas import coworking as coworking_schema
from app.auth import verify_password, create_access_token, get_current_user
from app.utils.geocode import geocode_address

router = APIRouter(prefix="/admin", tags=["Admin"])


# ✅ Admin Login
@router.post("/login")
def login_admin(data: admin_schema.AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(admin_model.Admin).filter_by(username=data.username).first()
    if not admin or not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    token = create_access_token({"sub": str(admin.id), "role": "admin"})
    return {"access_token": token, "token_type": "bearer"}


# ✅ Add Coworking Space
@router.post("/coworking-space")
def add_coworking_space(
    data: coworking_schema.CoworkingSpaceCreate,
    current=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can add coworking listings")

    try:
        lat, lon = geocode_address(data.address, data.city)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Geocoding failed: {str(e)}")

    listing = coworking_model.CoworkingSpaceListing(
        title=data.title,
        description=data.description,
        address=data.address,
        city=data.city,
        latitude=lat,
        longitude=lon,
        price_per_hour=data.price_per_hour,
        price_per_day=data.price_per_day,
        price_per_week=data.price_per_week,
        price_per_month=data.price_per_month,
        is_verified=False
    )

    db.add(listing)
    db.commit()
    db.refresh(listing)

    return {"message": "Coworking space added", "id": listing.id}


# ✅ Verify or Unverify coworking space
@router.put("/coworking-space/{id}/verify")
def verify_coworking_space(
    id: int,
    verified: bool = True,
    current=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can verify coworking listings")

    space = db.query(coworking_model.CoworkingSpaceListing).filter_by(id=id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Coworking space not found")

    space.is_verified = verified
    db.commit()

    status = "verified" if verified else "unverified"
    return {"message": f"Coworking space marked as {status}"}


# ✅ List all coworking spaces
@router.get("/coworking-space", response_model=list[coworking_schema.CoworkingSpaceOut])
def list_all_coworking_spaces(
    current=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can view coworking listings")

    spaces = db.query(coworking_model.CoworkingSpaceListing).all()
    return spaces
