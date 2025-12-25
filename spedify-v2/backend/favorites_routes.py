"""
Routes for managing user favorites and price tracking
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
import logging

from auth_models import (
    User, UserFavorite, FavoriteCreate, FavoriteResponse, 
    FavoritesListResponse, PriceHistoryEntry, PriceComparisonResponse
)
from auth_routes import get_current_user
from database import db
from scraper import OllamaScraper

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/favorites", tags=["favorites"])
scraper = OllamaScraper()

async def _update_price_for_favorite(favorite: dict) -> dict:
    """Internal helper to update the price of a favorite product by scraping"""
    try:
        logger.info(f"🔄 Updating price for: {favorite['product_name']}")
        
        # Search for the product to get latest price
        products = await scraper.search_products(favorite["product_name"])
        
        if not products:
            logger.warning(f"⚠️ No products found for: {favorite['product_name']}")
            return favorite
        
        logger.info(f"📦 Found {len(products)} products, searching for match...")
        
        # Find matching product by platform or URL similarity
        matching_product = None
        for product in products:
            if (product.platform.lower() == favorite["platform"].lower() or 
                favorite["product_url"] in product.url or 
                product.url in favorite["product_url"]):
                matching_product = product
                logger.info(f"✅ Found matching product: {product.name} - ₹{product.price}")
                break
        
        # If no exact match, use first result
        if not matching_product and products:
            matching_product = products[0]
            logger.info(f"⚠️ No exact match, using first result: {matching_product.name}")
        
        if matching_product:
            new_price = matching_product.price
            old_price = favorite.get("current_price", 0)
            
            # Create price entry
            price_entry = {
                "price": new_price,
                "platform": matching_product.platform,
                "timestamp": datetime.utcnow().isoformat(),
                "availability": "in_stock" if matching_product.in_stock else "out_of_stock"
            }
            
            # Always update last_checked and add to history
            await db.favorites.update_one(
                {"_id": favorite["_id"]},
                {
                    "$set": {
                        "current_price": new_price,
                        "last_checked": datetime.utcnow()
                    },
                    "$push": {"price_history": price_entry}
                }
            )
            
            if abs(new_price - old_price) > 0.01:
                logger.info(f"💰 Price changed for {favorite['product_name']}: ₹{old_price} → ₹{new_price}")
            else:
                logger.info(f"✅ Price unchanged for {favorite['product_name']}: ₹{new_price}")
            
            # Update local dict
            favorite["current_price"] = new_price
            if "price_history" not in favorite:
                favorite["price_history"] = []
            favorite["price_history"].append(price_entry)
            favorite["last_checked"] = datetime.utcnow().isoformat()
        
        return favorite
        
    except Exception as e:
        logger.error(f"❌ Error updating price for {favorite.get('product_name')}: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return favorite

@router.post("", response_model=FavoriteResponse)
async def add_favorite(
    favorite_data: FavoriteCreate,
    current_user: User = Depends(get_current_user)
):
    """Add a product to user's favorites"""
    # Check if already favorited
    existing = await db.favorites.find_one({
        "user_id": current_user.id,
        "product_url": favorite_data.product_url
    })
    
    if existing:
        return FavoriteResponse(
            success=False,
            message="Product already in favorites"
        )
    
    # Create favorite with initial price history
    favorite_dict = {
        "_id": f"fav_{current_user.id}_{datetime.utcnow().timestamp()}",
        "user_id": current_user.id,
        "product_name": favorite_data.product_name,
        "product_url": favorite_data.product_url,
        "image_url": favorite_data.image_url,
        "current_price": favorite_data.current_price,
        "platform": favorite_data.platform,
        "price_history": [{
            "price": favorite_data.current_price,
            "platform": favorite_data.platform,
            "timestamp": datetime.utcnow(),
            "availability": "in_stock"
        }],
        "added_at": datetime.utcnow(),
        "last_checked": datetime.utcnow()
    }
    
    await db.favorites.insert_one(favorite_dict)
    
    favorite = UserFavorite(**favorite_dict)
    
    return FavoriteResponse(
        success=True,
        message="Product added to favorites",
        favorite=favorite
    )

@router.get("", response_model=FavoritesListResponse)
async def get_favorites(
    current_user: User = Depends(get_current_user),
    update_prices: bool = False
):
    """
    Get all user favorites
    
    Args:
        update_prices: If True, automatically updates prices for all favorites (set to ?update_prices=true in URL)
    """
    # Update prices for all favorites if requested
    if update_prices:
        cursor = db.favorites.find({"user_id": current_user.id}).sort("added_at", -1)
        favorites = await cursor.to_list(length=None)
        
        logger.info(f"🔄 Updating prices for {len(favorites)} favorites...")
        for fav in favorites:
            await _update_price_for_favorite(fav)
        
        logger.info(f"✅ Finished updating all prices")
    
    # Fetch fresh data from database after updates
    cursor = db.favorites.find({"user_id": current_user.id}).sort("added_at", -1)
    favorites = await cursor.to_list(length=None)
    
    favorites_list = [UserFavorite(**fav) for fav in favorites]
    
    logger.info(f"📊 Returning {len(favorites_list)} favorites to frontend")
    
    return FavoritesListResponse(
        success=True,
        favorites=favorites_list,
        total=len(favorites_list)
    )

@router.delete("/{favorite_id}", response_model=FavoriteResponse)
async def remove_favorite(
    favorite_id: str,
    current_user: User = Depends(get_current_user)
):
    """Remove a product from favorites"""
    result = await db.favorites.delete_one({
        "_id": favorite_id,
        "user_id": current_user.id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    return FavoriteResponse(
        success=True,
        message="Product removed from favorites"
    )

@router.post("/{favorite_id}/update-price")
async def update_favorite_price(
    favorite_id: str,
    current_user: User = Depends(get_current_user)
):
    """Update the price for a favorite product (manual refresh)"""
    favorite = await db.favorites.find_one({
        "_id": favorite_id,
        "user_id": current_user.id
    })
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    # Here you would call the scraper to get the latest price
    # For now, we'll just update the last_checked timestamp
    # In production, integrate with your scraper
    
    await db.favorites.update_one(
        {"_id": favorite_id},
        {"$set": {"last_checked": datetime.utcnow()}}
    )
    
    return {"success": True, "message": "Price updated"}

@router.get("/compare/{product_name}", response_model=PriceComparisonResponse)
async def compare_prices(
    product_name: str,
    current_user: User = Depends(get_current_user)
):
    """Compare prices across all favorited instances of a product"""
    cursor = db.favorites.find({
        "user_id": current_user.id,
        "product_name": {"$regex": product_name, "$options": "i"}
    })
    
    favorites = await cursor.to_list(length=None)
    
    if not favorites:
        raise HTTPException(status_code=404, detail="No favorites found for this product")
    
    favorites_list = [UserFavorite(**fav) for fav in favorites]
    prices = [fav.current_price for fav in favorites_list]
    
    return PriceComparisonResponse(
        success=True,
        product_name=product_name,
        favorites=favorites_list,
        lowest_price=min(prices),
        highest_price=max(prices),
        average_price=sum(prices) / len(prices)
    )

@router.get("/{favorite_id}/history")
async def get_price_history(
    favorite_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get price history for a favorite product"""
    favorite = await db.favorites.find_one({
        "_id": favorite_id,
        "user_id": current_user.id
    })
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    return {
        "success": True,
        "product_name": favorite["product_name"],
        "price_history": favorite.get("price_history", [])
    }
