import React, { useState } from 'react';
import { Link, Plus } from 'lucide-react';

interface ScrapeFormProps {
  onScrape: (url: string) => Promise<void>;
  isLoading: boolean;
}

const ScrapeForm: React.FC<ScrapeFormProps> = ({ onScrape, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      new URL(url); // Validate URL format
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    try {
      await onScrape(url);
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape product');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Plus className="text-primary-600 mr-2" size={24} />
        <h2 className="text-xl font-semibold">Add Product to Track</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            Product URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/product"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              disabled={isLoading}
            />
          </div>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Scraping...' : 'Track Product'}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        Enter a product URL from any online store. Our AI will extract the product details and
        start tracking its price.
      </p>
    </div>
  );
};

export default ScrapeForm;
