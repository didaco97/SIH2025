// Configuration
const API_URL = 'http://localhost:8001';
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_ZOOM = 18;

let map;
let currentPolygon = null;
let geoJsonData = null;

// Initialize Google Map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        mapTypeId: 'hybrid',
        draggableCursor: 'crosshair',
        clickableIcons: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
    });

    // Add click listener
    map.addListener('click', handleMapClick);
}

// Handle map click
async function handleMapClick(event) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    console.log(`Clicked at: ${lat}, ${lng}`);
    showLoading(true);

    try {
        const response = await fetch(`${API_URL}/segment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lng })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to segment');
        }

        geoJsonData = await response.json();
        displayResults(geoJsonData);

    } catch (error) {
        console.error('Segmentation error:', error);
        alert(`Error: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Display results on map and UI
function displayResults(geojson) {
    // Clear previous polygon from map
    if (currentPolygon) {
        currentPolygon.setMap(null);
    }

    if (!geojson.features || geojson.features.length === 0) {
        alert('No segmentation found at this location.');
        return;
    }

    const feature = geojson.features[0];
    const coordinates = feature.geometry.coordinates[0];

    // Draw polygon on map
    const path = coordinates.map(coord => ({ lat: coord[1], lng: coord[0] }));
    currentPolygon = new google.maps.Polygon({
        paths: path,
        strokeColor: '#ffffff',
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: '#4ade80',
        fillOpacity: 0.5,
    });
    currentPolygon.setMap(map);

    // Fit map to polygon bounds
    const bounds = new google.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    map.fitBounds(bounds);

    // Update SVG visualization
    updatePolygonSVG(coordinates);

    // Update details
    updateDetails(feature);
}

// Update the SVG polygon visualization
function updatePolygonSVG(coordinates) {
    const svg = document.getElementById('polygon-svg');

    // Calculate bounds
    const lons = coordinates.map(c => c[0]);
    const lats = coordinates.map(c => c[1]);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const lonSpan = maxLon - minLon;
    const latSpan = maxLat - minLat;
    const maxSpan = Math.max(lonSpan, latSpan);

    // Calculate offsets to center
    const xOffset = (100 - (lonSpan / maxSpan) * 100) / 2;
    const yOffset = (100 - (latSpan / maxSpan) * 100) / 2;

    // Generate SVG points
    const points = coordinates.map(c => {
        const x = xOffset + ((c[0] - minLon) / maxSpan) * 100;
        const y = yOffset + ((maxLat - c[1]) / maxSpan) * 100;
        return `${x},${y}`;
    }).join(' ');

    svg.innerHTML = `<polygon points="${points}" />`;
}

// Update details panel
function updateDetails(feature) {
    const areaValue = document.getElementById('area-value');
    const areaAcres = document.getElementById('area-acres');
    const coordinates = document.getElementById('coordinates');

    const area = feature.properties?.area_m2;

    if (area) {
        areaValue.textContent = `${area.toFixed(2)} m²`;
        areaAcres.textContent = `≈ ${(area * 0.000247105).toFixed(4)} acres`;
    } else {
        areaValue.textContent = 'N/A';
        areaAcres.textContent = '';
    }

    coordinates.textContent = JSON.stringify(feature.geometry, null, 2);
}

// Show/hide loading indicator
function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.classList.toggle('hidden', !show);
}

// Make initMap available globally for Google Maps callback
window.initMap = initMap;
