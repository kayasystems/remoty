from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from shared.database import SessionLocal
from app.config import settings
from shared.models import employer, employee, admin

# Secret & algorithm
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

# Use HTTP Bearer (instead of OAuth2)
oauth2_scheme = HTTPBearer()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# DB session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Password utils
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Create JWT token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Decode JWT token
def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ✅ Generic user decoder (all roles)
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    print("Received token:", token)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")

        if user_id is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        if role == "employer":
            user = db.query(employer.Employer).filter_by(id=user_id).first()
        elif role == "employee":
            user = db.query(employee.Employee).filter_by(id=user_id).first()
        elif role == "admin":
            user = db.query(admin.Admin).filter_by(id=user_id).first()
        elif role == "coworking":
            from shared.models.coworking_user import CoworkingUser
            user = db.query(CoworkingUser).filter_by(id=user_id).first()
        else:
            raise HTTPException(status_code=401, detail="Invalid role")

        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return {"user": user, "role": role}

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ✅ Strict employer-only user decoder
def get_current_employer_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    print("Received token:", token)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")

        if user_id is None or role != "employer":
            raise HTTPException(status_code=403, detail="Only employers are allowed")

        user = db.query(employer.Employer).filter_by(id=user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Employer not found")

        return {"user": user, "role": role}

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
