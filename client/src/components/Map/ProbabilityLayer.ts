import guildsDataRaw from "@/data/guilds.json";
import { Guild } from "@/types";

const guildsData = guildsDataRaw as Guild[];

export const updateProbabilityLayer = (
  map: google.maps.Map, 
  guildId: string,
  activeFilter: 'total' | 'weather' | 'host' | 'season' | 'habitat' = 'total'
) => {
  const guild = guildsData.find(g => g.id === guildId);
  if (!guild) return { remove: () => {} };

  // Map guild IDs to filenames
  const fileMap: Record<string, string> = {
    "chanterelle": "golden-chanterelle",
    "hedgehog": "hedgehog-mushroom",
    "trumpet": "black-trumpet",
    "candycap": "candy-cap",
    "bolete": "king-bolete",
    "morel": "burn-morel"
  };

  const fileName = fileMap[guildId];
  if (!fileName) return { remove: () => {} };

  const url = `/data/layers/${fileName}.json`;
  let heatmap: google.maps.visualization.HeatmapLayer | null = null;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const points = data.features.map((f: any) => {
        let weight = f.properties.intensity || 1.0;
        
        // Apply specific filter if requested
        if (activeFilter !== 'total' && f.properties.factors) {
          weight = f.properties.factors[activeFilter] || 0.1;
        }

        return {
          location: new google.maps.LatLng(f.geometry.coordinates[1], f.geometry.coordinates[0]),
          weight: weight
        };
      });

      // Define gradients based on filter type
      const gradients: Record<string, string[]> = {
        total: [
          "rgba(0, 255, 255, 0)",
          "rgba(0, 255, 255, 1)",
          "rgba(0, 191, 255, 1)",
          "rgba(0, 127, 255, 1)",
          "rgba(0, 63, 255, 1)",
          "rgba(0, 0, 255, 1)",
          "rgba(0, 0, 223, 1)",
          "rgba(0, 0, 191, 1)",
          "rgba(0, 0, 159, 1)",
          "rgba(0, 0, 127, 1)",
          "rgba(63, 0, 91, 1)",
          "rgba(127, 0, 63, 1)",
          "rgba(191, 0, 31, 1)",
          "rgba(255, 0, 0, 1)"
        ],
        weather: [
          "rgba(0, 255, 0, 0)",
          "rgba(0, 255, 0, 1)", // Green for weather/growth
          "rgba(255, 255, 0, 1)"
        ],
        host: [
          "rgba(139, 69, 19, 0)",
          "rgba(139, 69, 19, 1)", // Brown for trees/wood
          "rgba(205, 133, 63, 1)"
        ],
        season: [
          "rgba(255, 165, 0, 0)",
          "rgba(255, 165, 0, 1)", // Orange for time/season
          "rgba(255, 69, 0, 1)"
        ],
        habitat: [
          "rgba(34, 139, 34, 0)",
          "rgba(34, 139, 34, 1)", // Forest Green for habitat
          "rgba(0, 100, 0, 1)"
        ]
      };

      heatmap = new google.maps.visualization.HeatmapLayer({
        data: points,
        map: map,
        radius: 40,
        opacity: 0.8,
        gradient: gradients[activeFilter] || gradients['total']
      });
    })
    .catch(err => console.error("Failed to load layer data", err));

  return {
    remove: () => {
      if (heatmap) heatmap.setMap(null);
    }
  };
};
