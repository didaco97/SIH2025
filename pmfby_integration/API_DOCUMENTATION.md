# PMFBY API Documentation

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start API Server
```bash
python api.py
```

Server will start on: `http://localhost:5000`

---

## 📡 API Endpoints

### 1. Health Check
**GET** `/api/health`

**Response:**
```json
{
  "status": "ok",
  "model": "v1 (81.8% accuracy)",
  "version": "1.0.0"
}
```

---

### 2. Calculate Threshold
**POST** `/api/threshold`

**Request:**
```json
{
  "latitude": 19.54841,
  "longitude": 74.188663,
  "crop": "Rice",
  "season": "Kharif"
}
```

**Response:**
```json
{
  "success": true,
  "threshold": 1640,
  "district": "Ahmednagar",
  "crop": "Rice",
  "season": "Kharif",
  "calculation_method": "7-year average excluding 2 worst years",
  "unit": "kg/ha"
}
```

---

### 3. Full Prediction
**POST** `/api/predict`

**Request:**
```json
{
  "latitude": 19.54841,
  "longitude": 74.188663,
  "crop": "Rice",
  "season": "Kharif",
  "area": 10,
  "year": 2024
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": 19.54841,
      "longitude": 74.188663,
      "district": "Ahmednagar"
    },
    "crop_info": {
      "crop": "Rice",
      "season": "Kharif",
      "area": 10,
      "area_unit": "hectares"
    },
    "prediction": {
      "predicted_yield": 2144,
      "uncertainty": 662,
      "confidence_interval": [340, 2933],
      "unit": "kg/ha",
      "total_production": 21440,
      "total_production_unit": "kg"
    },
    "pmfby": {
      "threshold": 1640,
      "threshold_production": 16400,
      "shortfall": 0,
      "loss_percentage": 0.0,
      "claim_triggered": false,
      "claim_probability": 20.3,
      "decision_confidence": 59.4
    },
    "weather": {
      "rainfall": 1295,
      "gdd": 4047,
      "heat_stress": 319,
      "vpd": 1.18,
      "dry_spells": 2
    },
    "soil": {
      "texture": "Clay",
      "clay_pct": 45.2,
      "ph": 7.8,
      "quality_index": 0.80
    },
    "stress": {
      "vegetative": 0.15,
      "flowering_heat": 0.22,
      "combined": 0.37,
      "yield_potential": 0.65
    },
    "model": {
      "version": "v1",
      "accuracy": 81.8,
      "r2_score": 0.8179
    }
  }
}
```

---

## 🔧 Request Parameters

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `latitude` | float | Farm latitude | 19.54841 |
| `longitude` | float | Farm longitude | 74.188663 |
| `crop` | string | Crop name | "Rice" |
| `season` | string | Growing season | "Kharif" |
| `area` | float | Farm area (ha) | 10 |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `year` | int | Crop year | Current year - 1 |
| `district` | string | Override auto-detection | Auto-detected |
| `threshold` | float | Override auto-calculation | Auto-calculated |

### Valid Values

**Crops:**
- Rice
- Wheat
- Cotton
- Soyabean
- Sugarcane
- Jowar
- Bajra
- Maize

**Seasons:**
- Kharif (Jun-Nov)
- Rabi (Nov-Mar)
- Summer (Mar-Jun)

---

## 💻 Example Usage

### Python
```python
import requests

# Prediction request
response = requests.post('http://localhost:5000/api/predict', json={
    'latitude': 19.54841,
    'longitude': 74.188663,
    'crop': 'Rice',
    'season': 'Kharif',
    'area': 10
})

result = response.json()
print(f"Predicted Yield: {result['data']['prediction']['predicted_yield']} kg/ha")
print(f"Claim: {result['data']['pmfby']['claim_triggered']}")
```

### cURL
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 19.54841,
    "longitude": 74.188663,
    "crop": "Rice",
    "season": "Kharif",
    "area": 10
  }'
```

### JavaScript
```javascript
fetch('http://localhost:5000/api/predict', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    latitude: 19.54841,
    longitude: 74.188663,
    crop: 'Rice',
    season: 'Kharif',
    area: 10
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 🎯 Features

✅ **Auto-detect district** from coordinates  
✅ **Auto-calculate threshold** from historical data  
✅ **Real-time weather** from NASA POWER  
✅ **Soil properties** from district database  
✅ **Stress indices** for crop health  
✅ **Uncertainty estimation** with confidence intervals  
✅ **PMFBY claim decision** with probability  
✅ **CORS enabled** for web applications  

---

## 📊 Model Details

- **Accuracy**: 81.8% (R² = 0.8179)
- **Error**: ±195 kg/ha average
- **Features**: 15 (weather + location + crop)
- **Training**: 20,558 real DES records
- **Status**: Production Ready ✓

---

## 🔒 Error Handling

### Error Response Format
```json
{
  "error": "Error message description"
}
```

### Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Missing required field | Check all required fields |
| 500 | Internal server error | Check logs, verify model file |

---

## 🚀 Deployment

### Local Development
```bash
python api.py
```

### Production (Gunicorn)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 api:app
```

### Docker
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "api:app"]
```

---

## 📝 Notes

- District is auto-detected from coordinates
- Threshold is auto-calculated from 7-year historical data
- All yields are in kg/ha
- Total production scales with area
- Confidence intervals are 95% CI
