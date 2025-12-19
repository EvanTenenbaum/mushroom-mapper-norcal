import { useState } from "react";
import MainMap from "@/components/Map/MainMap";
import GuildCard from "@/components/UI/GuildCard";
import WeatherWidget from "@/components/UI/WeatherWidget";
import guildsDataRaw from "@/data/guilds.json";
import { Guild } from "@/types";

const guildsData = guildsDataRaw as Guild[];
import { Layers, AlertTriangle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  const [selectedGuildId, setSelectedGuildId] = useState<string>(guildsData[0].id);
  const [showUncertainty, setShowUncertainty] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex relative">
      
      {/* Sidebar / HUD */}
      <aside className={cn(
        "absolute z-20 top-0 left-0 h-full w-full md:w-[400px] bg-background/95 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 ease-in-out flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h1 className="font-heading font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              MYCO-MAP
            </h1>
            <p className="text-xs font-mono text-muted-foreground tracking-widest">
              NORCAL PROBABILITY SYSTEM v1.0
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          
          {/* Weather Section */}
          <section>
            <WeatherWidget />
          </section>

          {/* Guild Selection */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                Target Guilds
              </h2>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                {guildsData.length} ACTIVE
              </span>
            </div>
            <div className="space-y-2">
              {guildsData.map((guild) => (
                <GuildCard 
                  key={guild.id}
                  guild={guild}
                  isActive={selectedGuildId === guild.id}
                  onClick={() => setSelectedGuildId(guild.id)}
                />
              ))}
            </div>
          </section>

          {/* Layer Controls */}
          <section className="glass-panel rounded-xl p-4">
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-3">
              Map Overlays
            </h2>
            <div className="space-y-2">
              <button 
                onClick={() => setShowUncertainty(!showUncertainty)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                  showUncertainty 
                    ? "bg-destructive/10 border-destructive/50 text-destructive-foreground" 
                    : "bg-black/20 border-white/5 text-muted-foreground hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Uncertainty Mask</span>
                </div>
                <div className={cn(
                  "w-8 h-4 rounded-full relative transition-colors",
                  showUncertainty ? "bg-destructive" : "bg-white/10"
                )}>
                  <div className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform",
                    showUncertainty ? "left-4.5" : "left-0.5"
                  )} />
                </div>
              </button>
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-[10px] text-muted-foreground font-mono text-center">
          DATA SOURCES: 3DEP • NAIP • iNATURALIST • PRISM
        </div>
      </aside>

      {/* Toggle Button (Mobile/Collapsed) */}
      {!sidebarOpen && (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4 z-20 bg-background/80 backdrop-blur border-white/10"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}

      {/* Main Map Area */}
      <main className={cn(
        "flex-1 h-full transition-all duration-300 relative",
        "md:pl-[400px]" // Reserve space for sidebar on desktop
      )}>
        <MainMap 
          selectedGuildId={selectedGuildId}
          showUncertainty={showUncertainty}
        />
        
        {/* Map Overlay HUD (Bottom Right) */}
        <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-2 pointer-events-none">
          <div className="glass-panel p-3 rounded-lg pointer-events-auto">
            <div className="text-[10px] font-mono text-muted-foreground mb-1">PROBABILITY INDEX</div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 rounded-full bg-gradient-to-r from-transparent via-primary to-secondary" />
              <span className="text-xs font-bold text-secondary">HIGH</span>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
