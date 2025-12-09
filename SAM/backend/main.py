from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
import os
import traceback
from dotenv import load_dotenv
from farm_segment_google_sam import segment_from_point

load_dotenv()

app = FastAPI(
    title="SAM Farm Segmentation API",
    description="Interactive farm boundary segmentation using Google Static Maps and Meta's Segment Anything Model",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend static files
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")

class PointRequest(BaseModel):
    lat: float
    lng: float

@app.get("/")
def read_root():
    return {"message": "SAM Farm Segmentation API is running", "docs": "/docs"}

@app.post("/segment")
def segment(request: PointRequest):
    """
    Segment a farm boundary at the given coordinates.
    
    - **lat**: Latitude of the point to segment
    - **lng**: Longitude of the point to segment
    
    Returns GeoJSON with the segmented polygon.
    """
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Google Maps API Key not configured. Set GOOGLE_MAPS_API_KEY in .env")
    
    try:
        geojson = segment_from_point(api_key, request.lat, request.lng)
        return geojson
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting SAM Segmentation Server...")
    print("API Docs: http://localhost:8001/docs")
    print("Frontend: Open frontend/index.html in your browser")
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
