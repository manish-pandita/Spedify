import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, BarChart3, Heart, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img src="/favicon.svg" alt="Spedify" className="w-8 h-8" />
            <span className="text-2xl font-normal text-gray-900 tracking-tight">
              Spedify
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              to="/search"
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                isActive('/search')
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="font-normal text-sm">Search</span>
            </Link>

            {user && (
              <Link
                to="/favorites"
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  isActive('/favorites')
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span className="font-normal text-sm">Favorites</span>
              </Link>
            )}

            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                isActive('/dashboard')
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="font-normal text-sm">Dashboard</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 text-gray-900">
                  <User className="w-4 h-4" />
                  <span className="font-normal text-sm">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-normal text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 font-normal text-sm transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-900 font-normal text-sm transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
