import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingDown, Clock, Shield, Zap, BarChart3, Heart, Bell } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Smart Search",
      description: "AI-powered search across multiple e-commerce platforms instantly"
    },
    {
      icon: <TrendingDown className="w-8 h-8" />,
      title: "Price Tracking",
      description: "Track price history and get alerts when prices drop"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Price Comparison",
      description: "Compare prices across Amazon, Flipkart, and more in real-time"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Favorites & History",
      description: "Save products and view detailed price history with graphs"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Get results in seconds with our optimized scraping technology"
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Deal Alerts",
      description: "Never miss a great deal with real-time price notifications"
    }
  ];

  const stats = [
    { value: "10K+", label: "Products Tracked" },
    { value: "50+", label: "Retailers Compared" },
    { value: "₹2000+", label: "Savings Generated" },
    { value: "10+", label: "Happy Users" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <ParticleBackground />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white text-black py-24" style={{ zIndex: 2 }}>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-light mb-8 leading-tight text-gray-900">
              Find the <span className="font-semibold">Best Deals</span> with
              <span className="block mt-3 text-gray-900 font-normal">
                Spedify
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-600 max-w-3xl mx-auto font-light">
              Compare prices across multiple platforms instantly. Smart. Fast. Simple.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={() => navigate('/search')}
                className="group px-10 py-4 bg-black text-white rounded-full font-medium text-lg hover:bg-gray-900 transition-all duration-200 flex items-center gap-3"
              >
                <Search className="w-5 h-5" />
                Start Search Now
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="px-10 py-4 bg-white text-black rounded-full font-medium text-lg hover:bg-gray-50 transition-all duration-200 border border-gray-300"
              >
                View Dashboard
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-all duration-200 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-5xl font-semibold mb-3 text-gray-900">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-normal mb-6 text-gray-900">
              Why Choose Spedify?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Everything you need to make smart shopping decisions in one place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              return (
                <div
                  key={index}
                  className="group bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 text-gray-900 group-hover:bg-gray-200 transition-all duration-200">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-medium mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-light">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-8 text-gray-900" />
          <h2 className="text-5xl md:text-6xl font-normal mb-8 text-gray-900">
            Ready to Start Saving?
          </h2>
          <p className="text-2xl mb-10 text-gray-600 font-light">
            Join thousands of smart shoppers who save money every day with Spedify
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-10 py-4 bg-black text-white rounded-full font-medium text-lg hover:bg-gray-900 transition-all duration-200 inline-flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search Products Now
          </button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 text-gray-900">
              How It <span className="font-semibold">Works</span>
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Start saving in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Search", desc: "Enter the product you're looking for", icon: <Search className="w-12 h-12" /> },
              { step: "2", title: "Compare", desc: "View prices from multiple retailers instantly", icon: <BarChart3 className="w-12 h-12" /> },
              { step: "3", title: "Save", desc: "Buy at the best price or track for future deals", icon: <Heart className="w-12 h-12" /> }
            ].map((item, index) => (
              <div key={index} className="text-center animate-slide-up bg-white rounded-3xl p-8 border border-gray-200" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white text-2xl font-light mx-auto mb-6">
                  {item.step}
                </div>
                <div className="mb-4 text-gray-900 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-medium mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
