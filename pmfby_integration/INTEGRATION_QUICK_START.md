# PMFBY API - Quick Start for Integration

## 🚀 For the Other System Team

---

## Step 1: Get API URL

**Ask your PMFBY team for:**
- API URL (e.g., `http://192.168.1.100:5000`)
- API Key (if authentication is enabled)

---

## Step 2: Install Python Client

**Copy these files to your project:**
1. `pmfby_client.py` - API client module
2. `API_DOCUMENTATION.md` - Full API docs

**Install dependencies:**
```bash
pip install requests
```

---

## Step 3: Test Connection

```python
from pmfby_client import PMFBYClient

# Initialize client with API URL
client = PMFBYClient('http://192.168.1.100:5000')

# Test connection
health = client.health_check()
print(health)
# Output: {'status': 'ok', 'model': 'v1 (81.8% accuracy)'}
```

---

## Step 4: Make Your First Prediction

```python
# Get prediction for a farm
result = client.predict(
    latitude=19.54841,      # Farm coordinates
    longitude=74.188663,
    crop='Rice',            # Crop name
    season='Kharif',        # Season
    area=10                 # Area in hectares
)

# Check result
if result['success']:
    data = result['data']
    
    # Get predicted yield
    yield_per_ha = data['prediction']['predicted_yield']
    total_production = data['prediction']['total_production']
    
    # Get PMFBY decision
    threshold = data['pmfby']['threshold']
    claim_triggered = data['pmfby']['claim_triggered']
    
    print(f"Predicted Yield: {yield_per_ha} kg/ha")
    print(f"Total Production: {total_production} kg")
    print(f"Threshold: {threshold} kg/ha")
    print(f"Claim: {'YES' if claim_triggered else 'NO'}")
else:
    print(f"Error: {result['error']}")
```

---

## Step 5: Integrate with Your System

### Example: Process Document and Get Prediction

```python
from pmfby_client import PMFBYClient

# Initialize once (at app startup)
pmfby = PMFBYClient('http://192.168.1.100:5000')

def process_farm_document(document):
    """
    Extract farm details from document and get prediction
    """
    # 1. Extract data from your document
    farm_data = extract_from_document(document)
    # Returns: {
    #   'latitude': 19.54841,
    #   'longitude': 74.188663,
    #   'crop': 'Rice',
    #   'season': 'Kharif',
    #   'area': 10
    # }
    
    # 2. Get prediction from PMFBY API
    result = pmfby.predict(**farm_data)
    
    # 3. Process result
    if result['success']:
        data = result['data']
        
        # Store in your database
        save_to_database({
            'farm_id': document.id,
            'predicted_yield': data['prediction']['predicted_yield'],
            'total_production': data['prediction']['total_production'],
            'threshold': data['pmfby']['threshold'],
            'claim_triggered': data['pmfby']['claim_triggered'],
            'claim_probability': data['pmfby']['claim_probability']
        })
        
        # Return to user
        return {
            'status': 'success',
            'yield': data['prediction']['predicted_yield'],
            'claim': data['pmfby']['claim_triggered']
        }
    else:
        return {
            'status': 'error',
            'message': result['error']
        }
```

---

## Step 6: Handle Responses

### Success Response Structure

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
      "area": 10
    },
    "prediction": {
      "predicted_yield": 2144,
      "uncertainty": 662,
      "confidence_interval": [340, 2933],
      "total_production": 21440
    },
    "pmfby": {
      "threshold": 1640,
      "threshold_production": 16400,
      "shortfall": 0,
      "loss_percentage": 0.0,
      "claim_triggered": false,
      "claim_probability": 20.3
    }
  }
}
```

### Extract What You Need

```python
result = client.predict(...)

if result['success']:
    # Basic info
    district = result['data']['location']['district']
    crop = result['data']['crop_info']['crop']
    
    # Prediction
    yield_kg_ha = result['data']['prediction']['predicted_yield']
    total_kg = result['data']['prediction']['total_production']
    uncertainty = result['data']['prediction']['uncertainty']
    
    # PMFBY
    threshold = result['data']['pmfby']['threshold']
    claim = result['data']['pmfby']['claim_triggered']
    probability = result['data']['pmfby']['claim_probability']
    
    # Use in your system...
```

---

## 📋 Common Use Cases

### 1. Batch Processing

```python
# Process multiple farms
farms = [
    {'latitude': 19.54, 'longitude': 74.18, 'crop': 'Rice', 'season': 'Kharif', 'area': 10},
    {'latitude': 18.52, 'longitude': 73.86, 'crop': 'Wheat', 'season': 'Rabi', 'area': 5},
    # ... more farms
]

results = client.batch_predict(farms)

for i, result in enumerate(results):
    if result['success']:
        print(f"Farm {i+1}: {result['data']['prediction']['predicted_yield']} kg/ha")
```

### 2. Get Threshold Only

```python
# Just get threshold without full prediction
threshold_result = client.get_threshold(
    latitude=19.54841,
    longitude=74.188663,
    crop='Rice',
    season='Kharif'
)

if threshold_result['success']:
    print(f"Threshold: {threshold_result['threshold']} kg/ha")
    print(f"District: {threshold_result['district']}")
```

### 3. Error Handling

```python
try:
    result = client.predict(
        latitude=19.54841,
        longitude=74.188663,
        crop='Rice',
        season='Kharif',
        area=10
    )
    
    if result['success']:
        # Process success
        yield_value = result['data']['prediction']['predicted_yield']
    else:
        # Handle API error
        log_error(f"API Error: {result['error']}")
        
except Exception as e:
    # Handle connection error
    log_error(f"Connection Error: {e}")
```

---

## 🔧 Configuration

### Set Timeout

```python
# For slow networks or large requests
client = PMFBYClient('http://api-url:5000', timeout=120)
```

### Add API Key (if enabled)

```python
client = PMFBYClient(
    'http://api-url:5000',
    api_key='your-secret-key'
)
```

---

## 📞 Support

**If you face issues:**

1. Check API is running: `client.health_check()`
2. Verify network connectivity
3. Check request format matches examples
4. Contact PMFBY team with error message

**Common Issues:**

| Error | Solution |
|-------|----------|
| Connection refused | Check API URL and port |
| Timeout | Increase timeout (weather fetch takes 30-60s) |
| Invalid field | Check crop/season spelling |
| Missing field | Ensure all required fields provided |

---

## ✅ Checklist

- [ ] Received API URL from PMFBY team
- [ ] Copied `pmfby_client.py` to project
- [ ] Installed `requests` library
- [ ] Tested connection with `health_check()`
- [ ] Made test prediction
- [ ] Integrated with document processing
- [ ] Tested error handling
- [ ] Ready for production!

---

## 📚 Full Documentation

See `API_DOCUMENTATION.md` for:
- Complete API reference
- All endpoints
- Request/response formats
- Advanced features
