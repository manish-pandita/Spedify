from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import models, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Favorite])
async def get_favorites(user_id: str, db: Session = Depends(get_db)):
    """Get all favorites for a user"""
    favorites = db.query(models.Favorite).filter(
        models.Favorite.user_id == user_id
    ).all()
    return favorites

@router.post("/", response_model=schemas.Favorite)
async def add_favorite(favorite: schemas.FavoriteCreate, db: Session = Depends(get_db)):
    """Add a product to favorites"""
    # Check if product exists
    product = db.query(models.Product).filter(models.Product.id == favorite.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if already favorited
    existing = db.query(models.Favorite).filter(
        models.Favorite.user_id == favorite.user_id,
        models.Favorite.product_id == favorite.product_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Product already in favorites")
    
    db_favorite = models.Favorite(**favorite.model_dump())
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    
    return db_favorite

@router.delete("/{favorite_id}")
async def remove_favorite(favorite_id: int, db: Session = Depends(get_db)):
    """Remove a product from favorites"""
    favorite = db.query(models.Favorite).filter(models.Favorite.id == favorite_id).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(favorite)
    db.commit()
    
    return {"message": "Favorite removed successfully"}

@router.delete("/user/{user_id}/product/{product_id}")
async def remove_favorite_by_product(
    user_id: str,
    product_id: int,
    db: Session = Depends(get_db)
):
    """Remove a specific product from user's favorites"""
    favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == user_id,
        models.Favorite.product_id == product_id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(favorite)
    db.commit()
    
    return {"message": "Favorite removed successfully"}
