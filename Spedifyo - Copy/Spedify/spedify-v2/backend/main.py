"""
FastAPI Backend for Spedify V2
Price comparison and product search using Ollama and BuyHatke
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List, Optional
import logging

from models import Product, ProductDetails, SearchResponse
from database import db
from scraper import OllamaScraper
import auth_routes
import favorites_routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Spedify API",
    description="Product price comparison API using Ollama and BuyHatke",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router)
app.include_router(favorites_routes.router)

# Initialize scraper
scraper = OllamaScraper()

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    await db.connect()
    logger.info("✅ Database connected")
    logger.info("✅ Ollama scraper initialized")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await db.disconnect()
    logger.info("Database disconnected")

@app.get("/")
async def root():
    """API health check"""
    return {
        "name": "Spedify API",
        "version": "2.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/search/{query}", response_model=SearchResponse)
async def search_products(
    query: str,
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=200)
):
    """
    Search for products across multiple platforms
    
    Args:
        query: Search query string
        page: Page number (default: 1)
        limit: Number of results per page (default: 100)
    
    Returns:
        SearchResponse with products and pagination info
    """
    try:
        logger.info(f"🔍 Search request: '{query}' (page {page}, limit {limit})")
        
        # Log the search for analytics
        await db.searches_collection.insert_one({
            "query": query.lower().strip(),
            "timestamp": datetime.now(),
            "page": page,
            "limit": limit
        })
        
        # Always scrape fresh data (no caching)
        products = await scraper.search_products(query)
        
        if not products:
            logger.warning(f"⚠️ No products found for query: {query}")
            return SearchResponse(
                success=False,
                query=query,
                products=[],
                total=0,
                page=page,
                limit=limit,
                cached=False
            )
        
        logger.info(f"✅ Found {len(products)} products, returning all")
        
        return SearchResponse(
            success=True,
            query=query,
            products=products,  # Return all products, no pagination on backend
            total=len(products),
            page=page,
            limit=limit,
            cached=False
        )
        
    except Exception as e:
        logger.error(f"❌ Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/product/{product_id}", response_model=ProductDetails)
async def get_product_details(product_id: str):
    """
    Get detailed information about a specific product
    
    Args:
        product_id: Product ID
    
    Returns:
        ProductDetails with price history and comparison
    """
    try:
        logger.info(f"🔍 Product details request: {product_id}")
        
        # Get from database
        product = await db.get_product(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return product
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching product details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/product/analyze", response_model=ProductDetails)
async def analyze_product(
    url: str = Query(..., description="Product or BuyHatke URL"),
    name: Optional[str] = Query(None, description="Product name")
):
    """
    Analyze a product from URL and get price comparison
    
    Args:
        url: Product URL or BuyHatke URL
        name: Optional product name for better matching
    
    Returns:
        ProductDetails with analysis and price comparison
    """
    try:
        logger.info(f"🔍 Analyzing product: {url}")
        
        # Fetch product details using scraper
        details = await scraper.get_product_details(url, name)
        
        if not details:
            raise HTTPException(status_code=404, detail="Could not analyze product")
        
        # Save to database
        await db.save_product(details)
        
        return details
        
    except Exception as e:
        logger.error(f"❌ Error analyzing product: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def get_stats():
    """Get application statistics"""
    try:
        stats = await db.get_stats()
        return {
            "success": True,
            "stats": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"❌ Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
