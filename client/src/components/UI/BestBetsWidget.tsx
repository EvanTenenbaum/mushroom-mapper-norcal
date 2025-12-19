import { Guild } from "@/types";
import { Flame, TrendingUp, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface BestBetsWidgetProps {
  guilds: Guild[];
  onSelect: (id: string) => void;
  selectedId: string;
}

export default function BestBetsWidget({ guilds, onSelect, selectedId }: BestBetsWidgetProps) {
  // Sort guilds by a simulated "activity score" (in a real app, this would come from the backend)
  // For now, we prioritize Chanterelles and Hedgehogs as they are in season
  const sortedGuilds = [...guilds].sort((a, b) => {
    const scoreA = getScore(a.id);
    const scoreB = getScore(b.id);
    return scoreB - scoreA;
  });

  function getScore(id: string) {
    if (id === "chanterelle") return 95;
    if (id === "hedgehog") return 88;
    if (id === "candycap") return 75;
    if (id === "trumpet") return 60;
    return 40;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Best Bets Today
        </h2>
        <span className="text-[10px] text-muted-foreground">LIVE RANKING</span>
      </div>

      <div className="grid gap-2">
        {sortedGuilds.slice(0, 3).map((guild, index) => (
          <button
            key={guild.id}
            onClick={() => onSelect(guild.id)}
            className={cn(
              "relative group flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
              selectedId === guild.id
                ? "bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"
            )}
          >
            <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 border border-white/10">
              <img 
                src={guild.image} 
                alt={guild.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0.5 left-0.5 text-[10px] font-bold text-white">
                #{index + 1}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={cn(
                  "font-medium text-sm truncate",
                  selectedId === guild.id ? "text-primary" : "text-foreground"
                )}>
                  {guild.name}
                </span>
                <span className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded",
                  index === 0 ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-muted-foreground"
                )}>
                  {getScore(guild.id)}%
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Peaking
                </span>
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  Wet Soil
                </span>
              </div>
            </div>

            {selectedId === guild.id && (
              <div className="absolute inset-0 rounded-lg ring-1 ring-primary pointer-events-none animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
