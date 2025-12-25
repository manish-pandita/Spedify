import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ExternalLink, Trash2 } from 'lucide-react';
import PriceChart from '../components/PriceChart';
import { productApi, favoritesApi } from '../services/api';
import { Product } from '../types';

const USER_ID = 'default-user';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (id) {
      loadProduct(parseInt(id));
      checkFavorite(parseInt(id));
    }
  }, [id]);

  const loadProduct = async (productId: number) => {
    try {
      setIsLoading(true);
      const data = await productApi.getById(productId);
      setProduct(data);
    } catch (error) {
      console.error('Failed to load product:', error);
      showMessage('error', 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const checkFavorite = async (productId: number) => {
    try {
      const favorites = await favoritesApi.getAll(USER_ID);
      setIsFavorite(favorites.some((f) => f.product_id === productId));
    } catch (error) {
      console.error('Failed to check favorite:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!product) return;

    try {
      if (isFavorite) {
        await favoritesApi.remove(USER_ID, product.id);
        setIsFavorite(false);
        showMessage('success', 'Removed from favorites');
      } else {
        await favoritesApi.add(USER_ID, product.id);
        setIsFavorite(true);
        showMessage('success', 'Added to favorites');
      }
    } catch (error) {
      showMessage('error', 'Failed to update favorites');
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productApi.delete(product.id);
      showMessage('success', 'Product deleted');
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      showMessage('error', 'Failed to delete product');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Product not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

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

      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex space-x-2">
                <button
                  onClick={handleFavoriteToggle}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Heart
                    size={24}
                    className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                  />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-full hover:bg-red-50 text-red-600"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {formatPrice(product.current_price, product.currency)}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.retailer && (
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {product.retailer}
                  </span>
                )}
                {product.category && (
                  <span className="bg-primary-100 px-3 py-1 rounded-full text-sm text-primary-800">
                    {product.category}
                  </span>
                )}
              </div>
            </div>

            {product.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}

            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700"
            >
              <span>View on {product.retailer}</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <PriceChart priceHistory={product.price_history} currency={product.currency} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
