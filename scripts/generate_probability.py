import json
import csv
import random
import os
import math
import requests
from datetime import datetime, timedelta
from math import radians, cos, sin, asin, sqrt, atan2, degrees

# Configuration
GUILDS = [
    "Golden Chanterelle (Cantharellus californicus)",
    "Hedgehog Mushroom (Hydnum umbilicatum)",
    "Black Trumpet (Craterellus cornucopioides)",
    "Candy Cap (Lactarius rubidus)",
    "King Bolete (Boletus edulis)",
    "Burn Morel (Morchella spp.)"
]

# Host Tree Associations
GUILD_HOSTS = {
    "Golden Chanterelle": {"primary": ["coast_live_oak"], "secondary": ["tanoak"]},
    "Hedgehog Mushroom": {"primary": ["douglas_fir"], "secondary": ["tanoak", "bishop_pine"]},
    "Black Trumpet": {"primary": ["tanoak"], "secondary": ["coast_live_oak"]},
    "Candy Cap": {"primary": ["coast_live_oak"], "secondary": ["bishop_pine"]},
    "King Bolete": {"primary": ["bishop_pine"], "secondary": ["douglas_fir"]},
    "Burn Morel": {"primary": ["douglas_fir"], "secondary": []}
}

# Scientific Thresholds
GUILD_THRESHOLDS = {
    "Golden Chanterelle": {"min_rain": 2.0, "optimal_lag": 18, "needs_shock": False},
    "Hedgehog Mushroom": {"min_rain": 1.5, "optimal_lag": 14, "needs_shock": False},
    "Black Trumpet": {"min_rain": 2.0, "optimal_lag": 21, "needs_shock": False},
    "Candy Cap": {"min_rain": 1.0, "optimal_lag": 10, "needs_shock": False},
    "King Bolete": {"min_rain": 1.0, "optimal_lag": 12, "needs_shock": True},
    "Burn Morel": {"min_rain": 0.5, "optimal_lag": 7, "needs_shock": False}
}

# Seasonality
SEASONALITY = {
    "Golden Chanterelle": [11, 12, 1, 2, 3, 4],
    "Hedgehog Mushroom": [12, 1, 2, 3],
    "Black Trumpet": [12, 1, 2, 3],
    "Candy Cap": [12, 1, 2, 3],
    "King Bolete": [10, 11, 12],
    "Burn Morel": [4, 5, 6]
}

# Simple Geocoding Lookup
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
    "Chester": (40.3063, -121.2311),
    "Santa Cruz": (36.9741, -122.0308),
    "Oakland Hills": (37.8044, -122.2712),
    "Marin Watershed": (37.9600, -122.5800)
}

# Cache for weather data to avoid API spam
WEATHER_CACHE = {}

def haversine(lon1, lat1, lon2, lat2):
    R = 6371
    dlon = radians(lon2 - lon1)
    dlat = radians(lat2 - lat1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * asin(sqrt(a))
    return R * c

def fetch_hyperlocal_weather(lat, lng):
    """Fetches real historical weather for specific coords."""
    key = f"{lat:.3f},{lng:.3f}"
    if key in WEATHER_CACHE:
        return WEATHER_CACHE[key]
        
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=14)).strftime("%Y-%m-%d")
    
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lng,
        "start_date": start_date,
        "end_date": end_date,
        "daily": ["precipitation_sum", "soil_temperature_0_to_7cm_mean", "soil_moisture_0_to_7cm_mean"],
        "timezone": "America/Los_Angeles"
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if "daily" not in data:
            return None
            
        precip_total = sum(data["daily"]["precipitation_sum"]) / 25.4 # mm to inches
        avg_soil_temp = sum(data["daily"]["soil_temperature_0_to_7cm_mean"]) / len(data["daily"]["soil_temperature_0_to_7cm_mean"])
        avg_soil_moisture = sum(data["daily"]["soil_moisture_0_to_7cm_mean"]) / len(data["daily"]["soil_moisture_0_to_7cm_mean"])
        
        result = {
            "precip_14d_in": precip_total,
            "soil_temp_c": avg_soil_temp,
            "soil_moisture_m3": avg_soil_moisture
        }
        WEATHER_CACHE[key] = result
        return result
        
    except Exception as e:
        print(f"Error fetching weather: {e}")
        return None

def get_aspect_score(lat, lng):
    """
    Simulates Aspect (Slope Direction) calculation.
    In production, this would query an Elevation API grid.
    For now, we simulate North/East facing slopes being wetter.
    """
    # Randomly assign an aspect for simulation purposes
    # 0=N, 90=E, 180=S, 270=W
    # We want to favor N (0) and E (90)
    aspect = (lat * 1000 + lng * 1000) % 360 
    
    if aspect < 45 or aspect > 315: # North Facing
        return 1.3 # Cool, wet, mossy
    elif aspect >= 45 and aspect < 135: # East Facing
        return 1.2 # Morning sun, cool afternoon
    elif aspect >= 135 and aspect < 225: # South Facing
        return 0.7 # Hot, dry, bad for mushrooms
    else: # West Facing
        return 0.9 # Afternoon sun, dries out
        
def calculate_weather_score(lat, lng, guild_name):
    """
    Uses HYPERLOCAL weather data instead of regional averages.
    """
    weather = fetch_hyperlocal_weather(lat, lng)
    if not weather:
        return 1.0 # Fallback
        
    clean_name = guild_name.split(" (")[0]
    thresholds = GUILD_THRESHOLDS.get(clean_name, {"min_rain": 1.0, "optimal_lag": 14, "needs_shock": False})
    
    # 1. Rain Accumulation
    precip = weather["precip_14d_in"]
    if precip < thresholds["min_rain"] * 0.5:
        return 0.1 # Too dry
    
    rain_score = min(precip / thresholds["min_rain"], 1.5)
    
    # 2. Soil Moisture
    moisture = weather["soil_moisture_m3"]
    moisture_score = 1.0
    if moisture > 0.35: moisture_score = 1.2 # >35% volumetric is very wet
    elif moisture < 0.15: moisture_score = 0.5 # <15% is dry
    
    # 3. Temperature Shock
    shock_score = 1.0
    if thresholds["needs_shock"]:
        if weather["soil_temp_c"] < 15.0: # Real soil temp check!
            shock_score = 1.3
            
    return rain_score * moisture_score * shock_score

def calculate_host_bonus(lat, lng, guild_name, host_data):
    clean_name = guild_name.split(" (")[0]
    if clean_name not in GUILD_HOSTS:
        return 1.0
        
    hosts = GUILD_HOSTS[clean_name]
    
    # Check Primary Hosts (1.5x)
    for host_type in hosts["primary"]:
        if host_type in host_data:
            for host_coord in host_data[host_type]:
                dist = haversine(lng, lat, host_coord[0], host_coord[1])
                if dist < 5.0: return 1.5
                
    # Check Secondary Hosts (1.2x)
    for host_type in hosts["secondary"]:
        if host_type in host_data:
            for host_coord in host_data[host_type]:
                dist = haversine(lng, lat, host_coord[0], host_coord[1])
                if dist < 5.0: return 1.2
    
    return 0.8

def calculate_seasonality_score(guild_name):
    current_month = datetime.now().month
    clean_name = guild_name.split(" (")[0]
    if clean_name in SEASONALITY:
        if current_month in SEASONALITY[clean_name]:
            return 1.2
        else:
            return 0.1
    return 1.0

def check_land_cover_habitat(lat, lng):
    return 1.0

def load_observations():
    observations = []
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(script_dir, "data", "gather_guild_data.csv")
        with open(data_path, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                observations.append(row)
    except FileNotFoundError:
        print(f"Warning: {data_path} not found.")
    return observations

def load_host_trees():
    hosts = {}
    script_dir = os.path.dirname(os.path.abspath(__file__))
    host_dir = os.path.join(script_dir, "../client/public/data/hosts")
    for filename in os.listdir(host_dir):
        if filename.endswith(".json"):
            name = filename.replace(".json", "")
            with open(os.path.join(host_dir, filename), "r") as f:
                data = json.load(f)
                coords = []
                for feature in data["features"]:
                    coords.append(feature["geometry"]["coordinates"])
                hosts[name] = coords
    return hosts

def geocode_location(loc_str):
    clean_loc = loc_str.replace("'", "").replace('"', "").strip()
    for key, coords in LOCATION_LOOKUP.items():
        if key in clean_loc:
            lat = coords[0] + random.uniform(-0.03, 0.03)
            lng = coords[1] + random.uniform(-0.03, 0.03)
            return lat, lng
    return None

def generate_heatmap(guild_name, observations, host_data):
    features = []
    season_score = calculate_seasonality_score(guild_name)
    
    for obs in observations:
        if guild_name in obs["Subject"]:
            loc_list_str = obs["Recent Locations"]
            locations = loc_list_str.strip("[]").split(",")
            
            for loc in locations:
                coords = geocode_location(loc)
                if coords:
                    lat, lng = coords
                    
                    # 1. Hyperlocal Weather
                    weather_w = calculate_weather_score(lat, lng, guild_name)
                    
                    # 2. Host Tree Bonus
                    host_w = calculate_host_bonus(lat, lng, guild_name, host_data)
                    
                    # 3. Aspect (Slope Direction) - NEW!
                    aspect_w = get_aspect_score(lat, lng)
                    
                    # 4. Habitat Mask
                    habitat_mask = check_land_cover_habitat(lat, lng)
                    
                    final_intensity = weather_w * host_w * season_score * aspect_w * habitat_mask
                    final_intensity = min(max(final_intensity, 0.1), 5.0)
                    
                    feature = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [lng, lat]
                        },
                        "properties": {
                            "intensity": float(f"{final_intensity:.2f}"),
                            "factors": {
                                "weather": float(f"{weather_w:.2f}"),
                                "host": float(f"{host_w:.2f}"),
                                "season": float(f"{season_score:.2f}"),
                                "aspect": float(f"{aspect_w:.2f}"),
                                "habitat": float(f"{habitat_mask:.2f}")
                            },
                            "location": loc.strip().replace("'", "").replace('"', "")
                        }
                    }
                    features.append(feature)
                
    return {
        "type": "FeatureCollection",
        "features": features
    }

def main():
    print("Generating HYPERLOCAL probability heatmaps...")
    observations = load_observations()
    host_data = load_host_trees()
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "../client/public/data/layers")
    os.makedirs(output_dir, exist_ok=True)
    
    for guild in GUILDS:
        safe_name = guild.split(" (")[0].lower().replace(" ", "-")
        geojson = generate_heatmap(guild, observations, host_data)
        
        output_path = f"{output_dir}/{safe_name}.json"
        with open(output_path, "w") as f:
            json.dump(geojson, f)
        print(f"Generated {output_path} with {len(geojson['features'])} points")

if __name__ == "__main__":
    main()
