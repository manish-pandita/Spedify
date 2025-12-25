from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import products, favorites, scraper

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Spedify API",
    description="AI-driven price tracking and product scraping API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(favorites.router, prefix="/api/favorites", tags=["favorites"])
app.include_router(scraper.router, prefix="/api/scraper", tags=["scraper"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Spedify API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
