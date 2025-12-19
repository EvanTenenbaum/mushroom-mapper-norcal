import { Navigation, Download, MapPin, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActionToolsWidget() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button 
        variant="outline" 
        className="h-auto py-3 flex flex-col gap-2 bg-black/20 border-white/5 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
        onClick={() => alert("Routing to nearest high-probability zone...")}
      >
        <Navigation className="w-5 h-5" />
        <span className="text-xs font-medium">Navigate to Hotspot</span>
      </Button>

      <Button 
        variant="outline" 
        className="h-auto py-3 flex flex-col gap-2 bg-black/20 border-white/5 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
        onClick={() => alert("Caching current map area for offline use...")}
      >
        <Download className="w-5 h-5" />
        <span className="text-xs font-medium">Download Offline</span>
      </Button>

      <Button 
        variant="outline" 
        className="h-auto py-3 flex flex-col gap-2 bg-black/20 border-white/5 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
        onClick={() => alert("Logging find location...")}
      >
        <MapPin className="w-5 h-5" />
        <span className="text-xs font-medium">Report Find</span>
      </Button>

      <Button 
        variant="outline" 
        className="h-auto py-3 flex flex-col gap-2 bg-black/20 border-white/5 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
        onClick={() => alert("Sharing current location...")}
      >
        <Share2 className="w-5 h-5" />
        <span className="text-xs font-medium">Share Location</span>
      </Button>
    </div>
  );
}
