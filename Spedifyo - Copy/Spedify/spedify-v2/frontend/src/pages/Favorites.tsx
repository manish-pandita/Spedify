import React, { useState, useEffect } from 'react';
import { Heart, Trash2, RefreshCw, TrendingDown, TrendingUp, BarChart } from 'lucide-react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceHistoryEntry {
  price: number;
  platform: string;
  timestamp: string;
  availability: string;
}

interface Favorite {
  _id?: string;
  id?: string;
  product_name: string;
  product_url: string;
  image_url: string;
  current_price: number;
  platform: string;
  price_history: PriceHistoryEntry[];
  added_at: string;
  last_checked: string;
}

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [updatingPrices, setUpdatingPrices] = useState(false);

  const getFavoriteId = (favorite: Favorite) => favorite._id || favorite.id || '';

  const fetchFavorites = async (updatePrices: boolean = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/favorites?update_prices=${updatePrices}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFavorites(response.data.favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
      setUpdatingPrices(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const updateAllPrices = async () => {
    setUpdatingPrices(true);
    await fetchFavorites(true);
  };

  const removeFavorite = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from favorites?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Removing favorite with ID:', id);
      
      const response = await axios.delete(`http://localhost:8000/api/favorites/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Delete response:', response.data);
      
      // Update the state to remove the deleted favorite
      setFavorites(favorites.filter(fav => getFavoriteId(fav) !== id));
      alert('Product removed from favorites!');
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      alert(error.response?.data?.detail || 'Failed to remove favorite');
    }
  };

  const showPriceHistory = (favorite: Favorite) => {
    setSelectedFavorite(favorite);
    setShowGraph(true);
  };

  const getChartData = () => {
    if (!selectedFavorite) return null;

    const history = selectedFavorite.price_history;
    return {
      labels: history.map(h => new Date(h.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })),
      datasets: [
        {
          label: 'Price (₹)',
          data: history.map(h => h.price),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Price History'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  const getPriceChange = (favorite: Favorite) => {
    if (favorite.price_history.length < 2) return null;
    const first = favorite.price_history[0].price;
    const current = favorite.current_price;
    const change = ((current - first) / first) * 100;
    return change;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-normal text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600 font-light">Track and compare prices on your saved products</p>
        </div>
        {favorites.length > 0 && (
          <button
            onClick={updateAllPrices}
            disabled={updatingPrices}
            className="flex items-center gap-2 px-5 py-3 bg-black text-white rounded-full hover:bg-gray-900 transition-all disabled:opacity-50 font-medium"
          >
            <RefreshCw className={`w-5 h-5 ${updatingPrices ? 'animate-spin' : ''}`} />
            {updatingPrices ? 'Updating...' : 'Update Prices'}
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-24 h-24 mx-auto text-gray-200 mb-4" />
          <h2 className="text-2xl font-normal text-gray-900 mb-2">No favorites yet</h2>
          <p className="text-gray-500 font-light">Start adding products to track their prices</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            const priceChange = getPriceChange(favorite);
            return (
              <div key={favorite.id} className="bg-white rounded-3xl border border-gray-200 p-6 hover:border-gray-300 transition-all">
                <div className="relative mb-4">
                  <img
                    src={favorite.image_url}
                    alt={favorite.product_name}
                    className="w-full h-48 object-contain rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => removeFavorite(getFavoriteId(favorite))}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-medium text-lg mb-3 line-clamp-2 text-gray-900">{favorite.product_name}</h3>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-semibold text-gray-900">
                      ₹{favorite.current_price.toLocaleString()}
                    </span>
                    <p className="text-sm text-gray-500 font-light">{favorite.platform}</p>
                  </div>
                  {priceChange !== null && (
                    <div className={`flex items-center gap-1 ${priceChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {priceChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-sm font-medium">{Math.abs(priceChange).toFixed(1)}%</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => showPriceHistory(favorite)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-900 rounded-2xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    <BarChart className="w-4 h-4" />
                    View History
                  </button>
                  <a
                    href={favorite.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2.5 bg-black text-white rounded-2xl hover:bg-gray-900 transition-all text-center font-medium"
                  >
                    Buy Now
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Price History Modal */}
      {showGraph && selectedFavorite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowGraph(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-normal text-gray-900 mb-2">{selectedFavorite.product_name}</h2>
                <p className="text-gray-600">Price tracking history</p>
              </div>
              <button
                onClick={() => setShowGraph(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <Line data={getChartData()!} options={chartOptions} />
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg mb-3">Price History</h3>
              {selectedFavorite.price_history.map((entry, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-semibold">₹{entry.price.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 ml-2">{entry.platform}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(entry.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Favorites;
