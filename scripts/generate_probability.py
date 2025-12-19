import json
import csv
import random

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
        import os
        # Use relative path from the script location
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(script_dir, "data", "gather_guild_data.csv")
        with open(data_path, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                observations.append(row)
    except FileNotFoundError:
        print(f"Warning: {data_path} not found. Using empty list.")
    return observations

def geocode_location(loc_str):
    """Tries to find coordinates for a location string."""
    # Clean string
    clean_loc = loc_str.replace("'", "").replace('"', "").strip()
    
    # Check lookup
    for key, coords in LOCATION_LOOKUP.items():
        if key in clean_loc:
            # Add small random jitter to prevent exact overlap
            lat = coords[0] + random.uniform(-0.02, 0.02)
            lng = coords[1] + random.uniform(-0.02, 0.02)
            return lat, lng
            
    return None

def generate_heatmap(guild_name, observations):
    """Generates a GeoJSON FeatureCollection of points for a specific guild."""
    features = []
    
    for obs in observations:
        if guild_name in obs["Subject"]:
            # Parse the list string like "['Loc1', 'Loc2']"
            loc_list_str = obs["Recent Locations"]
            # Simple parsing of the list string
            locations = loc_list_str.strip("[]").split(",")
            
            for loc in locations:
                coords = geocode_location(loc)
                if coords:
                    lat, lng = coords
                    
                    # Create a feature for each point
                    feature = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [lng, lat]
                        },
                        "properties": {
                            "intensity": 1.0,
                            "status": obs["Current Status"],
                            "location": loc.strip().replace("'", "").replace('"', "")
                        }
                    }
                    features.append(feature)
                
    return {
        "type": "FeatureCollection",
        "features": features
    }

def main():
    print("Generating probability heatmaps with geocoding...")
    observations = load_observations()
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "../client/public/data/layers")
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    for guild in GUILDS:
        # Simplify guild name for filename
        safe_name = guild.split(" (")[0].lower().replace(" ", "-")
        geojson = generate_heatmap(guild, observations)
        
        output_path = f"{output_dir}/{safe_name}.json"
        with open(output_path, "w") as f:
            json.dump(geojson, f)
        print(f"Generated {output_path} with {len(geojson['features'])} points")

if __name__ == "__main__":
    main()
