# Spedify - AI-Driven Price Tracker

An AI-driven full-stack web application for product price tracking and history, featuring a Python backend for intelligent scraping and data management, and a modern React frontend for user interaction.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## 🚀 Features

### Backend (FastAPI + Python)
- **AI-Powered Web Scraping**: Automatically extract product information from any e-commerce URL
- **Price History Tracking**: Monitor price changes over time with automatic history recording
- **RESTful API**: Well-documented API with OpenAPI/Swagger support
- **Database Management**: SQLAlchemy ORM with SQLite (easily upgradable to PostgreSQL)
- **AI Categorization**: Optional OpenAI integration for intelligent product categorization

### Frontend (React + TypeScript + Tailwind)
- **Product Search**: Search and filter products across all tracked items
- **Price Visualization**: Interactive charts showing price history trends
- **Favorites System**: Save and manage your favorite products
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Real-time Updates**: Seamless integration with backend API

## 📁 Project Structure

```
Spedify/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # Database models and schemas
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic (AI scraper)
│   │   └── database.py     # Database configuration
│   ├── main.py             # FastAPI application entry point
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
│
└── frontend/               # React frontend
    ├── src/
    │   ├── components/     # Reusable React components
    │   ├── pages/          # Page components
    │   ├── services/       # API service layer
    │   └── types/          # TypeScript type definitions
    ├── package.json        # Node dependencies
    └── .env.example        # Environment variables template
```

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key (optional)
```

5. Run the backend server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📖 Usage

### Adding Products

1. Open the web app at `http://localhost:5173`
2. Enter a product URL in the "Add Product to Track" form
3. Click "Track Product" - the AI scraper will extract product details
4. View the product in your product list

### Viewing Price History

1. Click on any product card to view details
2. See the interactive price chart showing historical price changes
3. View lowest, highest, and current prices

### Managing Favorites

1. Click the heart icon on any product to add/remove from favorites
2. Visit the "Favorites" page to see all your tracked products
3. Get quick access to products you care about most

## 🔧 API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `GET /api/products/{id}/history` - Get price history
- `POST /api/products` - Create a product
- `PUT /api/products/{id}` - Update a product
- `DELETE /api/products/{id}` - Delete a product

### Scraper
- `POST /api/scraper/scrape` - Scrape product from URL

### Favorites
- `GET /api/favorites?user_id={id}` - Get user favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/user/{user_id}/product/{product_id}` - Remove from favorites

## 🤖 AI Integration

The scraper uses AI in two ways:

1. **Pattern Recognition**: Intelligent extraction of product information from various e-commerce sites
2. **Categorization** (Optional): Uses OpenAI GPT-3.5 to categorize products automatically

To enable AI categorization, add your OpenAI API key to the backend `.env` file:
```
OPENAI_API_KEY=sk-...
```

## 🎨 Tech Stack

**Backend:**
- FastAPI - Modern, fast web framework
- SQLAlchemy - SQL toolkit and ORM
- BeautifulSoup4 - Web scraping
- Pydantic - Data validation
- OpenAI - AI categorization

**Frontend:**
- React 18 - UI library
- TypeScript - Type safety
- Tailwind CSS - Utility-first CSS
- Recharts - Data visualization
- Axios - HTTP client
- React Router - Navigation
- Lucide React - Icons

## ⚠️ Security Notes

**Current Implementation:**
- The application uses a hardcoded `default-user` ID for simplicity and demonstration purposes
- This is **NOT suitable for production** use

**For Production Deployment:**
- Implement proper user authentication (OAuth, JWT, or session-based)
- Add user registration and login system
- Secure API endpoints with authentication middleware
- Use environment variables for sensitive configuration
- Enable HTTPS/SSL for all connections
- Implement rate limiting and API security best practices

## 🚀 Production Deployment

### Backend
1. Set up a production database (PostgreSQL recommended)
2. Update `DATABASE_URL` in `.env`
3. Use a production ASGI server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
1. Build the production bundle:
```bash
npm run build
```
2. Serve the `dist` directory with a static file server

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Created as an AI-driven price tracking solution.
