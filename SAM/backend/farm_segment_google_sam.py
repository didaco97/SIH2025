#!/usr/bin/env python3
"""
farm_segment_google_sam.py

Downloads satellite tiles from Google Static Maps and runs Meta's Segment-Anything (SAM)
for interactive farm boundary segmentation using point prompts.
"""

import os
import sys
import math
import io
import json
from typing import Tuple, List

import requests
import numpy as np
from PIL import Image
import shapely.geometry as geom
import geopandas as gpd
import rasterio.features
import rasterio.transform

from segment_anything import sam_model_registry, SamPredictor
import torch

# ---- Google Static Maps downloader helpers ---------------------------------
GOOGLE_STATIC_MAPS_URL = "https://maps.googleapis.com/maps/api/staticmap"

def google_static_map_tile(center_lat: float, center_lon: float, zoom: int, size: int, api_key: str) -> Image.Image:
    """
    Download one static map tile centered at lat,lon with zoom and size (px).
    maptype=satellite to get satellite imagery.
    """
    params = {
        "center": f"{center_lat},{center_lon}",
        "zoom": str(zoom),
        "size": f"{size}x{size}",
        "maptype": "satellite",
        "scale": "1",
        "key": api_key
    }
    r = requests.get(GOOGLE_STATIC_MAPS_URL, params=params, timeout=30)
    r.raise_for_status()
    return Image.open(io.BytesIO(r.content)).convert("RGB")

def meters_per_pixel(lat: float, zoom: int) -> float:
    tile_size = 256.0
    earth_circumference = 40075016.686
    return (math.cos(math.radians(lat)) * earth_circumference) / (2 ** zoom * tile_size)

def bbox_from_center(center_lat, center_lon, zoom, total_px_w, total_px_h) -> Tuple[float,float,float,float]:
    """
    Compute approximate bounding box (min_lon, min_lat, max_lon, max_lat)
    for an image centered at center lat/lon.
    """
    mpp = meters_per_pixel(center_lat, zoom)
    half_w_m = (total_px_w / 2.0) * mpp
    half_h_m = (total_px_h / 2.0) * mpp

    deg_per_m_lat = 1.0 / 111320.0
    min_lat = center_lat - half_h_m * deg_per_m_lat
    max_lat = center_lat + half_h_m * deg_per_m_lat

    deg_per_m_lon = 1.0 / (111320.0 * math.cos(math.radians(center_lat)))
    min_lon = center_lon - half_w_m * deg_per_m_lon
    max_lon = center_lon + half_w_m * deg_per_m_lon

    return min_lon, min_lat, max_lon, max_lat

# ---- SAM download & setup -------------------------------------------------
def get_sam_model(checkpoint_path: str = "sam_vit_h.pth", model_type: str = "vit_h"):
    """
    Downloads or loads a SAM checkpoint and returns a sam model instance and device.
    """
    default_url = "https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth"
    if not os.path.exists(checkpoint_path):
        print("Downloading SAM checkpoint (this can be large, ~2.4GB)...")
        r = requests.get(default_url, stream=True, timeout=60)
        r.raise_for_status()
        with open(checkpoint_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print("Downloaded SAM checkpoint to", checkpoint_path)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print("Loading SAM model on device:", device)
    sam = sam_model_registry[model_type](checkpoint=checkpoint_path)
    sam.to(device=device)
    return sam, device

_predictor_cache = {}

def get_sam_predictor(checkpoint_path: str = "sam_vit_h.pth", model_type: str = "vit_h"):
    global _predictor_cache
    if checkpoint_path in _predictor_cache:
        return _predictor_cache[checkpoint_path]
        
    sam, device = get_sam_model(checkpoint_path, model_type)
    predictor = SamPredictor(sam)
    _predictor_cache[checkpoint_path] = predictor
    return predictor

# ---- mask -> polygon conversion helpers -----------------------------------
def masks_to_polygons(masks: List[np.ndarray], bbox: Tuple[float,float,float,float]) -> List[geom.Polygon]:
    """
    Convert boolean masks (2D numpy arrays) to shapely Polygons in lat/lon.
    bbox = (min_lon, min_lat, max_lon, max_lat)
    """
    min_lon, min_lat, max_lon, max_lat = bbox
    polygons = []
    for mask in masks:
        h, w = mask.shape
        mask_uint = (mask.astype(np.uint8))
        transform = rasterio.transform.from_bounds(min_lon, min_lat, max_lon, max_lat, w, h)
        for geom_json, val in rasterio.features.shapes(mask_uint, mask=mask_uint.astype(bool), transform=transform):
            if val == 1:
                poly = geom.shape(geom_json)
                if poly.is_valid and poly.area > 0:
                    polygons.append(poly)
    return polygons

# ---- Interactive Segmentation ----------------------------------------------
def segment_from_point(api_key: str, lat: float, lon: float, zoom: int = 19, tile_px: int = 640):
    """
    Segment a farm at the given lat/lon using a point prompt.
    Downloads a single tile centered at lat/lon, runs SAM with the center point as prompt.
    """
    # Configure logging
    import logging
    logging.basicConfig(filename='debug_sam.log', level=logging.INFO, 
                        format='%(asctime)s %(message)s', filemode='a')
    
    logging.info(f"--- Processing Request: {lat}, {lon} ---")
    
    try:
        print(f"Downloading tile at {lat}, {lon}...")
        img = google_static_map_tile(lat, lon, zoom, tile_px, api_key)
        img_np = np.array(img)
        
        # Log image stats
        logging.info(f"Image shape: {img_np.shape}, Mean: {img_np.mean():.2f}, Std: {img_np.std():.2f}")
        if img_np.std() < 5:
            logging.warning("Image seems blank or uniform!")
    except Exception as e:
        logging.error(f"Image download failed: {e}")
        raise e
    
    bbox = bbox_from_center(lat, lon, zoom, tile_px, tile_px)
    logging.info(f"BBox: {bbox}")
    
    checkpoint_path = os.path.join(os.path.dirname(__file__), "sam_vit_h.pth")
    if not os.path.exists(checkpoint_path):
        checkpoint_path = "sam_vit_h.pth"
        
    predictor = get_sam_predictor(checkpoint_path=checkpoint_path)
    predictor.set_image(img_np)
    
    # Use center point as prompt
    center_x, center_y = tile_px // 2, tile_px // 2
    input_point = np.array([[center_x, center_y]])
    input_label = np.array([1])  # 1 = foreground
    
    # Generate multiple masks
    masks, scores, logits = predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        multimask_output=True,
    )
    
    # SAM returns 3 masks with multimask_output=True
    # Select the best mask based on:
    # 1. Score (SAM's confidence)
    # 2. Size (not too small, not too large - farm-sized)
    # 3. Contains the click point
    
    best_mask = None
    best_score = -1
    total_pixels = tile_px * tile_px
    
    for i, (mask, score) in enumerate(zip(masks, scores)):
        mask_area = mask.sum()
        area_ratio = mask_area / total_pixels
        
        logging.info(f"Mask {i}: score={score:.3f}, area_ratio={area_ratio:.4f} ({area_ratio*100:.2f}%)")
        
        # Skip masks that are too small (<0.2%) or too large (>80%)
        # Lowered threshold to 0.002 to catch small plots
        if area_ratio < 0.002 or area_ratio > 0.80:
            print(f"  Mask {i}: score={score:.3f}, area={area_ratio*100:.1f}% - SKIPPED (size)")
            logging.info(f"Mask {i} SKIPPED (size)")
            continue
            
        # Check if mask contains the click point
        if not mask[center_y, center_x]:
            print(f"  Mask {i}: score={score:.3f}, area={area_ratio*100:.1f}% - SKIPPED (no center)")
            logging.info(f"Mask {i} SKIPPED (no center at {center_x},{center_y})")
            continue
        
        print(f"  Mask {i}: score={score:.3f}, area={area_ratio*100:.1f}% - CANDIDATE")
        
        # Prefer masks with reasonable area (5-50% of tile)
        area_score = 1.0 - abs(area_ratio - 0.25) * 2  # Peak at 25%
        combined_score = score * 0.7 + area_score * 0.3
        
        if combined_score > best_score:
            best_score = combined_score
            best_mask = mask
    
    # Fallback to highest scoring mask if no good candidate found
    if best_mask is None:
        print("  No suitable mask found, using highest score")
        logging.warning("No suitable mask found, using highest score fallback")
        best_idx = np.argmax(scores)
        best_mask = masks[best_idx]
    
    polygons = masks_to_polygons([best_mask], bbox)
    logging.info(f"Generated {len(polygons)} polygons")
    
    if not polygons:
        return {"type": "FeatureCollection", "features": []}
        
    # Sort by area descending to find the main field and ignore noise
    polygons.sort(key=lambda p: p.area, reverse=True)
    
    # Keep only the largest polygon
    if len(polygons) > 1:
        logging.info(f"Filtering noise: Keeping largest polygon of {len(polygons)}")
        polygons = [polygons[0]]
        
    gdf = gpd.GeoDataFrame({'geometry': polygons})
    gdf = gdf.set_crs(epsg=4326)
    
    # Calculate area
    try:
        gdf['area_m2'] = gdf.to_crs(epsg=3857).area
        logging.info(f"Calculated area: {gdf['area_m2'].values[0]} m2")
    except Exception as e:
        logging.error(f"Area calculation failed: {e}")
        gdf['area_m2'] = None
    
    return json.loads(gdf.to_json())

