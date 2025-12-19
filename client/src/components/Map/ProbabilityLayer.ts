import guildsDataRaw from "@/data/guilds.json";
import { Guild } from "@/types";

const guildsData = guildsDataRaw as Guild[];

export const updateProbabilityLayer = (map: google.maps.Map, guildId: string) => {
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
        return {
          location: new google.maps.LatLng(f.geometry.coordinates[1], f.geometry.coordinates[0]),
          weight: f.properties.intensity || 1.0
        };
      });

      heatmap = new google.maps.visualization.HeatmapLayer({
        data: points,
        map: map,
        radius: 40,
        opacity: 0.8,
        gradient: [
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
        ]
      });
      
      // Override gradient with guild color if possible, or stick to a "probability" gradient
      // For now, we use a standard heatmap gradient (Blue -> Red) to show probability intensity
    })
    .catch(err => console.error("Failed to load layer data", err));

  return {
    remove: () => {
      if (heatmap) heatmap.setMap(null);
    }
  };
};
