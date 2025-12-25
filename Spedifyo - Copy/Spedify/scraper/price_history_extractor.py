"""
Price History Tracker - Builds price history over time by capturing current prices
Instead of scraping historical data, this tracks prices each time products are checked
"""

from datetime import datetime
import re


class PriceHistoryExtractor:
    def __init__(self):
        pass
    
    def add_price_entry(self, product_name, current_price, platform="Unknown"):
        """
        Add a new price entry to track price over time
        
        Args:
            product_name: Name of the product
            current_price: Current price (e.g., "₹54,900")
            platform: Platform name (e.g., "Amazon", "Flipkart")
            
        Returns:
            Dictionary with the new price entry
        """
        try:
            now = datetime.now()
            
            entry = {
                "price": current_price,
                "platform": platform,
                "timestamp": now.isoformat(),
                "formatted_time": self._format_timestamp(now.isoformat())
            }
            
            return entry
            
        except Exception as e:
            print(f"❌ Error adding price entry: {e}")
            return None
    
    def calculate_statistics(self, price_history):
        """
        Calculate statistics from a list of price entries
        
        Args:
            price_history: List of price entries with 'price' field
            
        Returns:
            Dictionary with statistics
        """
        if not price_history:
            return {}
        
        try:
            # Extract numeric prices
            prices = []
            for entry in price_history:
                price_str = entry.get('price', '').replace('₹', '').replace(',', '')
                try:
                    prices.append(float(price_str))
                except:
                    continue
            
            if not prices:
                return {}
            
            current = price_history[-1].get('price', 'N/A')
            lowest = min(prices)
            highest = max(prices)
            average = sum(prices) / len(prices)
            
            stats = {
                "current_price": current,
                "lowest_price": f"₹{lowest:,.0f}",
                "highest_price": f"₹{highest:,.0f}",
                "average_price": f"₹{average:,.0f}",
                "total_entries": len(price_history)
            }
            
            # Calculate price drop if applicable
            if len(prices) > 1 and prices[-1] < prices[0]:
                drop = prices[0] - prices[-1]
                drop_percent = (drop / prices[0]) * 100
                stats["price_drop"] = f"₹{drop:,.0f} ({drop_percent:.1f}%)"
            
            # Calculate price increase if applicable
            elif len(prices) > 1 and prices[-1] > prices[0]:
                increase = prices[-1] - prices[0]
                increase_percent = (increase / prices[0]) * 100
                stats["price_increase"] = f"₹{increase:,.0f} (+{increase_percent:.1f}%)"
            
            return stats
            
        except Exception as e:
            print(f"❌ Error calculating statistics: {e}")
            return {}
    
    def _format_timestamp(self, timestamp):
        """
        Convert ISO timestamp to readable format like "12/12/25, 10:30 am"
        
        Args:
            timestamp: ISO format timestamp string
            
        Returns:
            Formatted timestamp string
        """
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            
            # Format as "12/12/25, 10:30 am" (Windows-compatible)
            day = dt.strftime('%d')
            month = dt.strftime('%m')
            year = dt.strftime('%y')
            hour = dt.strftime('%I').lstrip('0') or '12'  # Remove leading 0, handle midnight
            minute = dt.strftime('%M')
            ampm = dt.strftime('%p').lower()
            
            return f"{day}/{month}/{year}, {hour}:{minute} {ampm}"
            
        except Exception as e:
            # Return timestamp as-is if formatting fails
            return timestamp
