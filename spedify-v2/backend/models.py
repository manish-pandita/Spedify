"""
Pydantic models for API request/response validation
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class Product(BaseModel):
    """Product model"""
    id: str
    name: str
    price: float
    price_text: str
    platform: str
    url: str
    image_url: Optional[str] = None
    availability_status: str = "Available"
    in_stock: bool = True
    buyhatke_url: Optional[str] = None
    extracted_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "prod_123",
                "name": "iPhone 15 Pro",
                "price": 129900,
                "price_text": "₹1,29,900",
                "platform": "Amazon",
                "url": "https://amazon.in/...",
                "availability_status": "In Stock",
                "in_stock": True
            }
        }

class DealScanner(BaseModel):
    """Deal Scanner information"""
    deal_score: Optional[int] = None
    deal_rating: Optional[str] = None
    deal_description: Optional[str] = None
    price_analytics: Optional[Dict[str, Any]] = None
    score_breakdown: Optional[List[str]] = None

class PlatformPrice(BaseModel):
    """Price from a specific platform"""
    platform: str
    price: str
    price_numeric: float
    availability: str = "Available"
    url: Optional[str] = None

class ProductDetails(BaseModel):
    """Detailed product information with price comparison"""
    success: bool = True
    product: Product
    deal_scanner: Optional[DealScanner] = None
    price_comparison: List[PlatformPrice] = []
    price_history: Optional[List[Dict[str, Any]]] = None
    best_price: Optional[PlatformPrice] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "product": {
                    "name": "iPhone 15 Pro",
                    "price": 129900
                },
                "price_comparison": [
                    {
                        "platform": "Amazon",
                        "price": "₹1,29,900",
                        "price_numeric": 129900
                    }
                ]
            }
        }

class SearchResponse(BaseModel):
    """Search API response"""
    success: bool = True
    query: str
    products: List[Product]
    total: int
    page: int = 1
    limit: int = 20
    cached: bool = False
    timestamp: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "query": "iPhone 15",
                "products": [],
                "total": 50,
                "page": 1,
                "limit": 20
            }
        }
