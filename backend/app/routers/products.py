from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import models, schemas
from datetime import datetime, timezone

router = APIRouter()

@router.get("/", response_model=List[schemas.Product])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all products with optional filtering"""
    query = db.query(models.Product)
    
    if search:
        query = query.filter(
            models.Product.name.contains(search) | 
            models.Product.description.contains(search)
        )
    
    if category:
        query = query.filter(models.Product.category == category)
    
    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=schemas.Product)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=schemas.Product)
async def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    # Check if product with URL already exists
    existing = db.query(models.Product).filter(models.Product.url == product.url).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this URL already exists")
    
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Add initial price to history
    price_history = models.PriceHistory(
        product_id=db_product.id,
        price=product.current_price
    )
    db.add(price_history)
    db.commit()
    db.refresh(db_product)
    
    return db_product

@router.put("/{product_id}", response_model=schemas.Product)
async def update_product(
    product_id: int,
    product_update: schemas.ProductCreate,
    db: Session = Depends(get_db)
):
    """Update a product and track price changes"""
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if price changed
    if product_update.current_price != db_product.current_price:
        price_history = models.PriceHistory(
            product_id=product_id,
            price=product_update.current_price
        )
        db.add(price_history)
    
    # Update product fields
    for key, value in product_update.model_dump().items():
        setattr(db_product, key, value)
    
    db_product.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_product)
    
    return db_product

@router.delete("/{product_id}")
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product"""
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    
    return {"message": "Product deleted successfully"}

@router.get("/{product_id}/history", response_model=List[schemas.PriceHistoryItem])
async def get_price_history(product_id: int, db: Session = Depends(get_db)):
    """Get price history for a product"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    history = db.query(models.PriceHistory).filter(
        models.PriceHistory.product_id == product_id
    ).order_by(models.PriceHistory.recorded_at).all()
    
    return history
