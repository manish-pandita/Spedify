// API Types
export interface Product {
  id: string;
  name: string;
  price: number;
  price_text: string;
  platform: string;
  url: string;
  image_url?: string;
  availability_status: string;
  in_stock: boolean;
  buyhatke_url?: string;
  extracted_at: string;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  products: Product[];
  total: number;
  page: number;
  limit: number;
  cached: boolean;
  timestamp: string;
}

export interface PlatformPrice {
  platform: string;
  price: string;
  price_numeric: number;
  availability: string;
  url?: string;
}

export interface DealScanner {
  deal_score?: number;
  deal_rating?: string;
  deal_description?: string;
  price_analytics?: {
    highest_price?: string;
    average_price?: string;
    lowest_price?: string;
  };
  score_breakdown?: string[];
}

export interface ProductDetails {
  success: boolean;
  product: Product;
  deal_scanner?: DealScanner;
  price_comparison: PlatformPrice[];
  price_history?: any[];
  best_price?: PlatformPrice;
}
