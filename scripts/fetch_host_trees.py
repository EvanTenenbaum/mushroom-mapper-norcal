import requests
import json
import os
import time

# Configuration
HOST_TREES = {
    "coast_live_oak": 47850,
    "tanoak": 69823,
    "douglas_fir": 48256,
    "bishop_pine": 54130,
    "pacific_madrone": 51046
}

# Bounding Box for Northern California (approximate)
# SW: 36.5, -124.5 (Monterey/Ocean)
# NE: 42.0, -120.0 (Oregon Border/Modoc)
BOUNDS = {
    "nelat": 42.0,
    "nelng": -120.0,
    "swlat": 36.5,
    "swlng": -124.5
}

def fetch_observations(taxon_id, limit=200):
    """Fetches research-grade observations for a specific taxon in NorCal."""
    url = "https://api.inaturalist.org/v1/observations"
    params = {
        "taxon_id": taxon_id,
        "quality_grade": "research",
        "geo": "true",
        "nelat": BOUNDS["nelat"],
        "nelng": BOUNDS["nelng"],
        "swlat": BOUNDS["swlat"],
        "swlng": BOUNDS["swlng"],
        "per_page": limit,
        "order": "desc",
        "order_by": "created_at"
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        return data["results"]
    except Exception as e:
        print(f"Error fetching taxon {taxon_id}: {e}")
        return []

def main():
    print("Fetching host tree data from iNaturalist...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "../client/public/data/hosts")
    os.makedirs(output_dir, exist_ok=True)
    
    summary = {}
    
    for name, taxon_id in HOST_TREES.items():
        print(f"Fetching {name} (ID: {taxon_id})...")
        obs = fetch_observations(taxon_id, limit=300) # Limit to 300 for performance
        
        features = []
        for o in obs:
            if o.get("geojson"):
                features.append({
                    "type": "Feature",
                    "geometry": o["geojson"],
                    "properties": {
                        "id": o["id"],
                        "observed_on": o["observed_on"],
                        "quality": o["quality_grade"]
                    }
                })
        
        geojson = {
            "type": "FeatureCollection",
            "features": features
        }
        
        output_path = os.path.join(output_dir, f"{name}.json")
        with open(output_path, "w") as f:
            json.dump(geojson, f)
            
        summary[name] = len(features)
        print(f"Saved {len(features)} points for {name}")
        time.sleep(1.0) # Respect API rate limits
        
    print("Host tree data fetch complete.")
    print(summary)

if __name__ == "__main__":
    main()
