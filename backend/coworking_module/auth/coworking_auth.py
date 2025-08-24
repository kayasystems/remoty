from fastapi import HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from jose import jwt
from shared.database import get_db
from shared.models.coworking_user import CoworkingUser
from app.config import settings

# JWT Configuration - Use same secret as shared auth
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"

oauth2_scheme = HTTPBearer()

def get_current_coworking_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Coworking-specific authentication dependency.
    Only allows coworking users to access protected routes.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")

        if user_id is None or role != "coworking":
            raise HTTPException(status_code=403, detail="Only coworking users are allowed")

        user = db.query(CoworkingUser).filter_by(id=user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Coworking user not found")

        return {"user": user, "role": role}

    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
