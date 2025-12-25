"""
MongoDB database configuration and operations
"""

from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
import os
from datetime import datetime, timedelta
import logging

from models import Product, ProductDetails

logger = logging.getLogger(__name__)

class Database:
    """MongoDB database wrapper"""
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.products_collection = None
        self.searches_collection = None
        self.cache_collection = None
        self.users = None
        self.favorites = None
        
    async def connect(self):
        """Connect to MongoDB"""
        try:
            # Get MongoDB URL from environment or use default
            mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
            
            self.client = AsyncIOMotorClient(mongo_url)
            self.db = self.client["spedify"]
            self.products_collection = self.db["products"]
            self.searches_collection = self.db["searches"]
            self.cache_collection = self.db["cache"]
            self.users = self.db["users"]
            self.favorites = self.db["favorites"]
            
            # Create indexes
            await self.products_collection.create_index("id", unique=True)
            await self.products_collection.create_index("name")
            await self.cache_collection.create_index("query")
            await self.cache_collection.create_index(
                "created_at",
                expireAfterSeconds=3600  # Cache expires after 1 hour
            )
            await self.users.create_index("email", unique=True)
            await self.users.create_index("username", unique=True)
            await self.favorites.create_index([("user_id", 1), ("product_url", 1)])
            
            logger.info("✅ MongoDB connected successfully")
            
        except Exception as e:
            logger.error(f"❌ MongoDB connection error: {str(e)}")
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("MongoDB disconnected")
    
    async def save_product(self, product: ProductDetails) -> bool:
        """Save product to database"""
        try:
            product_data = product.dict()
            product_data["updated_at"] = datetime.now()
            
            await self.products_collection.update_one(
                {"id": product.product.id},
                {"$set": product_data},
                upsert=True
            )
            return True
        except Exception as e:
            logger.error(f"Error saving product: {str(e)}")
            return False
    
    async def get_product(self, product_id: str) -> Optional[ProductDetails]:
        """Get product from database"""
        try:
            product_data = await self.products_collection.find_one({"id": product_id})
            if product_data:
                return ProductDetails(**product_data)
            return None
        except Exception as e:
            logger.error(f"Error fetching product: {str(e)}")
            return None
    
    async def cache_search_results(self, query: str, products: List[Product]):
        """Cache search results"""
        try:
            cache_data = {
                "query": query.lower(),
                "products": [p.dict() for p in products],
                "created_at": datetime.now(),
                "count": len(products)
            }
            
            await self.cache_collection.update_one(
                {"query": query.lower()},
                {"$set": cache_data},
                upsert=True
            )
            
            # Also log the search
            await self.searches_collection.insert_one({
                "query": query,
                "result_count": len(products),
                "timestamp": datetime.now()
            })
            
        except Exception as e:
            logger.error(f"Error caching search: {str(e)}")
    
    async def get_cached_search(
        self, 
        query: str, 
        page: int = 1, 
        limit: int = 20
    ) -> Optional[List[Product]]:
        """Get cached search results"""
        try:
            # Check if cache exists and is not expired (checked by TTL index)
            cache_data = await self.cache_collection.find_one(
                {"query": query.lower()}
            )
            
            if cache_data:
                products = [Product(**p) for p in cache_data["products"]]
                
                # Apply pagination
                start = (page - 1) * limit
                end = start + limit
                return products[start:end]
            
            return None
        except Exception as e:
            logger.error(f"Error fetching cached search: {str(e)}")
            return None
    
    async def get_stats(self) -> dict:
        """Get application statistics"""
        try:
            total_products = await self.products_collection.count_documents({})
            total_searches = await self.searches_collection.count_documents({})
            
            # Get top searches
            pipeline = [
                {"$group": {
                    "_id": "$query",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"count": -1}},
                {"$limit": 10}
            ]
            top_searches = await self.searches_collection.aggregate(pipeline).to_list(10)
            
            return {
                "total_products": total_products,
                "total_searches": total_searches,
                "top_searches": top_searches
            }
        except Exception as e:
            logger.error(f"Error fetching stats: {str(e)}")
            return {}

# Global database instance
db = Database()
