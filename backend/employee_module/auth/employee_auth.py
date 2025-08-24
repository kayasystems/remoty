"""
Employee Authentication Module
JWT-based authentication for employee users
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from shared.database import get_db
from shared.models.employee import Employee
import os

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"

security = HTTPBearer()

def get_current_employee_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Get current employee user from JWT token
    Returns employee user object for protected routes
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT token
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        
        if user_id is None or role != "employee":
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Get employee user from database
    employee = db.query(Employee).filter(Employee.id == int(user_id)).first()
    if employee is None:
        raise credentials_exception
    
    return {"user": employee, "role": "employee"}
