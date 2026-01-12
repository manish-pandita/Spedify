# Spedify

## Introduction

Spedify is designed to eliminate the time-consuming process of manually searching for products across multiple e-commerce websites. Instead of visiting numerous online stores individually to compare prices and track product availability, users can leverage Spedify's automated scraping system to aggregate product information from various sources in one centralized location. This significantly reduces the effort required to make informed purchasing decisions and enables efficient price monitoring over time.

## Core Capabilities

- **Automated Product Discovery** - Search and track products from multiple e-commerce platforms simultaneously
- **Historical Price Analysis** - Monitor and analyze price fluctuations across different time periods
- **AI-Enhanced Web Scraping** - Leverages Ollama language models for intelligent data extraction from diverse website structures
- **Product Collection Management** - Organize and maintain lists of products for continuous monitoring
- **Secure User Authentication** - Protected user accounts with JWT-based authentication system
- **Price Change Notifications** - Alert system for tracking significant price reductions
- **Cross-Platform Compatibility** - Responsive interface accessible from desktop and mobile devices

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- Modern UI/UX design

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - Database ORM
- **JWT** - Authentication
- **Ollama** - AI-powered scraping

### Scraper Engine
- **Selenium** - Browser automation and dynamic content handling
- **BeautifulSoup** - HTML parsing and content extraction
- **Ollama** - Large Language Model integration for intelligent data extraction
- **XML Generation** - Structured data output format

## Project Structure

```
Spedify/
├── scraper/                    # Standalone scraper module
│   ├── ollama_scraper.py      # Main scraping logic
│   ├── price_history_extractor.py
│   └── requirements.txt
│
└── spedify-v2/                # Main application
    ├── backend/               # FastAPI backend
    │   ├── main.py           # Entry point
    │   ├── auth_routes.py    # Authentication endpoints
    │   ├── favorites_routes.py
    │   ├── scraper.py        # Scraping integration
    │   ├── models.py         # Database models
    │   └── requirements.txt
    │
    └── frontend/              # React frontend
        ├── src/
        ├── public/
        ├── index.html
        └── package.json
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- Ollama installed and running
- Chrome/Firefox browser (for Selenium)

### Backend Setup

1. Navigate to backend directory:
```bash
cd spedify-v2/backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
uvicorn main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd spedify-v2/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Scraper Setup (Standalone)

1. Navigate to scraper directory:
```bash
cd scraper
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Ensure Ollama is running:
```bash
ollama serve
```

## Usage Workflow

1. **Account Creation** - Register for a new account or authenticate with existing credentials
2. **Product Search** - Input the desired product name or category to initiate automated scraping
3. **Results Analysis** - Review aggregated product listings with current pricing information
4. **Favorites Management** - Add selected products to your monitoring list for continuous tracking
5. **Price Monitoring** - Access historical price data and identify trends for informed decision-making

## API Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /favorites` - Get user favorites
- `POST /favorites` - Add to favorites
- `DELETE /favorites/{id}` - Remove from favorites
- `POST /scrape` - Trigger product scraping

## Development

- Backend API docs available at `http://localhost:8000/docs`
- Hot reload enabled for both frontend and backend
- Scraped data stored in `backend/outputs/` as XML files

## Contributing

Contributions to the project are welcome. Please follow these steps:

1. Fork the repository to your GitHub account
2. Create a feature branch for your changes
3. Commit your modifications with descriptive messages
4. Push the changes to your forked repository
5. Submit a Pull Request with detailed explanation of improvements

## License

This project is licensed under the MIT License, permitting use for both personal and commercial purposes.

## Support

For technical issues, bug reports, or feature requests, please submit an issue through the repository's issue tracking system.

---

**Important Note**: Ensure that Ollama service is running locally before utilizing the scraping functionality.
