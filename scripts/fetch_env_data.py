import json
import random
from datetime import datetime, timedelta

# Configuration
AOI_BOUNDS = {
    "north": 42.0,
    "south": 36.5,
    "west": -124.5,
    "east": -119.0
}

def fetch_weather_data():
    """
    Simulates fetching PRISM/Open-Meteo data for the AOI.
    In a real production env, this would call the Open-Meteo API.
    """
    print("Fetching weather data for NorCal AOI...")
    
    # Simulated data for the last 14 days
    today = datetime.now()
    weather_summary = {
        "generated_at": today.isoformat(),
        "regions": {
            "north_coast": {
                "precip_total_14d_in": 4.5,
                "soil_moisture_pct": 85,
                "temp_anomaly_c": 0.5
            },
            "bay_area": {
                "precip_total_14d_in": 2.1,
                "soil_moisture_pct": 65,
                "temp_anomaly_c": 1.2
            },
            "sierra_foothills": {
                "precip_total_14d_in": 3.8,
                "soil_moisture_pct": 72,
                "temp_anomaly_c": -0.5
            }
        }
    }
    
    return weather_summary

def main():
    data = fetch_weather_data()
    
    # Save to client data folder
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "../client/public/data/weather_live.json")
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    
    print(f"Weather data saved to {output_path}")

if __name__ == "__main__":
    main()
