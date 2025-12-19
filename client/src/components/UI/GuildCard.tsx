import { cn } from "@/lib/utils";
import { Info, MapPin, Calendar, TreeDeciduous } from "lucide-react";

interface Guild {
  id: string;
  name: string;
  scientificName: string;
  tier: string;
  color: string;
  seasonality: string;
  habitat: string;
  description: string;
  recentStatus: string;
  hotspots: string[];
  image: string;
}

interface GuildCardProps {
  guild: Guild;
  isActive: boolean;
  onClick: () => void;
}

export default function GuildCard({ guild, isActive, onClick }: GuildCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-xl border transition-all duration-300 cursor-pointer group overflow-hidden",
        isActive 
          ? "bg-card border-primary shadow-[0_0_15px_rgba(0,240,255,0.2)]" 
          : "bg-card/40 border-white/5 hover:bg-card/60 hover:border-white/20"
      )}
    >
      {/* Active Indicator Glow */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
      )}

      <div className="flex gap-4 relative z-10">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/50">
          <img 
            src={guild.image} 
            alt={guild.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className={cn(
                "font-heading font-bold text-lg leading-tight",
                isActive ? "text-primary neon-text" : "text-foreground"
              )}>
                {guild.name}
              </h3>
              <p className="text-xs font-mono text-muted-foreground italic truncate">
                {guild.scientificName}
              </p>
            </div>
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded border",
              guild.tier === 'A' 
                ? "border-green-500/50 text-green-400 bg-green-500/10" 
                : "border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
            )}>
              TIER {guild.tier}
            </span>
          </div>

          {/* Details (Visible when active or hovered) */}
          <div className={cn(
            "mt-3 space-y-2 text-sm transition-all duration-300",
            isActive ? "opacity-100 max-h-40" : "opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-40"
          )}>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">{guild.seasonality}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <TreeDeciduous className="w-3 h-3" />
              <span className="text-xs truncate">{guild.habitat}</span>
            </div>
            
            <div className="pt-2 border-t border-white/5">
              <p className="text-xs text-foreground/80 leading-relaxed">
                <span className="text-primary font-bold">STATUS:</span> {guild.recentStatus}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
