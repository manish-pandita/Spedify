import { useState, useEffect } from 'react';
import { TrendingUp, Package, Search as SearchIcon, Flame, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStats } from '../services/api';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
    loadFavoritesCount();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavoritesCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:8000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavoritesCount(response.data.total || 0);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const quickSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const getTrendingIcon = (index: number) => {
    if (index === 0) return <Flame className="w-5 h-5 text-orange-500" />;
    if (index === 1) return <TrendingUp className="w-5 h-5 text-red-500" />;
    if (index === 2) return <Sparkles className="w-5 h-5 text-yellow-500" />;
    return <SearchIcon className="w-5 h-5 text-gray-400" />;
  };

  const getProductImage = (query: string): string => {
    const q = query.toLowerCase();
    
    // Electronics
    if (q.includes('iphone') || q.includes('apple')) return 'https://images.unsplash.com/photo-1592286927505-b21f7e6fb167?w=200&h=200&fit=crop';
    if (q.includes('samsung') || q.includes('galaxy')) return 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&h=200&fit=crop';
    if (q.includes('phone') || q.includes('mobile')) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop';
    if (q.includes('laptop') || q.includes('macbook')) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop';
    if (q.includes('watch') || q.includes('smartwatch')) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop';
    if (q.includes('headphone') || q.includes('airpod') || q.includes('earphone')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop';
    if (q.includes('tv') || q.includes('television')) return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=200&fit=crop';
    if (q.includes('camera')) return 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&h=200&fit=crop';
    
    // Fashion
    if (q.includes('shirt') || q.includes('tshirt') || q.includes('t-shirt')) return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop';
    if (q.includes('shoe') || q.includes('sneaker') || q.includes('nike') || q.includes('adidas')) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop';
    if (q.includes('bag') || q.includes('backpack')) return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop';
    if (q.includes('dress') || q.includes('clothing')) return 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop';
    
    // Home & Kitchen
    if (q.includes('washing') || q.includes('detergent') || q.includes('powder') || q.includes('nirma') || q.includes('tide') || q.includes('surf')) return 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=200&h=200&fit=crop';
    if (q.includes('soap') || q.includes('shampoo') || q.includes('cleanser')) return 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop';
    if (q.includes('furniture') || q.includes('chair') || q.includes('table')) return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop';
    
    // Luxury
    if (q.includes('rolex') || q.includes('luxury')) return 'https://images.unsplash.com/photo-1587836374058-4ec70dea5d16?w=200&h=200&fit=crop';
    if (q.includes('perfume') || q.includes('fragrance')) return 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop';
    
    // Sports
    if (q.includes('sports') || q.includes('gym') || q.includes('fitness')) return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop';
    
    // Default
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop';
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-normal text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 font-light">Track your searches and discover trending products</p>
        </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 hover-glow transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-600">Search Queries</h3>
                <div className="p-3 bg-gray-100 rounded-2xl">
                  <SearchIcon className="w-6 h-6 text-gray-900" />
                </div>
              </div>
              <p className="text-5xl font-semibold text-gray-900">
                {stats?.total_searches?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-500 mt-3">Total searches performed</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 hover-glow transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-600">Saved Favorites</h3>
                <div className="p-3 bg-gray-100 rounded-2xl">
                  <Package className="w-6 h-6 text-gray-900" />
                </div>
              </div>
              <p className="text-5xl font-semibold text-gray-900">
                {favoritesCount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-3">Products you're tracking</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 hover-glow transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-600">Popular Items</h3>
                <div className="p-3 bg-gray-100 rounded-2xl">
                  <Flame className="w-6 h-6 text-gray-900" />
                </div>
              </div>
              <p className="text-5xl font-semibold text-gray-900">
                {stats?.top_searches?.length || '0'}
              </p>
              <p className="text-sm text-gray-500 mt-3">Most searched products</p>
            </div>
          </div>

          {/* Trending Searches */}
          {stats?.top_searches && stats.top_searches.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-gray-100 rounded-2xl">
                  <Flame className="w-6 h-6 text-gray-900" />
                </div>
                <h2 className="text-3xl font-normal text-gray-900">
                  Trending Searches
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.top_searches.map((search: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => quickSearch(search._id)}
                    className="group relative bg-white rounded-3xl overflow-hidden hover-glow transition-all duration-300 text-left border border-gray-200 shadow-sm"
                  >
                    {/* Product Image */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={getProductImage(search._id)}
                        alt={search._id}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Ranking Badge */}
                      <div className="absolute top-4 left-4 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center">
                        {getTrendingIcon(index)}
                      </div>
                      
                      {/* HOT Badge */}
                      {index < 3 && (
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-full">
                          🔥 HOT
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-black transition-colors mb-3 text-lg">
                        {search._id}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 px-3 py-1.5 bg-gray-100 rounded-full">
                          {search.count} {search.count === 1 ? 'search' : 'searches'}
                        </span>
                        <div className="text-xs text-black font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          Search now <span className="text-lg">→</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  💡 Click on any trending search to see live prices
                </p>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default Dashboard;
