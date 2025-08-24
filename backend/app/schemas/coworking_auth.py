from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class CoworkingUserCreate(BaseModel):
    space_name: str
    owner_name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    password: str

class CoworkingUserLogin(BaseModel):
    email: EmailStr
    password: str

class CoworkingUserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
