import { useState } from "react";
import { Locate, Navigation, MapPin, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface HotspotFinderProps {
  onFindHotspots: (lat: number, lng: number, radiusMiles: number, publicOnly: boolean) => void;
}

export default function HotspotFinder({ onFindHotspots }: HotspotFinderProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState([10]); // Default 10 miles
  const [publicOnly, setPublicOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocate = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLoading(false);
        // Auto-trigger search on first locate
        onFindHotspots(latitude, longitude, radius[0], publicOnly);
      },
      (err) => {
        setError("Unable to retrieve your location");
        setLoading(false);
        console.error(err);
      }
    );
  };

  const handleSearch = () => {
    if (location) {
      onFindHotspots(location.lat, location.lng, radius[0], publicOnly);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Smart Scout
        </h2>
        <span className="text-[10px] text-muted-foreground">AI RADAR</span>
      </div>

      {!location ? (
        <Button 
          variant="outline" 
          className="w-full h-12 border-dashed border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
          onClick={handleLocate}
          disabled={loading}
        >
          {loading ? (
            <span className="animate-pulse">Acquiring GPS Signal...</span>
          ) : (
            <>
              <Locate className="w-4 h-4 mr-2" />
              Enable Location to Find Spots
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          {/* Radius Slider */}
          <div className="bg-black/20 rounded-lg p-3 border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-muted-foreground">Search Radius</span>
              <span className="text-xs font-bold text-primary">{radius[0]} miles</span>
            </div>
            <Slider
              defaultValue={[10]}
              max={50}
              step={1}
              value={radius}
              onValueChange={setRadius}
              className="py-2"
            />
          </div>

          {/* Public Lands Toggle */}
          <div className="flex items-center justify-between bg-black/20 rounded-lg p-3 border border-white/5">
            <div className="flex items-center gap-2">
              <TreePine className="w-4 h-4 text-green-500" />
              <Label htmlFor="public-mode" className="text-xs font-medium cursor-pointer">
                Prioritize Public Lands
              </Label>
            </div>
            <Switch 
              id="public-mode" 
              checked={publicOnly}
              onCheckedChange={setPublicOnly}
            />
          </div>

          <Button 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSearch}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Scan for Hotspots
          </Button>
          
          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
