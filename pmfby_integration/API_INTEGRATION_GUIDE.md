# PMFBY API - Complete Integration Guide

## End-to-End Implementation for External Systems

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [API Base URL](#api-base-url)
4. [Authentication](#authentication)
5. [Endpoints Reference](#endpoints-reference)
6. [Request/Response Formats](#requestresponse-formats)
7. [Step-by-Step Integration](#step-by-step-integration)
8. [Code Examples](#code-examples)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)

---

## Overview

The PMFBY Yield Prediction API provides crop yield predictions for Maharashtra districts using machine learning. It integrates:

- **Weather Data**: Real-time from NASA POWER API
- **Soil Properties**: District-level soil characteristics
- **Stress Indices**: Agronomic stress calculations
- **ML Model**: Random Forest with 81.8% accuracy

**Key Features:**
- Auto-detects district from GPS coordinates
- Auto-calculates PMFBY threshold from historical data
- Returns prediction with uncertainty estimates
- PMFBY claim decision with probability

---

## Prerequisites

### Your System Requirements

```
- Python 3.7+ (or any language with HTTP client)
- Internet connectivity to reach API
- Ability to send/receive JSON
```

### Required Input Data

To make a prediction, you need:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `latitude` | float | ✅ Yes | Farm latitude (decimal degrees) | 19.54841 |
| `longitude` | float | ✅ Yes | Farm longitude (decimal degrees) | 74.188663 |
| `crop` | string | ✅ Yes | Crop name | "Rice" |
| `season` | string | ✅ Yes | Growing season | "Kharif" |
| `area` | float | ✅ Yes | Farm area in hectares | 10 |
| `year` | int | ❌ Optional | Crop year | 2024 |
| `district` | string | ❌ Optional | Override auto-detection | "Ahmednagar" |
| `threshold` | float | ❌ Optional | Override auto-calculation | 1640 |

### Supported Values

**Crops:**
- Rice, Wheat, Cotton, Soyabean, Sugarcane
- Jowar, Bajra, Maize, Groundnut
- Arhar(Tur), Gram, Moong(Green Gram), Urad
- And more...

**Seasons:**
- Kharif (June - November)
- Rabi (November - March)
- Summer (March - June)

**Coverage:**
- All 37 Maharashtra districts

---

## API Base URL

```
Production: http://<YOUR_SERVER_IP>:5000
Local Dev:  http://localhost:5000
```

Replace `<YOUR_SERVER_IP>` with the actual IP address provided to you.

---

## Authentication

**Current Version:** No authentication required (open API)

**For Production:** Contact administrator for API key setup

---

## Endpoints Reference

### 1. Health Check

**Purpose:** Verify API is running

```
GET /api/health
```

**Request:**
```http
GET /api/health HTTP/1.1
Host: <API_URL>
```

**Response:**
```json
{
  "status": "ok",
  "model": "v1 (81.8% accuracy)",
  "version": "1.0.0",
  "endpoints": [
    "POST /api/predict",
    "POST /api/threshold",
    "GET /api/health"
  ]
}
```

---

### 2. Calculate Threshold

**Purpose:** Get PMFBY threshold without full prediction

```
POST /api/threshold
```

**Request:**
```http
POST /api/threshold HTTP/1.1
Host: <API_URL>
Content-Type: application/json

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

### 3. Full Prediction (Main Endpoint)

**Purpose:** Get complete yield prediction with PMFBY assessment

```
POST /api/predict
```

**Request:**
```http
POST /api/predict HTTP/1.1
Host: <API_URL>
Content-Type: application/json

{
  "latitude": 19.54841,
  "longitude": 74.188663,
  "crop": "Rice",
  "season": "Kharif",
  "area": 10
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

## Step-by-Step Integration

### Step 1: Prepare Your Input Data

Extract these from your system:
```python
farm_data = {
    "latitude": 19.54841,      # From GPS or user input
    "longitude": 74.188663,    # From GPS or user input
    "crop": "Rice",            # User selection
    "season": "Kharif",        # Based on current date or user input
    "area": 10                 # User input (hectares)
}
```

### Step 2: Send HTTP POST Request

```python
import requests

API_URL = "http://your-api-url:5000"

response = requests.post(
    f"{API_URL}/api/predict",
    json=farm_data,
    headers={"Content-Type": "application/json"},
    timeout=120  # Weather fetch can take 30-60 seconds
)
```

### Step 3: Parse Response

```python
if response.status_code == 200:
    result = response.json()
    
    if result["success"]:
        # Extract key values
        predicted_yield = result["data"]["prediction"]["predicted_yield"]
        total_production = result["data"]["prediction"]["total_production"]
        threshold = result["data"]["pmfby"]["threshold"]
        claim_triggered = result["data"]["pmfby"]["claim_triggered"]
        claim_probability = result["data"]["pmfby"]["claim_probability"]
        
        # Use in your system
        save_to_database(predicted_yield, total_production, claim_triggered)
        
    else:
        error = result.get("error")
        handle_error(error)
else:
    handle_http_error(response.status_code)
```

### Step 4: Display or Store Results

```python
# Display to user
print(f"Predicted Yield: {predicted_yield} kg/ha")
print(f"Total Production: {total_production} kg")
print(f"PMFBY Claim: {'YES' if claim_triggered else 'NO'}")

# Store in database
db.insert({
    "farm_id": farm.id,
    "predicted_yield": predicted_yield,
    "total_production": total_production,
    "threshold": threshold,
    "claim_triggered": claim_triggered,
    "claim_probability": claim_probability,
    "timestamp": datetime.now()
})
```

---

## Code Examples

### Python (Recommended)

```python
import requests

class PMFBYClient:
    def __init__(self, api_url):
        self.api_url = api_url.rstrip('/')
    
    def predict(self, latitude, longitude, crop, season, area):
        """Get yield prediction"""
        response = requests.post(
            f"{self.api_url}/api/predict",
            json={
                "latitude": latitude,
                "longitude": longitude,
                "crop": crop,
                "season": season,
                "area": area
            },
            timeout=120
        )
        return response.json()

# Usage
client = PMFBYClient("http://your-api-url:5000")
result = client.predict(19.54841, 74.188663, "Rice", "Kharif", 10)

if result["success"]:
    print(f"Yield: {result['data']['prediction']['predicted_yield']} kg/ha")
```

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_URL = 'http://your-api-url:5000';

async function getPrediction(latitude, longitude, crop, season, area) {
    try {
        const response = await axios.post(`${API_URL}/api/predict`, {
            latitude,
            longitude,
            crop,
            season,
            area
        }, {
            timeout: 120000
        });
        
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.error);
        }
    } catch (error) {
        console.error('API Error:', error.message);
        throw error;
    }
}

// Usage
getPrediction(19.54841, 74.188663, 'Rice', 'Kharif', 10)
    .then(data => {
        console.log(`Yield: ${data.prediction.predicted_yield} kg/ha`);
    });
```

### cURL

```bash
curl -X POST http://your-api-url:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 19.54841,
    "longitude": 74.188663,
    "crop": "Rice",
    "season": "Kharif",
    "area": 10
  }'
```

### Java

```java
import java.net.http.*;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();

String json = """
{
    "latitude": 19.54841,
    "longitude": 74.188663,
    "crop": "Rice",
    "season": "Kharif",
    "area": 10
}
""";

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://your-api-url:5000/api/predict"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(json))
    .timeout(Duration.ofSeconds(120))
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());

System.out.println(response.body());
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### Common Errors

| HTTP Code | Error | Cause | Solution |
|-----------|-------|-------|----------|
| 400 | Missing required field | Field not in request | Add missing field |
| 400 | Invalid crop name | Unsupported crop | Check supported crops list |
| 500 | Weather API timeout | NASA API slow | Retry request |
| 500 | Internal server error | Server issue | Check logs, contact support |

### Timeout Handling

The API may take 30-60 seconds due to weather data fetching. Always set a timeout of at least 120 seconds:

```python
response = requests.post(url, json=data, timeout=120)
```

### Retry Logic

```python
import time

def predict_with_retry(data, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.post(f"{API_URL}/api/predict", 
                                     json=data, timeout=120)
            return response.json()
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                time.sleep(5)
                continue
            raise
```

---

## Response Field Reference

### prediction object

| Field | Type | Description |
|-------|------|-------------|
| `predicted_yield` | int | Predicted yield in kg/ha |
| `uncertainty` | int | ± uncertainty in kg/ha |
| `confidence_interval` | [int, int] | 95% CI [low, high] |
| `total_production` | int | Total production in kg |

### pmfby object

| Field | Type | Description |
|-------|------|-------------|
| `threshold` | int | PMFBY threshold in kg/ha |
| `threshold_production` | int | Threshold × area in kg |
| `shortfall` | int | How much below threshold |
| `loss_percentage` | float | (shortfall/threshold) × 100 |
| `claim_triggered` | bool | True if loss ≥ 33% |
| `claim_probability` | float | % probability of claim |

### weather object

| Field | Type | Description |
|-------|------|-------------|
| `rainfall` | int | Total rainfall in mm |
| `gdd` | int | Growing Degree Days |
| `heat_stress` | int | Heat stress intensity |
| `vpd` | float | Vapor Pressure Deficit in kPa |
| `dry_spells` | int | Number of dry spell periods |

### soil object

| Field | Type | Description |
|-------|------|-------------|
| `texture` | string | Soil texture class |
| `clay_pct` | float | Clay percentage |
| `ph` | float | Soil pH |
| `quality_index` | float | Overall quality (0-1) |

---

## Best Practices

### 1. Cache Threshold Values

Thresholds change rarely (yearly), so cache them:

```python
threshold_cache = {}

def get_threshold(district, crop, season):
    key = f"{district}_{crop}_{season}"
    if key not in threshold_cache:
        result = client.get_threshold(district, crop, season)
        threshold_cache[key] = result["threshold"]
    return threshold_cache[key]
```

### 2. Batch Processing

For multiple farms, process sequentially with delays:

```python
import time

results = []
for farm in farms:
    result = client.predict(**farm)
    results.append(result)
    time.sleep(2)  # Avoid overwhelming the API
```

### 3. Store Raw Response

Always store the raw API response for auditing:

```python
db.insert({
    "farm_id": farm.id,
    "api_response": json.dumps(result),
    "timestamp": datetime.now()
})
```

### 4. Validate Inputs Before Sending

```python
def validate_input(data):
    required = ["latitude", "longitude", "crop", "season", "area"]
    for field in required:
        if field not in data:
            raise ValueError(f"Missing {field}")
    
    if not -90 <= data["latitude"] <= 90:
        raise ValueError("Invalid latitude")
    
    if not -180 <= data["longitude"] <= 180:
        raise ValueError("Invalid longitude")
    
    if data["area"] <= 0:
        raise ValueError("Area must be positive")
```

---

## Support

**Response Time:** 30-60 seconds (first call), faster on subsequent calls

**Coverage:** Maharashtra districts only

**Model Accuracy:** 81.8% (R² = 0.8179)

**Support Contact:** [Your contact info]

---

## Changelog

**v1.0.0 (December 2024)**
- Initial release
- 3 endpoints (health, threshold, predict)
- 81.8% accuracy model
- Full weather, soil, stress integration
