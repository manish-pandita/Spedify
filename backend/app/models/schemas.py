from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    url: str
    image_url: Optional[str] = None
    current_price: float
    currency: str = "USD"
    description: Optional[str] = None
    category: Optional[str] = None
    retailer: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class PriceHistoryItem(BaseModel):
    id: int
    price: float
    recorded_at: datetime
    
    class Config:
        from_attributes = True

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    price_history: List[PriceHistoryItem] = []
    
    class Config:
        from_attributes = True

class ProductSearch(BaseModel):
    query: str

class ScrapeRequest(BaseModel):
    url: str

class ScrapeResponse(BaseModel):
    success: bool
    product: Optional[Product] = None
    message: str

class FavoriteCreate(BaseModel):
    user_id: str
    product_id: int

class Favorite(BaseModel):
    id: int
    user_id: str
    product_id: int
    created_at: datetime
    product: Product
    
    class Config:
        from_attributes = True
