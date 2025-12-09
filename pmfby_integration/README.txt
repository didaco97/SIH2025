PMFBY API Integration Package
==============================

API URL: http://YOUR_IP_ADDRESS:5000
(Replace YOUR_IP_ADDRESS with your actual IP)

How to Find Your IP:
- Windows: Run 'ipconfig' in terminal
- Look for IPv4 Address (e.g., 192.168.1.100)

Quick Start
-----------

1. Install Python requests library:
   pip install requests

2. Copy pmfby_client.py to your project

3. Use in your code:

   from pmfby_client import PMFBYClient
   
   # Initialize client
   client = PMFBYClient('http://192.168.1.100:5000')
   
   # Get prediction
   result = client.predict(
       latitude=19.54841,
       longitude=74.188663,
       crop='Rice',
       season='Kharif',
       area=10
   )
   
   # Use result
   if result['success']:
       yield_value = result['data']['prediction']['predicted_yield']
       claim = result['data']['pmfby']['claim_triggered']
       print(f"Yield: {yield_value} kg/ha, Claim: {claim}")

Files Included
--------------

1. pmfby_client.py
   - Python client module for API integration
   - Use this in your code

2. INTEGRATION_QUICK_START.md
   - Step-by-step integration guide
   - Examples and use cases

3. API_DOCUMENTATION.md
   - Complete API reference
   - All endpoints and parameters

Documentation
-------------

See INTEGRATION_QUICK_START.md for:
- Detailed examples
- Error handling
- Batch processing
- Common use cases

See API_DOCUMENTATION.md for:
- Complete API reference
- Request/response formats
- All available endpoints

Model Details
-------------

- Accuracy: 81.8% (R² = 0.8179)
- Error: ±195 kg/ha average
- Features: 15 (weather + location + crop)
- Training: 20,558 real DES records
- Coverage: Maharashtra districts

Support
-------

Contact: [Your Email/Phone]

For issues:
1. Check API is running: client.health_check()
2. Verify network connectivity
3. See troubleshooting in INTEGRATION_QUICK_START.md
4. Contact support with error message

Notes
-----

- API response time: 30-60 seconds (weather data fetch)
- Supported crops: Rice, Wheat, Cotton, Soyabean, Sugarcane, etc.
- Supported seasons: Kharif, Rabi, Summer
- Auto-detects district from coordinates
- Auto-calculates threshold from historical data
