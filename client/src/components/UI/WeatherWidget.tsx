import { CloudRain, Droplets, ThermometerSun, Wind } from "lucide-react";
import weatherData from "@/data/weather.json";

export default function WeatherWidget() {
  return (
    <div className="glass-panel rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-primary" />
          ECO-FORECAST
        </h3>
        <span className="text-xs font-mono text-muted-foreground">
          WATER YEAR 2025
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/20 rounded-lg p-2 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] font-mono text-muted-foreground">SOIL MOISTURE (COAST)</span>
          </div>
          <div className="text-lg font-bold text-blue-100">
            {(weatherData.soilMoistureIndex.coastal * 100).toFixed(0)}%
          </div>
        </div>

        <div className="bg-black/20 rounded-lg p-2 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <ThermometerSun className="w-3 h-3 text-orange-400" />
            <span className="text-[10px] font-mono text-muted-foreground">PRECIP ANOMALY</span>
          </div>
          <div className="text-lg font-bold text-orange-100">
            {weatherData.recentPrecipitation.north_coast}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          7-Day Outlook
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/50 pl-3">
          {weatherData.forecast}
        </p>
      </div>

      {weatherData.alerts.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2 flex gap-2 items-start">
          <Wind className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive-foreground">
            {weatherData.alerts[0].message}
          </p>
        </div>
      )}
    </div>
  );
}
