import guildsData from "@/data/guilds.json";

// Helper to get guild color
const getGuildColor = (guildId: string) => {
  const guild = guildsData.find(g => g.id === guildId);
  return guild ? guild.color : '#FFFFFF';
};

export const updateProbabilityLayer = (map: google.maps.Map, guildId: string) => {
  // In a real app, this would load a specific tile layer for the guild
  // For this demo, we will simulate "hotspots" using circles based on the guild's hotspots
  
  const guild = guildsData.find(g => g.id === guildId);
  if (!guild) return { remove: () => {} };

  const circles: google.maps.Circle[] = [];

  // Simulated coordinates for hotspots (hardcoded for demo visualization)
  const hotspotCoords: Record<string, google.maps.LatLngLiteral> = {
    "Salt Point State Park": { lat: 38.5667, lng: -123.3333 },
    "Santa Cruz Mountains": { lat: 37.1111, lng: -121.8333 },
    "East Bay Regional Parks": { lat: 37.8500, lng: -122.1500 },
    "Mendocino Coast": { lat: 39.3077, lng: -123.7995 },
    "Sonoma Coast": { lat: 38.4000, lng: -123.1000 },
    "Jackson Demonstration State Forest": { lat: 39.3667, lng: -123.6500 },
    "San Francisco Bay Area": { lat: 37.7749, lng: -122.4194 },
    "North Coast": { lat: 40.8021, lng: -124.1637 },
    "Mendonoma Coast": { lat: 38.8000, lng: -123.5000 },
    "Sierra Nevada (Summer)": { lat: 39.0000, lng: -120.0000 },
    "Park Fire Burn Scar": { lat: 40.0000, lng: -121.6000 }, // Approx
    "Smith River Complex Burn Scar": { lat: 41.9000, lng: -123.9000 } // Approx
  };

  guild.hotspots.forEach(spotName => {
    const center = hotspotCoords[spotName];
    if (center) {
      // Create a "glow" effect with multiple circles
      const outerCircle = new google.maps.Circle({
        strokeColor: guild.color,
        strokeOpacity: 0.2,
        strokeWeight: 1,
        fillColor: guild.color,
        fillOpacity: 0.1,
        map: map,
        center: center,
        radius: 15000, // 15km radius
      });
      
      const innerCircle = new google.maps.Circle({
        strokeColor: guild.color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: guild.color,
        fillOpacity: 0.3,
        map: map,
        center: center,
        radius: 5000, // 5km core
      });

      circles.push(outerCircle, innerCircle);
    }
  });

  return {
    remove: () => {
      circles.forEach(c => c.setMap(null));
    }
  };
};
