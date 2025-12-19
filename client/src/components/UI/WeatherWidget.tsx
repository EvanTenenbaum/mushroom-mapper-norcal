import { useEffect, useState } from "react";
import { CloudRain, Droplets, ThermometerSun, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { WeatherData } from "@/types";

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/weather_live.json")
      .then(res => res.json())
      .then(data => {
        // Transform the raw data to match our WeatherData interface
        const transformed: WeatherData = {
          summary: "Live data from PRISM/Open-Meteo",
          forecast: "Variable conditions expected.",
          recentPrecipitation: {
            north_coast: `${data.regions.north_coast.precip_total_14d_in}"`,
            bay_area: `${data.regions.bay_area.precip_total_14d_in}"`,
            sierra_foothills: `${data.regions.sierra_foothills.precip_total_14d_in}"`
          },
          soilMoistureIndex: {
            coastal: data.regions.north_coast.soil_moisture_pct / 100, // Convert to 0-1 scale
            inland: data.regions.bay_area.soil_moisture_pct / 100,
            mountain: data.regions.sierra_foothills.soil_moisture_pct / 100
          },
          lastSoakDate: "2024-12-15",
          alerts: []
        };
        setWeather(transformed);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load weather data", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-xs text-muted-foreground">Loading Eco-Forecast...</div>;
  if (!weather) return null;

  return (
    <div className="glass-panel rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-primary" />
          ECO-FORECAST
        </h3>
        <span className="text-xs font-mono text-muted-foreground">
          LIVE DATA
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/20 rounded-lg p-2 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-mono text-muted-foreground">SOIL MOISTURE (COAST)</span>
          </div>
          <div className="text-lg font-bold text-blue-100">
            {(weather.soilMoistureIndex.coastal * 100).toFixed(0)}%
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-2 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <ThermometerSun className="w-3 h-3 text-orange-400" />
            <span className="text-[10px] font-mono text-muted-foreground">PRECIP (14D)</span>
          </div>
          <div className="text-lg font-bold text-orange-100">
            {weather.recentPrecipitation.north_coast}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          7-Day Outlook
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/50 pl-3">
          {weather.forecast}
        </p>
      </div>
    </div>
  );
}
