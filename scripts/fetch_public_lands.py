import json
import os
import requests

# In a real production environment, we would fetch the full CPAD GeoJSON.
# However, CPAD is >100MB, so we will simulate it with a simplified GeoJSON 
# of major NorCal public lands for this demo.

PUBLIC_LANDS = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": "Salt Point State Park",
                "agency": "California State Parks",
                "access": "Open"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-123.34, 38.58], [-123.32, 38.58], [-123.32, 38.55], [-123.34, 38.55], [-123.34, 38.58]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Jackson Demonstration State Forest",
                "agency": "CAL FIRE",
                "access": "Open"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-123.75, 39.40], [-123.60, 39.40], [-123.60, 39.30], [-123.75, 39.30], [-123.75, 39.40]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Point Reyes National Seashore",
                "agency": "NPS",
                "access": "Restricted (Permit Required for some areas)"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-123.00, 38.10], [-122.80, 38.10], [-122.80, 37.90], [-123.00, 37.90], [-123.00, 38.10]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Mount Tamalpais State Park",
                "agency": "California State Parks",
                "access": "Open"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-122.65, 37.95], [-122.55, 37.95], [-122.55, 37.85], [-122.65, 37.85], [-122.65, 37.95]
                ]]
            }
        }
    ]
}

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "../client/public/data/layers")
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, "public-lands.json")
    
    with open(output_path, "w") as f:
        json.dump(PUBLIC_LANDS, f, indent=2)
        
    print(f"Generated simulated Public Lands layer at {output_path}")

if __name__ == "__main__":
    main()
