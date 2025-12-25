import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ScrapeForm from '../components/ScrapeForm';
import { productApi, scraperApi, favoritesApi } from '../services/api';
import { Product } from '../types';

const USER_ID = 'default-user'; // Simple user identification

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProducts();
    loadFavorites();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      showMessage('error', 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const data = await favoritesApi.getAll(USER_ID);
      setFavorites(new Set(data.map((f) => f.product_id)));
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const handleScrape = async (url: string) => {
    try {
      setIsScraping(true);
      const response = await scraperApi.scrape({ url });
      if (response.success) {
        showMessage('success', response.message);
        await loadProducts();
      } else {
        showMessage('error', response.message);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsScraping(false);
    }
  };

  const handleFavoriteToggle = async (productId: number) => {
    try {
      if (favorites.has(productId)) {
        await favoritesApi.remove(USER_ID, productId);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        showMessage('success', 'Removed from favorites');
      } else {
        await favoritesApi.add(USER_ID, productId);
        setFavorites((prev) => new Set(prev).add(productId));
        showMessage('success', 'Added to favorites');
      }
    } catch (error) {
      showMessage('error', 'Failed to update favorites');
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const data = await productApi.getAll(searchQuery);
      setProducts(data);
    } catch (error) {
      showMessage('error', 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const filteredProducts = searchQuery
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Price Tracker</h1>
        <p className="text-gray-600">
          Track product prices across the web with AI-powered scraping
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search products..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <div className="lg:col-span-1">
          <ScrapeForm onScrape={handleScrape} isLoading={isScraping} />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No products found. Add a product URL above to start tracking!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={favorites.has(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
