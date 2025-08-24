from fastapi import HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from jose import jwt
from shared.database import get_db
from shared.models.admin_user import AdminUser
from app.config import settings

# JWT Configuration - Use same secret as shared auth
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"

oauth2_scheme = HTTPBearer()

def get_current_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Admin-specific authentication dependency.
    Only allows admin users to access protected routes.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")

        if user_id is None or role != "admin":
            raise HTTPException(status_code=403, detail="Only admin users are allowed")

        admin = db.query(AdminUser).filter_by(id=user_id).first()
        if admin is None:
            raise HTTPException(status_code=401, detail="Admin user not found")

        return {"user": admin, "role": role}

    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
