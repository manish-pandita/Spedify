from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import models, schemas
from app.services.scraper import AIScraper
from datetime import datetime, timezone

router = APIRouter()
scraper = AIScraper()

@router.post("/scrape", response_model=schemas.ScrapeResponse)
async def scrape_url(request: schemas.ScrapeRequest, db: Session = Depends(get_db)):
    """Scrape a URL and extract product information"""
    try:
        # Scrape the product data
        product_data = scraper.scrape_product(request.url)
        
        if not product_data['name'] or product_data['current_price'] == 0.0:
            return schemas.ScrapeResponse(
                success=False,
                message="Could not extract product information from URL"
            )
        
        # Check if product already exists
        existing = db.query(models.Product).filter(models.Product.url == request.url).first()
        
        if existing:
            # Update existing product
            if product_data['current_price'] != existing.current_price:
                price_history = models.PriceHistory(
                    product_id=existing.id,
                    price=product_data['current_price']
                )
                db.add(price_history)
            
            for key, value in product_data.items():
                if key != 'url':  # Don't update URL
                    setattr(existing, key, value)
            
            existing.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing)
            
            return schemas.ScrapeResponse(
                success=True,
                product=existing,
                message="Product updated successfully"
            )
        else:
            # Create new product
            db_product = models.Product(**product_data)
            db.add(db_product)
            db.commit()
            db.refresh(db_product)
            
            # Add initial price to history
            price_history = models.PriceHistory(
                product_id=db_product.id,
                price=product_data['current_price']
            )
            db.add(price_history)
            db.commit()
            db.refresh(db_product)
            
            return schemas.ScrapeResponse(
                success=True,
                product=db_product,
                message="Product scraped and added successfully"
            )
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
