"""
Ollama-based scraper for BuyHatke product search
Uses the original Spedify V1 scraper logic
"""

import sys
import os
import importlib.util

# Import the original V1 scraper directly using importlib
scraper_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'scraper', 'ollama_scraper.py'))

import asyncio
from typing import List, Optional
from datetime import datetime
import logging
import random

from models import Product, ProductDetails, DealScanner, PlatformPrice

# Import original scraper using importlib to avoid naming conflicts
try:
    spec = importlib.util.spec_from_file_location("ollama_scraper_v1", scraper_path)
    ollama_scraper_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ollama_scraper_module)
    OllamaBuyHatkeScraper = ollama_scraper_module.OllamaBuyHatkeScraper
    SCRAPER_AVAILABLE = True
    print(f"✅ Successfully imported OllamaBuyHatkeScraper from: {scraper_path}")
except Exception as e:
    SCRAPER_AVAILABLE = False
    print(f"⚠️ Original scraper not available: {e}")
    print(f"⚠️ Tried to import from: {scraper_path}")

logger = logging.getLogger(__name__)

class OllamaScraper:
    """Scraper using original Spedify V1 logic with async wrapper"""
    
    def __init__(self):
        self.ollama_url = "http://localhost:11434/api/generate"
        self.model = "llama2"
        self.buyhatke_base = "https://buyhatke.com"
        
        # Initialize original scraper if available (now with Groq support!)
        if SCRAPER_AVAILABLE:
            try:
                # Pass Groq API key from environment
                groq_api_key = os.getenv('GROQ_API_KEY')
                self.original_scraper = OllamaBuyHatkeScraper(groq_api_key=groq_api_key)
                logger.info("✅ Original Spedify V1 scraper initialized (with Groq + BeautifulSoup)")
            except Exception as e:
                logger.warning(f"⚠️ Could not initialize original scraper: {e}")
                self.original_scraper = None
        else:
            self.original_scraper = None
        
    async def search_products(self, query: str) -> List[Product]:
        """
        Search for products on BuyHatke using original scraper
        
        Args:
            query: Search query string
            
        Returns:
            List of Product objects
        """
        try:
            logger.info(f"🔍 Searching for: {query}")
            
            # Use original scraper if available
            if self.original_scraper:
                # Run synchronous scraper in thread pool to avoid blocking
                loop = asyncio.get_event_loop()
                logger.info(f"🔄 Calling V1 scraper for: {query}")
                products_data = await loop.run_in_executor(
                    None, 
                    self.original_scraper.search_products,
                    query
                )
                
                logger.info(f"📦 V1 scraper returned type: {type(products_data)}, length: {len(products_data) if isinstance(products_data, list) else 'N/A'}")
                
                if products_data:
                    logger.info(f"📝 First product sample: {products_data[0] if isinstance(products_data, list) and len(products_data) > 0 else 'No products'}")
                
                if products_data and isinstance(products_data, list):
                    # Convert to Product model format
                    products = []
                    for i, prod in enumerate(products_data):
                        try:
                            # Extract numeric price from V1's price text
                            price_numeric = self._extract_price_numeric(prod.get('price', '0'))
                            
                            # Check if product is available (V1 uses 'availability_status')
                            is_available = prod.get('availability_status', '').lower() != 'out of stock'
                            
                            image_url = prod.get('image_url', '')
                            
                            # Get the BuyHatke detail URL (the comparison page)
                            buyhatke_detail_url = prod.get('buyhatke_detail_url', '')
                            
                            # The 'url' field from V1 now contains the actual retailer URL (Amazon/Flipkart)
                            # thanks to JSON extraction method!
                            product_url = prod.get('url', '')
                            
                            # If URL starts with /, it's a relative BuyHatke path, use buyhatke_detail_url instead
                            if product_url.startswith('/') and buyhatke_detail_url:
                                product_url = buyhatke_detail_url
                            
                            product = Product(
                                id=prod.get('id', f"prod_{i}_{int(datetime.now().timestamp())}"),
                                name=prod.get('name', query),
                                price=price_numeric,
                                price_text=prod.get('price', 'N/A'),
                                platform=prod.get('platform', 'BuyHatke'),
                                url=product_url,
                                image_url=image_url,
                                buyhatke_url=buyhatke_detail_url,
                                availability_status=prod.get('availability_status', 'Available'),
                                in_stock=is_available,
                                rating=prod.get('rating'),
                                reviews_count=prod.get('reviews_count'),
                                extracted_at=datetime.now()
                            )
                            products.append(product)
                            
                            if not image_url:
                                logger.warning(f"⚠️ No image for: {product.name[:50]}...")
                            logger.info(f"✅ Converted product: {product.name[:50]}... - ₹{product.price}")
                        except Exception as e:
                            logger.warning(f"⚠️ Error converting product {i}: {e}")
                            logger.warning(f"   Product data: {prod}")
                            continue
                    
                    if products:
                        logger.info(f"✅ Found {len(products)} products from original scraper")
                        return products
                    else:
                        logger.warning(f"⚠️ Original scraper returned empty list")
            else:
                logger.warning(f"⚠️ Original scraper not available")
            
            # Fallback to mock data
            logger.warning(f"⚠️ Using mock data fallback for query: {query}")
            return self._generate_mock_products(query)
            
        except Exception as e:
            logger.error(f"❌ Search error: {str(e)}, using mock data")
            return self._generate_mock_products(query)
    
    def _extract_price_numeric(self, price_text: str) -> float:
        """Extract numeric price from text"""
        import re
        try:
            # Remove currency symbols and commas
            price_clean = re.sub(r'[₹$,\s]', '', price_text)
            return float(price_clean)
        except:
            return 0.0
    
    async def get_product_details(
        self, 
        url: str, 
        product_name: Optional[str] = None
    ) -> Optional[ProductDetails]:
        """
        Get detailed product information using original scraper
        
        Args:
            url: Product or BuyHatke URL
            product_name: Optional product name
            
        Returns:
            ProductDetails object
        """
        try:
            logger.info(f"📊 Analyzing product: {url}")
            
            # Use original scraper if available
            if self.original_scraper:
                loop = asyncio.get_event_loop()
                details_data = await loop.run_in_executor(
                    None,
                    self.original_scraper.get_product_details,
                    url,
                    product_name
                )
                
                if details_data and isinstance(details_data, dict) and details_data.get('success'):
                    # Convert to ProductDetails format
                    price_comparisons = []
                    for price_item in details_data.get('price_comparison', []):
                        price_comparisons.append(PlatformPrice(
                            platform=price_item.get('platform', 'Unknown'),
                            price=price_item.get('price', 'N/A'),
                            price_numeric=price_item.get('price_numeric', 0),
                            availability=price_item.get('availability', 'Available'),
                            url=price_item.get('url', ''),
                            seller=price_item.get('seller'),
                            is_best_price=price_item.get('is_best_price', False)
                        ))
                    
                    # Extract deal scanner data if available
                    deal_scanner = None
                    if details_data.get('deal_scanner'):
                        ds = details_data['deal_scanner']
                        deal_scanner = DealScanner(
                            deal_score=ds.get('deal_score', 0),
                            price_analytics=ds.get('price_analytics', {}),
                            score_breakdown=ds.get('score_breakdown', []),
                            recommendation=ds.get('recommendation', '')
                        )
                    
                    product_details = ProductDetails(
                        product_name=details_data.get('product_name', product_name or 'Unknown'),
                        current_price=details_data.get('current_price', 'N/A'),
                        lowest_price=details_data.get('lowest_price', 'N/A'),
                        highest_price=details_data.get('highest_price', 'N/A'),
                        price_comparison=price_comparisons,
                        total_platforms=details_data.get('total_platforms', len(price_comparisons)),
                        deal_scanner=deal_scanner,
                        source_url=url,
                        timestamp=datetime.now()
                    )
                    
                    logger.info(f"✅ Fetched details with {len(price_comparisons)} platforms")
                    return product_details
            
            logger.warning("⚠️ Original scraper not available for product details")
            return None
            
        except Exception as e:
            logger.error(f"❌ Error getting product details: {str(e)}")
            return None
    
    def _generate_mock_products(self, query: str) -> List[Product]:
        """Generate mock product data for testing/fallback"""
        mock_products = []
        platforms = ["Amazon", "Flipkart", "Snapdeal", "Tata CLiQ"]
        
        for i in range(10):
            base_price = random.randint(5000, 50000)
            platform = random.choice(platforms)
            
            product = Product(
                id=f"mock_{i}_{int(datetime.now().timestamp())}",
                name=f"{query} - Model {i+1}",
                price=base_price,
                price_text=f"₹{base_price:,}",
                platform=platform,
                url=f"{self.buyhatke_base}/product/mock_{i}",
                image_url=f"https://via.placeholder.com/300x300?text={query.replace(' ', '+')}+{i+1}",
                availability_status="In Stock",
                in_stock=True,
                rating=round(random.uniform(3.5, 5.0), 1),
                reviews_count=random.randint(100, 5000),
                extracted_at=datetime.now()
            )
            mock_products.append(product)
        
        logger.info(f"📦 Generated {len(mock_products)} mock products for '{query}'")
        return mock_products
