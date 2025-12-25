import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, Heart } from 'lucide-react';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import FavoritesPage from './pages/FavoritesPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-primary-600">Spedify</div>
                <div className="text-sm text-gray-500">AI Price Tracker</div>
              </Link>
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <Home size={20} />
                  <span>Home</span>
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <Heart size={20} />
                  <span>Favorites</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500 text-sm">
              © 2024 Spedify. AI-powered price tracking for smarter shopping.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
