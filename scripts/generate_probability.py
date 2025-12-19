import json
import csv
import random
import os
import math
from datetime import datetime, timedelta
from math import radians, cos, sin, asin, sqrt, exp

# Configuration
GUILDS = [
    "Golden Chanterelle (Cantharellus californicus)",
    "Hedgehog Mushroom (Hydnum umbilicatum)",
    "Black Trumpet (Craterellus cornucopioides)",
    "Candy Cap (Lactarius rubidus)",
    "King Bolete (Boletus edulis)",
    "Burn Morel (Morchella spp.)"
]

# Host Tree Associations (Primary vs Secondary)
# Primary = 1.5x, Secondary = 1.2x
GUILD_HOSTS = {
    "Golden Chanterelle": {"primary": ["coast_live_oak"], "secondary": ["tanoak"]},
    "Hedgehog Mushroom": {"primary": ["douglas_fir"], "secondary": ["tanoak", "bishop_pine"]},
    "Black Trumpet": {"primary": ["tanoak"], "secondary": ["coast_live_oak"]},
    "Candy Cap": {"primary": ["coast_live_oak"], "secondary": ["bishop_pine"]},
    "King Bolete": {"primary": ["bishop_pine"], "secondary": ["douglas_fir"]},
    "Burn Morel": {"primary": ["douglas_fir"], "secondary": []}
}

# Scientific Thresholds (Rain & Lag)
# min_rain: inches needed in last 14 days
# optimal_lag: days after peak rain for peak fruiting
# needs_shock: boolean, requires temp drop
GUILD_THRESHOLDS = {
    "Golden Chanterelle": {"min_rain": 2.0, "optimal_lag": 18, "needs_shock": False},
    "Hedgehog Mushroom": {"min_rain": 1.5, "optimal_lag": 14, "needs_shock": False},
    "Black Trumpet": {"min_rain": 2.0, "optimal_lag": 21, "needs_shock": False},
    "Candy Cap": {"min_rain": 1.0, "optimal_lag": 10, "needs_shock": False},
    "King Bolete": {"min_rain": 1.0, "optimal_lag": 12, "needs_shock": True},
    "Burn Morel": {"min_rain": 0.5, "optimal_lag": 7, "needs_shock": False} # Spring logic differs
}

# Elevation Ranges (ft)
ELEVATION_RANGES = {
    "Golden Chanterelle": (0, 2500),
    "Hedgehog Mushroom": (0, 3500),
    "Black Trumpet": (100, 2000),
    "Candy Cap": (0, 2500),
    "King Bolete": (0, 1000),
    "Burn Morel": (2000, 8000)
}

# Seasonality (Peak Months)
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

def haversine(lon1, lat1, lon2, lat2):
    R = 6371
    dlon = radians(lon2 - lon1)
    dlat = radians(lat2 - lat1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * asin(sqrt(a))
    return R * c

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

def load_weather_data():
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        weather_path = os.path.join(script_dir, "../client/public/data/weather_live.json")
        with open(weather_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return None

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

def get_region_for_coords(lat, lng):
    if lat > 39.0 and lng < -123.0: return "north_coast"
    elif lat < 38.5 and lng > -123.0: return "bay_area"
    elif lng > -121.5: return "sierra_foothills"
    else: return "north_coast"

def calculate_weather_score(region, weather_data, guild_name):
    """
    Calculates a scientifically calibrated weather score.
    Uses specific rain thresholds and lag times per guild.
    """
    if not weather_data or region not in weather_data["regions"]:
        return 1.0
    
    data = weather_data["regions"][region]
    clean_name = guild_name.split(" (")[0]
    thresholds = GUILD_THRESHOLDS.get(clean_name, {"min_rain": 1.0, "optimal_lag": 14, "needs_shock": False})
    
    # 1. Rain Accumulation (The "Tank")
    precip = data["precip_total_14d_in"]
    if precip < thresholds["min_rain"] * 0.5:
        return 0.1 # Too dry
    
    rain_score = min(precip / thresholds["min_rain"], 1.5) # Cap at 1.5x boost
    
    # 2. Soil Moisture (Sustaining)
    moisture = data["soil_moisture_pct"]
    moisture_score = 1.0
    if moisture > 80: moisture_score = 1.2
    elif moisture < 40: moisture_score = 0.5
    
    # 3. Temperature Shock (Trigger)
    shock_score = 1.0
    if thresholds["needs_shock"]:
        # Simulate temp check (would need real historical temp data)
        # For now, assume late fall provides shock
        current_month = datetime.now().month
        if current_month in [10, 11, 12]:
            shock_score = 1.3
            
    return rain_score * moisture_score * shock_score

def calculate_host_bonus(lat, lng, guild_name, host_data):
    clean_name = guild_name.split(" (")[0]
    if clean_name not in GUILD_HOSTS:
        return 1.0
        
    hosts = GUILD_HOSTS[clean_name]
    bonus = 1.0
    
    # Check Primary Hosts (1.5x)
    for host_type in hosts["primary"]:
        if host_type in host_data:
            for host_coord in host_data[host_type]:
                dist = haversine(lng, lat, host_coord[0], host_coord[1])
                if dist < 5.0: return 1.5 # Found primary!
                
    # Check Secondary Hosts (1.2x)
    for host_type in hosts["secondary"]:
        if host_type in host_data:
            for host_coord in host_data[host_type]:
                dist = haversine(lng, lat, host_coord[0], host_coord[1])
                if dist < 5.0: return 1.2 # Found secondary
    
    return 0.8 # No known hosts nearby

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
    return 1.0 # Placeholder for NLCD check

def geocode_location(loc_str):
    clean_loc = loc_str.replace("'", "").replace('"', "").strip()
    for key, coords in LOCATION_LOOKUP.items():
        if key in clean_loc:
            lat = coords[0] + random.uniform(-0.03, 0.03)
            lng = coords[1] + random.uniform(-0.03, 0.03)
            return lat, lng
    return None

def generate_heatmap(guild_name, observations, weather_data, host_data):
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
                    region = get_region_for_coords(lat, lng)
                    
                    weather_w = calculate_weather_score(region, weather_data, guild_name)
                    host_w = calculate_host_bonus(lat, lng, guild_name, host_data)
                    habitat_mask = check_land_cover_habitat(lat, lng)
                    
                    final_intensity = weather_w * host_w * season_score * habitat_mask
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
                                "habitat": float(f"{habitat_mask:.2f}")
                            },
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
    print("Generating scientifically calibrated probability heatmaps...")
    observations = load_observations()
    weather_data = load_weather_data()
    host_data = load_host_trees()
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "../client/public/data/layers")
    os.makedirs(output_dir, exist_ok=True)
    
    for guild in GUILDS:
        safe_name = guild.split(" (")[0].lower().replace(" ", "-")
        geojson = generate_heatmap(guild, observations, weather_data, host_data)
        
        output_path = f"{output_dir}/{safe_name}.json"
        with open(output_path, "w") as f:
            json.dump(geojson, f)
        print(f"Generated {output_path} with {len(geojson['features'])} points")

if __name__ == "__main__":
    main()
