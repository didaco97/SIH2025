"""
PMFBY API Test Script for Google Colab
=======================================

Copy this entire script to a Google Colab cell and run it.

Before running:
1. Start your API: python api.py
2. Update API_URL below with your API URL
3. Run all cells
"""

# ============================================================================
# SETUP
# ============================================================================

# Install requests (if needed)
try:
    import requests
except:
    !pip install requests -q
    import requests

import json
from pprint import pprint
import time

print("✓ Setup complete\n")

# ============================================================================
# CONFIGURATION
# ============================================================================

# ⚠️ UPDATE THIS WITH YOUR API URL
API_URL = 'http://192.168.1.100:5000'  # Change to your API URL

print(f"API URL: {API_URL}\n")
print("="*80)

# ============================================================================
# TEST 1: HEALTH CHECK
# ============================================================================

print("\n[TEST 1] Health Check")
print("-"*80)

try:
    response = requests.get(f'{API_URL}/api/health', timeout=10)
    
    if response.status_code == 200:
        result = response.json()
        print("✓ API is running!")
        print(f"  Status: {result.get('status')}")
        print(f"  Model: {result.get('model')}")
        print(f"  Version: {result.get('version')}")
    else:
        print(f"✗ Error: Status code {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("✗ Connection Error: Cannot reach API")
    print("  - Check API is running")
    print("  - Check API_URL is correct")
    
except Exception as e:
    print(f"✗ Error: {e}")

# ============================================================================
# TEST 2: THRESHOLD CALCULATION
# ============================================================================

print("\n[TEST 2] Threshold Calculation")
print("-"*80)

threshold_data = {
    'latitude': 19.54841,
    'longitude': 74.188663,
    'crop': 'Rice',
    'season': 'Kharif'
}

try:
    response = requests.post(
        f'{API_URL}/api/threshold',
        json=threshold_data,
        timeout=30
    )
    
    if response.status_code == 200:
        result = response.json()
        
        if result.get('success'):
            print("✓ Threshold calculated!")
            print(f"  District: {result.get('district')}")
            print(f"  Crop: {result.get('crop')}")
            print(f"  Season: {result.get('season')}")
            print(f"  Threshold: {result.get('threshold')} kg/ha")
        else:
            print(f"✗ Error: {result.get('error')}")
    else:
        print(f"✗ HTTP Error: {response.status_code}")
        
except Exception as e:
    print(f"✗ Error: {e}")

# ============================================================================
# TEST 3: FULL PREDICTION
# ============================================================================

print("\n[TEST 3] Full Prediction")
print("-"*80)
print("⏳ This may take 30-60 seconds (fetching weather data)...\n")

prediction_data = {
    'latitude': 19.54841,
    'longitude': 74.188663,
    'crop': 'Rice',
    'season': 'Kharif',
    'area': 10
}

try:
    start_time = time.time()
    
    response = requests.post(
        f'{API_URL}/api/predict',
        json=prediction_data,
        timeout=120
    )
    
    duration = time.time() - start_time
    
    if response.status_code == 200:
        result = response.json()
        
        if result.get('success'):
            data = result['data']
            
            print(f"✓ Prediction successful! (took {duration:.1f}s)\n")
            
            print("📍 LOCATION")
            print(f"  District: {data['location']['district']}")
            print(f"  Coordinates: {data['location']['latitude']}, {data['location']['longitude']}")
            
            print("\n🌾 CROP INFO")
            print(f"  Crop: {data['crop_info']['crop']}")
            print(f"  Season: {data['crop_info']['season']}")
            print(f"  Area: {data['crop_info']['area']} ha")
            
            print("\n📊 PREDICTION")
            print(f"  Predicted Yield: {data['prediction']['predicted_yield']} kg/ha")
            print(f"  Total Production: {data['prediction']['total_production']} kg")
            print(f"  Uncertainty: ±{data['prediction']['uncertainty']} kg/ha")
            
            print("\n💰 PMFBY ASSESSMENT")
            print(f"  Threshold: {data['pmfby']['threshold']} kg/ha")
            print(f"  Claim Triggered: {data['pmfby']['claim_triggered']}")
            print(f"  Claim Probability: {data['pmfby']['claim_probability']}%")
            
            print("\n🌦️ WEATHER")
            print(f"  Rainfall: {data['weather']['rainfall']} mm")
            print(f"  GDD: {data['weather']['gdd']}")
            
            print("\n🌱 SOIL")
            print(f"  Texture: {data['soil']['texture']}")
            print(f"  pH: {data['soil']['ph']}")
            
            print("\n📈 MODEL")
            print(f"  Accuracy: {data['model']['accuracy']}%")
            
        else:
            print(f"✗ Error: {result.get('error')}")
    else:
        print(f"✗ HTTP Error: {response.status_code}")
        
except requests.exceptions.Timeout:
    print("✗ Timeout: Request took too long")
    
except Exception as e:
    print(f"✗ Error: {e}")

# ============================================================================
# TEST 4: MULTIPLE PREDICTIONS
# ============================================================================

print("\n[TEST 4] Multiple Predictions")
print("-"*80)

test_cases = [
    {
        'name': 'Ahmednagar Rice',
        'data': {'latitude': 19.09, 'longitude': 74.74, 'crop': 'Rice', 'season': 'Kharif', 'area': 10}
    },
    {
        'name': 'Pune Wheat',
        'data': {'latitude': 18.52, 'longitude': 73.86, 'crop': 'Wheat', 'season': 'Rabi', 'area': 5}
    },
    {
        'name': 'Nashik Cotton',
        'data': {'latitude': 20.00, 'longitude': 73.78, 'crop': 'Cotton', 'season': 'Kharif', 'area': 15}
    }
]

results = []

for i, test in enumerate(test_cases, 1):
    print(f"\n[{i}/{len(test_cases)}] {test['name']}")
    
    try:
        response = requests.post(
            f'{API_URL}/api/predict',
            json=test['data'],
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                data = result['data']
                results.append({
                    'name': test['name'],
                    'district': data['location']['district'],
                    'yield': data['prediction']['predicted_yield'],
                    'threshold': data['pmfby']['threshold'],
                    'claim': data['pmfby']['claim_triggered']
                })
                print(f"  ✓ Yield: {data['prediction']['predicted_yield']} kg/ha")
            else:
                print(f"  ✗ Error: {result.get('error')}")
        else:
            print(f"  ✗ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"  ✗ Error: {e}")

# Summary
if results:
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    print(f"{'Test':<20} {'District':<15} {'Yield':<12} {'Threshold':<12} {'Claim'}")
    print("-"*80)
    
    for r in results:
        claim_str = 'YES' if r['claim'] else 'NO'
        print(f"{r['name']:<20} {r['district']:<15} {r['yield']:<12} {r['threshold']:<12} {claim_str}")

# ============================================================================
# FINAL SUMMARY
# ============================================================================

print("\n" + "="*80)
print("ALL TESTS COMPLETE!")
print("="*80)
print("\nIf all tests passed:")
print("  ✓ API is working correctly")
print("  ✓ Ready for integration")
print("  ✓ Can be used in production")
print("\nNext Steps:")
print("  1. Copy pmfby_client.py to your project")
print("  2. See INTEGRATION_QUICK_START.md for examples")
print("="*80)
