import requests
import json
import os
from datetime import datetime, timedelta

def fetch_hyperlocal_weather(lat, lng):
    """
    Fetches historical weather data for a specific coordinate from Open-Meteo.
    Metrics:
    - Precipitation Sum (Last 14 days)
    - Soil Moisture (0-7cm)
    - Soil Temperature (0-7cm)
    """
    
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
            
        # Calculate Aggregates
        precip_total = sum(data["daily"]["precipitation_sum"]) / 25.4 # Convert mm to inches
        avg_soil_temp = sum(data["daily"]["soil_temperature_0_to_7cm_mean"]) / len(data["daily"]["soil_temperature_0_to_7cm_mean"])
        avg_soil_moisture = sum(data["daily"]["soil_moisture_0_to_7cm_mean"]) / len(data["daily"]["soil_moisture_0_to_7cm_mean"])
        
        return {
            "precip_14d_in": precip_total,
            "soil_temp_c": avg_soil_temp,
            "soil_moisture_m3": avg_soil_moisture # Volumetric water content
        }
        
    except Exception as e:
        print(f"Error fetching weather for {lat}, {lng}: {e}")
        return None

def main():
    # Test Point: Salt Point State Park
    lat, lng = 38.5667, -123.3333
    print(f"Fetching hyperlocal weather for Salt Point ({lat}, {lng})...")
    
    data = fetch_hyperlocal_weather(lat, lng)
    if data:
        print(json.dumps(data, indent=2))
    else:
        print("Failed to fetch data.")

if __name__ == "__main__":
    main()
