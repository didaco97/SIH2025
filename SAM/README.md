# SAM Farm Segmentation

Interactive farm boundary segmentation using Google Static Maps and Meta's Segment Anything Model (SAM).

## Features

- 🗺️ Click on satellite imagery to segment farm boundaries
- 🔷 Real-time polygon visualization
- 📊 Area calculation (m² and acres)
- 📍 GeoJSON coordinate export

## Quick Start

### 1. Setup Backend

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/Mac

# Edit .env and add your Google Maps API key
```

### 2. Configure API Key

Edit `backend/.env`:
```
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

Also update `frontend/index.html` line 8:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&callback=initMap" async defer></script>
```

### 3. Run Backend

```bash
cd backend
python main.py
```

The API will be available at `http://localhost:8001`

### 4. Open Frontend

Simply open `frontend/index.html` in your browser.

> **Note**: Due to CORS, you may need to serve the frontend via a local server:
> ```bash
> cd frontend
> python -m http.server 5500
> ```
> Then open `http://localhost:5500`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/segment` | Segment farm at lat/lng |
| GET | `/docs` | Swagger API documentation |

### Example Request

```bash
curl -X POST http://localhost:8001/segment \
  -H "Content-Type: application/json" \
  -d '{"lat": 20.5937, "lng": 78.9629}'
```

## Project Structure

```
SAM/
├── backend/
│   ├── main.py                    # FastAPI server
│   ├── farm_segment_google_sam.py # SAM segmentation logic
│   ├── requirements.txt           # Python dependencies
│   ├── .env                       # API keys (not in git)
│   ├── .env.example               # Template
│   └── sam_vit_h.pth              # SAM model (auto-downloaded)
├── frontend/
│   ├── index.html                 # Main page
│   ├── styles.css                 # Styling
│   └── app.js                     # JavaScript logic
└── README.md
```

## Requirements

- Python 3.10+
- Google Maps API key with Static Maps API enabled
- ~2.5GB disk space for SAM model checkpoint
- GPU recommended but not required

## License

MIT
