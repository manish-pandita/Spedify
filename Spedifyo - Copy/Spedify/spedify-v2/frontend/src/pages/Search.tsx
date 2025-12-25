import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { searchProducts } from '../services/api';
import type { Product } from '../types';
import axios from 'axios';

const Search = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addingFavorite, setAddingFavorite] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
      setCurrentPage(1);
      handleSearch(q, 1);
    }
  }, [location.search]);

  const handleSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await searchProducts(query, page, 100); // Fetch 100 products at once
      
      if (page === 1) {
        setAllProducts(response.products);
        setProducts(response.products);
      } else {
        const newProducts = [...allProducts, ...response.products];
        setAllProducts(newProducts);
        setProducts(newProducts);
      }
      
      // Calculate total pages (assuming ~15 products per page for display)
      const totalCount = response.total || response.products.length;
      setTotalPages(Math.ceil(totalCount / 15));
    } catch (err: any) {
      setError(err.message || 'Failed to search products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (currentPage >= 5 && !loading) {
      await handleSearch(searchQuery, Math.floor(currentPage / 5) + 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    
    // Load more if reaching page 5
    if (page >= 5 && page % 5 === 0) {
      loadMore();
    }
  };

  const addToFavorites = async (product: Product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setAddingFavorite(product.id);

    try {
      await axios.post(
        'http://localhost:8000/api/favorites',
        {
          product_name: product.name,
          product_url: product.url,
          image_url: product.image_url || 'https://via.placeholder.com/400x300',
          current_price: parseFloat(product.price_text.replace(/[^0-9.]/g, '')) || 0,
          platform: product.platform
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Added to favorites!');
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Failed to add to favorites');
      }
    } finally {
      setAddingFavorite(null);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Logo Watermark Background */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
        <img 
          src="/favicon.svg" 
          alt="" 
          className="w-[600px] h-[600px] opacity-[0.025]"
        />
      </div>
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto">
          {/* Search Box */}
          <div className="mb-12">
            <form onSubmit={onSubmit}>
              <div className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 rounded-3xl shadow-sm border border-gray-200">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands, or deals..."
                  className="flex-1 px-6 py-4 bg-white border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300 text-lg"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-4 bg-black text-white font-medium rounded-2xl hover:bg-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>
          </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-block relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-lg text-gray-600">Searching for the best deals...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && products.length > 0 && (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-normal text-gray-900">
              <span className="text-gray-900 font-medium">
                {allProducts.length} results
              </span>{' '}
              found for "{searchQuery}"
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProducts.slice((currentPage - 1) * 15, currentPage * 15).map((product, index) => (
              <div
                key={product.id}
                className="group bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover-glow transition-all duration-300 animate-slide-up"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                {product.image_url && (
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
                        {product.platform}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                    {product.name}
                  </h3>
                  
                  <div className="flex justify-between items-center mb-5">
                    <div className="text-3xl font-semibold text-gray-900">
                      {product.price_text}
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      product.in_stock 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {product.availability_status}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => addToFavorites(product)}
                      disabled={addingFavorite === product.id}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Heart className="w-4 h-4" />
                      {addingFavorite === product.id ? 'Adding...' : 'Save'}
                    </button>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-black text-white py-2.5 rounded-2xl font-medium hover:bg-gray-900 transition-all duration-200"
                    >
                      View Deal →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-5 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                ← Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.floor((currentPage - 1) / 5) * 5 + i + 1;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-4 py-2.5 rounded-2xl font-medium transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-black text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {currentPage < totalPages - 4 && (
                <span className="px-2 text-gray-400">...</span>
              )}
              
              <button
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-5 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && products.length === 0 && searchQuery && (
        <div className="text-center py-20">
          <div className="inline-block w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🔍</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try a different search term or browse our popular categories</p>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default Search;
