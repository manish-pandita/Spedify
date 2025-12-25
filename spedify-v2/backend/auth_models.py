"""
Authentication and user models
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str = Field(alias="_id")
    created_at: datetime
    
    class Config:
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class PriceHistoryEntry(BaseModel):
    price: float
    platform: str
    timestamp: datetime
    availability: str = "in_stock"

class UserFavorite(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    product_name: str
    product_url: str
    image_url: str
    current_price: float
    platform: str
    price_history: List[PriceHistoryEntry] = []
    added_at: datetime
    last_checked: datetime
    
    class Config:
        populate_by_name = True

class FavoriteCreate(BaseModel):
    product_name: str
    product_url: str
    image_url: str
    current_price: float
    platform: str

class FavoriteResponse(BaseModel):
    success: bool
    message: str
    favorite: Optional[UserFavorite] = None

class FavoritesListResponse(BaseModel):
    success: bool
    favorites: List[UserFavorite]
    total: int

class PriceComparisonResponse(BaseModel):
    success: bool
    product_name: str
    favorites: List[UserFavorite]
    lowest_price: float
    highest_price: float
    average_price: float
