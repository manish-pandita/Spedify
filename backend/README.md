# Spedify Backend

FastAPI backend for AI-driven product price tracking.

## Features

- AI-powered web scraping for product information
- Price history tracking
- Product search and filtering
- User favorites management
- RESTful API with automatic documentation

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. (Optional) Add your OpenAI API key to `.env` for AI-powered categorization

4. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Main Endpoints

- `POST /api/scraper/scrape` - Scrape product from URL
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `GET /api/products/{id}/history` - Get price history
- `POST /api/favorites` - Add to favorites
- `GET /api/favorites?user_id={id}` - Get user favorites
