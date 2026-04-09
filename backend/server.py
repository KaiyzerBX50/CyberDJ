from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
import asyncio
from urllib.parse import unquote

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="CyberDeck DJ Turntable API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Radio Browser API base URL
RADIO_BROWSER_API = "https://de1.api.radio-browser.info/json"

# Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class RadioStation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    stationuuid: str
    name: str
    url: str
    url_resolved: Optional[str] = None
    favicon: Optional[str] = None
    country: Optional[str] = None
    countrycode: Optional[str] = None
    state: Optional[str] = None
    language: Optional[str] = None
    tags: Optional[str] = None
    bitrate: int = 0
    codec: Optional[str] = None
    votes: int = 0
    clickcount: int = 0

class FavoriteStation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    stationuuid: str
    name: str
    url: str
    url_resolved: Optional[str] = None
    favicon: Optional[str] = None
    country: Optional[str] = None
    tags: Optional[str] = None
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Routes
@api_router.get("/")
async def root():
    return {"message": "CyberDeck DJ Turntable API", "status": "online"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@api_router.get("/stations", response_model=List[RadioStation])
async def get_stations(
    tag: str = Query(default="hip hop", description="Genre/tag to search for"),
    limit: int = Query(default=30, ge=1, le=100, description="Number of stations to return"),
    order: str = Query(default="votes", description="Order by field")
):
    """
    Fetch radio stations from Radio Browser API
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Search stations by tag
            params = {
                "tag": tag,
                "limit": limit,
                "order": order,
                "reverse": "true",
                "hidebroken": "true"
            }
            
            response = await client.get(
                f"{RADIO_BROWSER_API}/stations/bytag/{tag}",
                params={"limit": limit, "order": order, "reverse": "true", "hidebroken": "true"}
            )
            
            if response.status_code != 200:
                logger.error(f"Radio Browser API error: {response.status_code}")
                raise HTTPException(status_code=502, detail="Failed to fetch stations from Radio Browser")
            
            stations_data = response.json()
            
            # Filter and transform the response
            stations = []
            for station in stations_data:
                if station.get("url_resolved") or station.get("url"):
                    stations.append(RadioStation(
                        stationuuid=station.get("stationuuid", ""),
                        name=station.get("name", "Unknown Station"),
                        url=station.get("url", ""),
                        url_resolved=station.get("url_resolved"),
                        favicon=station.get("favicon"),
                        country=station.get("country"),
                        countrycode=station.get("countrycode"),
                        state=station.get("state"),
                        language=station.get("language"),
                        tags=station.get("tags"),
                        bitrate=station.get("bitrate", 0),
                        codec=station.get("codec"),
                        votes=station.get("votes", 0),
                        clickcount=station.get("clickcount", 0)
                    ))
            
            return stations
            
    except httpx.TimeoutException:
        logger.error("Timeout fetching stations from Radio Browser API")
        raise HTTPException(status_code=504, detail="Timeout fetching stations")
    except Exception as e:
        logger.error(f"Error fetching stations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching stations: {str(e)}")

@api_router.get("/stations/search", response_model=List[RadioStation])
async def search_stations(
    query: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(default=20, ge=1, le=100)
):
    """
    Search stations by name
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                f"{RADIO_BROWSER_API}/stations/byname/{query}",
                params={"limit": limit, "hidebroken": "true"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=502, detail="Failed to search stations")
            
            stations_data = response.json()
            stations = [
                RadioStation(
                    stationuuid=s.get("stationuuid", ""),
                    name=s.get("name", "Unknown"),
                    url=s.get("url", ""),
                    url_resolved=s.get("url_resolved"),
                    favicon=s.get("favicon"),
                    country=s.get("country"),
                    countrycode=s.get("countrycode"),
                    tags=s.get("tags"),
                    bitrate=s.get("bitrate", 0),
                    votes=s.get("votes", 0)
                )
                for s in stations_data
                if s.get("url_resolved") or s.get("url")
            ]
            
            return stations
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Search timeout")
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/favorites", response_model=FavoriteStation)
async def add_favorite(station: RadioStation):
    """
    Add a station to favorites
    """
    favorite = FavoriteStation(
        stationuuid=station.stationuuid,
        name=station.name,
        url=station.url,
        url_resolved=station.url_resolved,
        favicon=station.favicon,
        country=station.country,
        tags=station.tags
    )
    
    doc = favorite.model_dump()
    doc['added_at'] = doc['added_at'].isoformat()
    
    # Check if already exists
    existing = await db.favorites.find_one({"stationuuid": station.stationuuid}, {"_id": 0})
    if existing:
        return FavoriteStation(**existing)
    
    await db.favorites.insert_one(doc)
    return favorite

@api_router.get("/favorites", response_model=List[FavoriteStation])
async def get_favorites():
    """
    Get all favorite stations
    """
    favorites = await db.favorites.find({}, {"_id": 0}).to_list(100)
    for fav in favorites:
        if isinstance(fav.get('added_at'), str):
            fav['added_at'] = datetime.fromisoformat(fav['added_at'])
    return favorites

@api_router.delete("/favorites/{stationuuid}")
async def remove_favorite(stationuuid: str):
    """
    Remove a station from favorites
    """
    result = await db.favorites.delete_one({"stationuuid": stationuuid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return {"message": "Favorite removed", "stationuuid": stationuuid}

@api_router.get("/stream")
async def stream_audio(url: str = Query(..., description="Radio stream URL to proxy")):
    """
    Proxy radio stream to bypass CORS restrictions
    """
    decoded_url = unquote(url)
    logger.info(f"Proxying stream: {decoded_url}")
    
    async def stream_generator():
        try:
            async with httpx.AsyncClient(timeout=None, follow_redirects=True) as client:
                async with client.stream("GET", decoded_url, headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "*/*",
                    "Connection": "keep-alive"
                }) as response:
                    if response.status_code != 200:
                        logger.error(f"Stream error: {response.status_code}")
                        return
                    
                    async for chunk in response.aiter_bytes(chunk_size=8192):
                        yield chunk
        except Exception as e:
            logger.error(f"Stream proxy error: {str(e)}")
            return
    
    # Determine content type based on URL
    content_type = "audio/mpeg"
    if ".ogg" in decoded_url.lower():
        content_type = "audio/ogg"
    elif ".aac" in decoded_url.lower() or ".m4a" in decoded_url.lower():
        content_type = "audio/aac"
    elif ".flac" in decoded_url.lower():
        content_type = "audio/flac"
    
    return StreamingResponse(
        stream_generator(),
        media_type=content_type,
        headers={
            "Accept-Ranges": "bytes",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )

# Status endpoints for health monitoring
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8011, reload=False)
