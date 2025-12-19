export interface Guild {
  id: string;
  name: string;
  scientificName: string;
  tier: 'A' | 'B' | 'C';
  color: string;
  seasonality: string;
  habitat: string;
  description: string;
  recentStatus: string;
  hotspots: string[];
  image: string;
}

export interface WeatherData {
  summary: string;
  forecast: string;
  recentPrecipitation: {
    north_coast: string;
    bay_area: string;
    sierra_foothills: string;
  };
  soilMoistureIndex: {
    coastal: number;
    inland: number;
    mountain: number;
  };
  lastSoakDate: string;
  alerts: Array<{
    type: 'warning' | 'info' | 'error';
    message: string;
  }>;
}
