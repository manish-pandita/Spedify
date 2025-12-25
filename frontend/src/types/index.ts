export interface Product {
  id: number;
  name: string;
  url: string;
  image_url: string | null;
  current_price: number;
  currency: string;
  description: string | null;
  category: string | null;
  retailer: string | null;
  created_at: string;
  updated_at: string;
  price_history: PriceHistoryItem[];
}

export interface PriceHistoryItem {
  id: number;
  price: number;
  recorded_at: string;
}

export interface Favorite {
  id: number;
  user_id: string;
  product_id: number;
  created_at: string;
  product: Product;
}

export interface ScrapeRequest {
  url: string;
}

export interface ScrapeResponse {
  success: boolean;
  product?: Product;
  message: string;
}
