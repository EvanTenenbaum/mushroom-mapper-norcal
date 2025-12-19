import { Guild } from "@/types";
import { cn } from "@/lib/utils";
import { Droplets, Thermometer, TreeDeciduous, Clock } from "lucide-react";

interface GuildCardProps {
  guild: Guild;
  isSelected: boolean;
  onClick: () => void;
}

export default function GuildCard({ guild, isSelected, onClick }: GuildCardProps) {
  // Define scientific thresholds for display
  const thresholds: Record<string, any> = {
    "chanterelle": { rain: "2.0\"", lag: "14-21 days", host: "Live Oak" },
    "hedgehog": { rain: "1.5\"", lag: "14 days", host: "Douglas Fir" },
    "trumpet": { rain: "2.0\"", lag: "21 days", host: "Tanoak" },
    "candycap": { rain: "1.0\"", lag: "7-10 days", host: "Live Oak" },
    "bolete": { rain: "1.0\"", lag: "10-14 days", host: "Bishop Pine", shock: true },
    "morel": { rain: "0.5\"", lag: "7 days", host: "Fir (Burn)" }
  };

  const info = thresholds[guild.id] || { rain: "?", lag: "?", host: "?" };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
        isSelected 
          ? "bg-accent/10 border-primary shadow-[0_0_30px_-10px_rgba(0,255,157,0.3)]" 
          : "bg-card/40 border-white/5 hover:bg-card/60 hover:border-white/10"
      )}
    >
      {/* Selection Indicator */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 bg-primary transition-opacity duration-300",
        isSelected ? "opacity-100" : "opacity-0"
      )} />

      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0">
          <img 
            src={guild.image} 
            alt={guild.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {isSelected && (
            <div className="absolute inset-0 bg-primary/20 animate-pulse" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className={cn(
                "font-bold text-sm tracking-wide transition-colors",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {guild.name}
              </h3>
              <p className="text-xs text-muted-foreground italic truncate">
                {guild.scientificName}
              </p>
            </div>
            {/* Tier Badge */}
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded border",
              guild.tier === 'A' ? "border-primary/50 text-primary bg-primary/10" :
              "border-white/20 text-muted-foreground"
            )}>
              TIER {guild.tier}
            </span>
          </div>

          {/* Scientific Thresholds Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Droplets className="w-3 h-3 text-blue-400" />
              <span>Rain: &gt;{info.rain}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3 text-orange-400" />
              <span>Lag: {info.lag}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground col-span-2">
              <TreeDeciduous className="w-3 h-3 text-green-400" />
              <span className="truncate">Host: {info.host}</span>
            </div>
            {info.shock && (
              <div className="flex items-center gap-1.5 text-[10px] text-blue-300 col-span-2">
                <Thermometer className="w-3 h-3" />
                <span>Requires Cold Shock (&lt;15°C)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
