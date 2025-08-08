from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import re

# Base schema for login and registration (shared password validation)
class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

    @field_validator('password')
    def validate_password(cls, value):
        """
        Ensure the password is:
        - at least 8 characters
        - includes at least one lowercase, one uppercase, one digit, and one special character
        """
        pattern = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$')
        if not pattern.match(value):
            raise ValueError(
                "Password must be at least 8 characters long and include "
                "an uppercase letter, lowercase letter, number, and special character."
            )
        return value

# Registration schema extends login and adds name
class UserCreateSchema(UserLoginSchema):
    name: Optional[str]

# Schema for sending user data back (no password)
class UserResponseSchema(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str]

    class Config:
        orm_mode = True

# Schema for returning client data
class ClientSchema(BaseModel):
    id: int
    name: str
    email: Optional[EmailStr]

    class Config:
        orm_mode = True
