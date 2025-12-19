import guildsDataRaw from "@/data/guilds.json";
import { Guild } from "@/types";

const guildsData = guildsDataRaw as Guild[];

export const updateProbabilityLayer = (map: google.maps.Map, guildId: string) => {
  const guild = guildsData.find(g => g.id === guildId);
  if (!guild) return { remove: () => {} };

  const dataLayer = new google.maps.Data({ map });

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

  dataLayer.loadGeoJson(url, { idPropertyName: "location" }, (features) => {
    // Style the features
    dataLayer.setStyle({
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: guild.color,
        fillOpacity: 0.6,
        strokeWeight: 0
      }
    });
  });

  return {
    remove: () => {
      dataLayer.setMap(null);
    }
  };
};
