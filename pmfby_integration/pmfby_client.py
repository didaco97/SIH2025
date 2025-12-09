"""
PMFBY API Client
================
Python client for integrating with PMFBY API from another system.

Usage:
    from pmfby_client import PMFBYClient
    
    client = PMFBYClient('http://192.168.1.100:5000')
    result = client.predict(19.54841, 74.188663, 'Rice', 'Kharif', 10)
"""

import requests
from typing import Dict, Optional


class PMFBYClient:
    """Client for PMFBY Yield Prediction API"""
    
    def __init__(self, api_url: str, api_key: Optional[str] = None, timeout: int = 60):
        """
        Initialize PMFBY API client.
        
        Args:
            api_url: Base URL of API (e.g., 'http://192.168.1.100:5000')
            api_key: Optional API key for authentication
            timeout: Request timeout in seconds (default: 60)
        """
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.timeout = timeout
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({'X-API-Key': api_key})
    
    def health_check(self) -> Dict:
        """
        Check if API is running.
        
        Returns:
            dict: {'status': 'ok', 'model': 'v1 (81.8% accuracy)', ...}
        """
        url = f'{self.api_url}/api/health'
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {'status': 'error', 'message': str(e)}
    
    def get_threshold(
        self,
        latitude: float,
        longitude: float,
        crop: str,
        season: str,
        district: Optional[str] = None
    ) -> Dict:
        """
        Calculate PMFBY threshold only.
        
        Args:
            latitude: Farm latitude (decimal degrees)
            longitude: Farm longitude (decimal degrees)
            crop: Crop name (Rice, Wheat, Cotton, etc.)
            season: Growing season (Kharif, Rabi, Summer)
            district: Optional district override
        
        Returns:
            dict: {
                'success': True,
                'threshold': 1640,
                'district': 'Ahmednagar',
                'calculation_method': '...',
                'unit': 'kg/ha'
            }
        """
        url = f'{self.api_url}/api/threshold'
        
        data = {
            'latitude': latitude,
            'longitude': longitude,
            'crop': crop,
            'season': season
        }
        
        if district:
            data['district'] = district
        
        try:
            response = self.session.post(url, json=data, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {'success': False, 'error': str(e)}
    
    def predict(
        self,
        latitude: float,
        longitude: float,
        crop: str,
        season: str,
        area: float,
        year: Optional[int] = None,
        district: Optional[str] = None,
        threshold: Optional[float] = None
    ) -> Dict:
        """
        Get full yield prediction with PMFBY assessment.
        
        Args:
            latitude: Farm latitude (decimal degrees)
            longitude: Farm longitude (decimal degrees)
            crop: Crop name (Rice, Wheat, Cotton, Soyabean, etc.)
            season: Growing season (Kharif, Rabi, Summer)
            area: Farm area in hectares
            year: Optional crop year (default: current year - 1)
            district: Optional district override (auto-detected if not provided)
            threshold: Optional threshold override (auto-calculated if not provided)
        
        Returns:
            dict: {
                'success': True,
                'data': {
                    'location': {...},
                    'crop_info': {...},
                    'prediction': {
                        'predicted_yield': 2144,
                        'uncertainty': 662,
                        'confidence_interval': [340, 2933],
                        'total_production': 21440
                    },
                    'pmfby': {
                        'threshold': 1640,
                        'claim_triggered': False,
                        'claim_probability': 20.3
                    },
                    'weather': {...},
                    'soil': {...},
                    'stress': {...},
                    'model': {'accuracy': 81.8}
                }
            }
        """
        url = f'{self.api_url}/api/predict'
        
        data = {
            'latitude': latitude,
            'longitude': longitude,
            'crop': crop,
            'season': season,
            'area': area
        }
        
        if year:
            data['year'] = year
        if district:
            data['district'] = district
        if threshold:
            data['threshold'] = threshold
        
        try:
            response = self.session.post(url, json=data, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {'success': False, 'error': str(e)}
    
    def batch_predict(self, farms: list) -> list:
        """
        Predict for multiple farms.
        
        Args:
            farms: List of dicts with farm details
                [
                    {'latitude': 19.54, 'longitude': 74.18, 'crop': 'Rice', ...},
                    ...
                ]
        
        Returns:
            list: List of prediction results
        """
        results = []
        for farm in farms:
            result = self.predict(**farm)
            results.append(result)
        return results


# Example usage
if __name__ == '__main__':
    # Initialize client
    client = PMFBYClient('http://localhost:5000')
    
    print("=" * 70)
    print("PMFBY API CLIENT TEST")
    print("=" * 70)
    
    # 1. Health check
    print("\n[1] Health Check...")
    health = client.health_check()
    print(f"    Status: {health.get('status')}")
    print(f"    Model: {health.get('model')}")
    
    # 2. Get threshold
    print("\n[2] Get Threshold...")
    threshold_result = client.get_threshold(
        latitude=19.54841,
        longitude=74.188663,
        crop='Rice',
        season='Kharif'
    )
    
    if threshold_result.get('success'):
        print(f"    District: {threshold_result['district']}")
        print(f"    Threshold: {threshold_result['threshold']} kg/ha")
    else:
        print(f"    Error: {threshold_result.get('error')}")
    
    # 3. Full prediction
    print("\n[3] Full Prediction...")
    result = client.predict(
        latitude=19.54841,
        longitude=74.188663,
        crop='Rice',
        season='Kharif',
        area=10
    )
    
    if result.get('success'):
        data = result['data']
        
        print(f"\n    Location: {data['location']['district']}")
        print(f"    Crop: {data['crop_info']['crop']} ({data['crop_info']['season']})")
        print(f"    Area: {data['crop_info']['area']} ha")
        
        print(f"\n    Predicted Yield: {data['prediction']['predicted_yield']} kg/ha")
        print(f"    Total Production: {data['prediction']['total_production']} kg")
        print(f"    Uncertainty: ±{data['prediction']['uncertainty']} kg/ha")
        
        print(f"\n    Threshold: {data['pmfby']['threshold']} kg/ha")
        print(f"    Claim Triggered: {data['pmfby']['claim_triggered']}")
        print(f"    Claim Probability: {data['pmfby']['claim_probability']}%")
        
        print(f"\n    Model Accuracy: {data['model']['accuracy']}%")
    else:
        print(f"    Error: {result.get('error')}")
    
    print("\n" + "=" * 70)
    print("TEST COMPLETE")
    print("=" * 70)
