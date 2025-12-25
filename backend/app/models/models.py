from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime, timezone

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    url = Column(String, unique=True, index=True)
    image_url = Column(String, nullable=True)
    current_price = Column(Float)
    currency = Column(String, default="USD")
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    retailer = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    price_history = relationship("PriceHistory", back_populates="product", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="product", cascade="all, delete-orphan")


class PriceHistory(Base):
    __tablename__ = "price_history"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    price = Column(Float)
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    product = relationship("Product", back_populates="price_history")


class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)  # Simple user identifier (can be enhanced with auth)
    product_id = Column(Integer, ForeignKey("products.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    product = relationship("Product", back_populates="favorites")
