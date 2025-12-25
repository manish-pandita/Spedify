import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { favoritesApi } from '../services/api';
import { Favorite } from '../types';

const USER_ID = 'default-user';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const data = await favoritesApi.getAll(USER_ID);
      setFavorites(data);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      showMessage('error', 'Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = async (productId: number) => {
    try {
      await favoritesApi.remove(USER_ID, productId);
      setFavorites((prev) => prev.filter((f) => f.product_id !== productId));
      showMessage('success', 'Removed from favorites');
    } catch (error) {
      showMessage('error', 'Failed to remove from favorites');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

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
        <div className="flex items-center mb-2">
          <Heart className="text-red-500 mr-2" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
        </div>
        <p className="text-gray-600">
          Products you're tracking closely
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading favorites...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Heart className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-600 text-lg">No favorites yet</p>
          <p className="text-gray-500 mt-2">
            Start adding products to your favorites to track them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <ProductCard
              key={favorite.id}
              product={favorite.product}
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
