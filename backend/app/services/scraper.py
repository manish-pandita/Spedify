import requests
from bs4 import BeautifulSoup
from typing import Optional, Dict, Any
import re
import os
from openai import OpenAI
from urllib.parse import urlparse

class AIScraper:
    """AI-powered web scraper for extracting product information
    
    Security Note: This scraper accepts user-provided URLs and makes HTTP requests.
    In production, implement additional security measures:
    - URL validation and allowlist
    - Rate limiting per user/IP
    - Timeout enforcement
    - Request size limits
    - Network isolation
    """
    
    # Allowed URL schemes for scraping
    ALLOWED_SCHEMES = {'http', 'https'}
    # Blocked hosts (localhost, private IPs, etc.)
    BLOCKED_HOSTS = {
        'localhost', '127.0.0.1', '0.0.0.0',
        '169.254.169.254',  # AWS metadata
        '[::1]',  # IPv6 localhost
    }
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY", "")
        self.use_ai = bool(api_key and api_key != "your_openai_api_key_here")
        if self.use_ai:
            self.client = OpenAI(api_key=api_key)
    
    def _validate_url(self, url: str) -> None:
        """Validate URL to prevent SSRF attacks"""
        try:
            parsed = urlparse(url)
            
            # Check scheme
            if parsed.scheme not in self.ALLOWED_SCHEMES:
                raise ValueError(f"URL scheme '{parsed.scheme}' not allowed. Only {self.ALLOWED_SCHEMES} are permitted.")
            
            # Check for blocked hosts
            hostname = parsed.hostname or ''
            if hostname.lower() in self.BLOCKED_HOSTS:
                raise ValueError(f"Access to host '{hostname}' is not allowed.")
            
            # Check for private IP ranges (basic check)
            if hostname.startswith('10.') or hostname.startswith('192.168.') or hostname.startswith('172.'):
                raise ValueError("Access to private IP addresses is not allowed.")
                
        except Exception as e:
            raise ValueError(f"Invalid URL: {str(e)}")
    
    def scrape_product(self, url: str) -> Dict[str, Any]:
        """Scrape product information from a URL
        
        Security: Validates URL before making requests to prevent SSRF
        """
        # Validate URL before making request
        self._validate_url(url)
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'lxml')
            
            # Extract basic information
            product_data = {
                'url': url,
                'name': self._extract_name(soup),
                'current_price': self._extract_price(soup),
                'image_url': self._extract_image(soup, url),
                'description': self._extract_description(soup),
                'retailer': self._extract_retailer(url),
                'currency': 'USD'
            }
            
            # Enhance with AI if available
            if self.use_ai and product_data['name']:
                product_data['category'] = self._ai_categorize(product_data['name'])
            
            return product_data
            
        except Exception as e:
            raise Exception(f"Failed to scrape URL: {str(e)}")
    
    def _extract_name(self, soup: BeautifulSoup) -> str:
        """Extract product name from page"""
        # Try common selectors
        selectors = [
            'h1',
            '[itemprop="name"]',
            '.product-title',
            '#product-title',
            '.product-name',
            'meta[property="og:title"]'
        ]
        
        for selector in selectors:
            if selector.startswith('meta'):
                element = soup.select_one(selector)
                if element and element.get('content'):
                    return element['content']
            else:
                element = soup.select_one(selector)
                if element and element.text.strip():
                    return element.text.strip()
        
        return "Unknown Product"
    
    def _extract_price(self, soup: BeautifulSoup) -> float:
        """Extract price from page"""
        # Try to find price in various common formats
        price_patterns = [
            r'\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'(\d+(?:,\d{3})*(?:\.\d{2})?)\s*USD',
            r'price["\']?\s*:\s*["\']?(\d+(?:\.\d{2})?)'
        ]
        
        page_text = soup.get_text()
        
        for pattern in price_patterns:
            matches = re.findall(pattern, page_text)
            if matches:
                price_str = matches[0].replace(',', '')
                try:
                    return float(price_str)
                except ValueError:
                    continue
        
        # Try common price selectors
        selectors = [
            '[itemprop="price"]',
            '.price',
            '#price',
            '.product-price',
            'meta[property="og:price:amount"]'
        ]
        
        for selector in selectors:
            if selector.startswith('meta'):
                element = soup.select_one(selector)
                if element and element.get('content'):
                    try:
                        return float(element['content'])
                    except ValueError:
                        continue
            else:
                element = soup.select_one(selector)
                if element:
                    price_text = element.get('content') or element.text
                    price_match = re.search(r'(\d+(?:,\d{3})*(?:\.\d{2})?)', price_text)
                    if price_match:
                        try:
                            return float(price_match.group(1).replace(',', ''))
                        except ValueError:
                            continue
        
        return 0.0
    
    def _extract_image(self, soup: BeautifulSoup, base_url: str) -> Optional[str]:
        """Extract product image URL"""
        selectors = [
            'meta[property="og:image"]',
            '[itemprop="image"]',
            '.product-image img',
            '#product-image',
            '.main-image'
        ]
        
        for selector in selectors:
            if selector.startswith('meta'):
                element = soup.select_one(selector)
                if element and element.get('content'):
                    return element['content']
            else:
                element = soup.select_one(selector)
                if element:
                    src = element.get('src') or element.get('data-src')
                    if src:
                        if src.startswith('http'):
                            return src
                        elif src.startswith('//'):
                            return 'https:' + src
        
        return None
    
    def _extract_description(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract product description"""
        selectors = [
            'meta[name="description"]',
            'meta[property="og:description"]',
            '[itemprop="description"]',
            '.product-description',
            '#product-description'
        ]
        
        for selector in selectors:
            if selector.startswith('meta'):
                element = soup.select_one(selector)
                if element and element.get('content'):
                    desc = element['content'].strip()
                    return desc[:500] if len(desc) > 500 else desc
            else:
                element = soup.select_one(selector)
                if element and element.text.strip():
                    desc = element.text.strip()
                    return desc[:500] if len(desc) > 500 else desc
        
        return None
    
    def _extract_retailer(self, url: str) -> str:
        """Extract retailer name from URL"""
        from urllib.parse import urlparse
        domain = urlparse(url).netloc
        # Remove www. and common TLDs
        retailer = domain.replace('www.', '').split('.')[0]
        return retailer.capitalize()
    
    def _ai_categorize(self, product_name: str) -> str:
        """Use AI to categorize the product"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a product categorization assistant. Categorize products into one of these categories: Electronics, Clothing, Home & Garden, Sports, Books, Toys, Food & Beverage, Health & Beauty, Automotive, Other. Respond with only the category name."
                    },
                    {
                        "role": "user",
                        "content": f"Categorize this product: {product_name}"
                    }
                ],
                max_tokens=20,
                temperature=0.3
            )
            category = response.choices[0].message.content.strip()
            return category
        except Exception:
            return "Other"
