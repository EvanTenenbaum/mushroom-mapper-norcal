import json
import csv
import random
import os
import math

# Configuration
GUILDS = [
    "Golden Chanterelle (Cantharellus californicus)",
    "Hedgehog Mushroom (Hydnum umbilicatum)",
    "Black Trumpet (Craterellus cornucopioides)",
    "Candy Cap (Lactarius rubidus)",
    "King Bolete (Boletus edulis)",
    "Burn Morel (Morchella spp.)"
]

# Simple Geocoding Lookup for NorCal Mushroom Spots
LOCATION_LOOKUP = {
    "Salt Point State Park": (38.5667, -123.3333),
    "Sonoma County": (38.5780, -122.9888),
    "Castle Crags": (41.1533, -122.3278),
    "Bay Area": (37.7749, -122.4194),
    "Orick": (41.2876, -124.0612),
    "Fort Bragg": (39.4457, -123.8053),
    "Inverness": (38.1010, -122.8569),
    "Jenner": (38.4499, -123.1156),
    "Jackson Demonstration State Forest": (39.3667, -123.6500),
    "The Sea Ranch": (38.7082, -123.4544),
    "Gary Giacomini Open Space Preserve": (37.9950, -122.6300),
    "Lagunitas-Forest Knolls": (38.0130, -122.6930),
    "Shasta-Trinity National Forest": (40.8333, -122.5000),
    "Mill Valley": (37.9060, -122.5450),
    "Baltimore Canyon Open Space Preserve": (37.9300, -122.5500),
    "Big Sur": (36.2704, -121.8081),
    "Willits": (39.4096, -123.3556),
    "Mendocino": (39.3077, -123.7995),
    "Arcata": (40.8665, -124.0828),
    "Point Reyes": (38.0691, -122.8069),
    "Headwaters Trail, Eureka": (40.7500, -124.1500),
    "Chester": (40.3063, -121.2311)
}

def load_observations():
    """Loads the gathered iNaturalist data from CSV."""
    observations = []
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(script_dir, "data", "gather_guild_data.csv")
        with open(data_path, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                observations.append(row)
    except FileNotFoundError:
        print(f"Warning: {data_path} not found. Using empty list.")
    return observations

def load_weather_data():
    """Loads the live weather JSON."""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        weather_path = os.path.join(script_dir, "../client/public/data/weather_live.json")
        with open(weather_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print("Warning: Weather data not found. Using defaults.")
        return None

def get_region_for_coords(lat, lng):
    """Determines which weather region a point belongs to."""
    # Simplified bounding boxes for regions
    if lat > 39.0 and lng < -123.0:
        return "north_coast"
    elif lat < 38.5 and lng > -123.0:
        return "bay_area"
    elif lng > -121.5:
        return "sierra_foothills"
    else:
        return "north_coast" # Default fallback

def calculate_weather_weight(region, weather_data):
    """Calculates a probability multiplier based on weather conditions."""
    if not weather_data or region not in weather_data["regions"]:
        return 1.0
    
    data = weather_data["regions"][region]
    
    # Soil Moisture Factor (Ideal: 60-90%)
    moisture = data["soil_moisture_pct"]
    moisture_factor = 1.0
    if moisture > 80: moisture_factor = 1.2
    elif moisture > 60: moisture_factor = 1.0
    elif moisture > 40: moisture_factor = 0.7
    else: moisture_factor = 0.3
    
    # Precip Factor (Ideal: > 2 inches in last 14 days)
    precip = data["precip_total_14d_in"]
    precip_factor = 1.0
    if precip > 4.0: precip_factor = 1.3
    elif precip > 2.0: precip_factor = 1.1
    elif precip > 0.5: precip_factor = 0.8
    else: precip_factor = 0.4
    
    return moisture_factor * precip_factor

def geocode_location(loc_str):
    """Tries to find coordinates for a location string."""
    clean_loc = loc_str.replace("'", "").replace('"', "").strip()
    for key, coords in LOCATION_LOOKUP.items():
        if key in clean_loc:
            lat = coords[0] + random.uniform(-0.02, 0.02)
            lng = coords[1] + random.uniform(-0.02, 0.02)
            return lat, lng
    return None

def generate_heatmap(guild_name, observations, weather_data):
    """Generates a GeoJSON FeatureCollection with weather-weighted intensity."""
    features = []
    
    for obs in observations:
        if guild_name in obs["Subject"]:
            loc_list_str = obs["Recent Locations"]
            locations = loc_list_str.strip("[]").split(",")
            
            for loc in locations:
                coords = geocode_location(loc)
                if coords:
                    lat, lng = coords
                    region = get_region_for_coords(lat, lng)
                    weight = calculate_weather_weight(region, weather_data)
                    
                    feature = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [lng, lat]
                        },
                        "properties": {
                            "intensity": float(f"{weight:.2f}"), # Apply weather weight
                            "status": obs["Current Status"],
                            "location": loc.strip().replace("'", "").replace('"', ""),
                            "region": region
                        }
                    }
                    features.append(feature)
                
    return {
        "type": "FeatureCollection",
        "features": features
    }

def main():
    print("Generating weather-weighted probability heatmaps...")
    observations = load_observations()
    weather_data = load_weather_data()
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "../client/public/data/layers")
    os.makedirs(output_dir, exist_ok=True)
    
    for guild in GUILDS:
        safe_name = guild.split(" (")[0].lower().replace(" ", "-")
        geojson = generate_heatmap(guild, observations, weather_data)
        
        output_path = f"{output_dir}/{safe_name}.json"
        with open(output_path, "w") as f:
            json.dump(geojson, f)
        print(f"Generated {output_path} with {len(geojson['features'])} points")

if __name__ == "__main__":
    main()
