import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ExternalLink } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onFavoriteToggle?: (productId: number) => void;
  isFavorite?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onFavoriteToggle, isFavorite }) => {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const getPriceChange = () => {
    if (product.price_history && product.price_history.length >= 2) {
      const sorted = [...product.price_history].sort(
        (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
      );
      const oldPrice = sorted[sorted.length - 2].price;
      const change = ((product.current_price - oldPrice) / oldPrice) * 100;
      return change;
    }
    return null;
  };

  const priceChange = getPriceChange();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/product/${product.id}`} className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 hover:text-primary-600 line-clamp-2">
              {product.name}
            </h3>
          </Link>
          {onFavoriteToggle && (
            <button
              onClick={() => onFavoriteToggle(product.id)}
              className="ml-2 p-1 rounded-full hover:bg-gray-100"
            >
              <Heart
                size={20}
                className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
              />
            </button>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-2xl font-bold text-primary-600">
              {formatPrice(product.current_price, product.currency)}
            </div>
            {priceChange !== null && (
              <div
                className={`text-sm ${
                  priceChange > 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {priceChange > 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(1)}%
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          {product.retailer && (
            <span className="bg-gray-100 px-2 py-1 rounded">{product.retailer}</span>
          )}
          {product.category && (
            <span className="text-xs text-gray-400">{product.category}</span>
          )}
        </div>

        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
        >
          <span>View on {product.retailer}</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
