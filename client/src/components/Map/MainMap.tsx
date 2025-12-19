import { useEffect, useRef, useState } from 'react';
import { Locate, Layers, CloudRain, TreeDeciduous, Calendar, Map as MapIcon, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapView } from '@/components/Map';
import { updateProbabilityLayer } from './ProbabilityLayer';
import { addUncertaintyLayer } from './UncertaintyLayer';
import { DARK_MAP_STYLE, NORCAL_BOUNDS, INITIAL_VIEW } from '@/config/mapConfig';

interface MainMapProps {
  onMapLoad?: (map: google.maps.Map) => void;
  selectedGuildId?: string;
  showUncertainty?: boolean;
}

type FilterType = 'total' | 'weather' | 'host' | 'season' | 'habitat' | 'aspect';

export default function MainMap({ onMapLoad, selectedGuildId, showUncertainty }: MainMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('total');
  const probabilityLayerRef = useRef<{ remove: () => void } | null>(null);
  const uncertaintyLayerRef = useRef<{ remove: () => void } | null>(null);

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
    
    map.setCenter(INITIAL_VIEW.center);
    map.setZoom(INITIAL_VIEW.zoom);
    
    map.setOptions({
      restriction: {
        latLngBounds: NORCAL_BOUNDS,
        strictBounds: false,
      },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: DARK_MAP_STYLE,
    });

    if (onMapLoad) onMapLoad(map);
  };

  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedGuildId) return;

    if (probabilityLayerRef.current) {
      probabilityLayerRef.current.remove();
    }

    probabilityLayerRef.current = updateProbabilityLayer(mapRef.current, selectedGuildId, activeFilter);

    return () => {
      if (probabilityLayerRef.current) probabilityLayerRef.current.remove();
    };
  }, [mapReady, selectedGuildId, activeFilter]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (showUncertainty) {
      if (!uncertaintyLayerRef.current) {
        uncertaintyLayerRef.current = addUncertaintyLayer(mapRef.current);
      }
    } else {
      if (uncertaintyLayerRef.current) {
        uncertaintyLayerRef.current.remove();
        uncertaintyLayerRef.current = null;
      }
    }
  }, [mapReady, showUncertainty]);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <MapView 
        className="w-full h-full"
        onMapReady={handleMapReady}
      />

      {/* Filter Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10">
        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider px-2 mb-1">Probability Factors</span>
        
        <Button
          variant={activeFilter === 'total' ? "default" : "ghost"}
          size="sm"
          className="justify-start gap-2 h-8 text-xs"
          onClick={() => setActiveFilter('total')}
        >
          <Layers className="w-3 h-3" />
          Total Probability
        </Button>
        
        <Button
          variant={activeFilter === 'weather' ? "default" : "ghost"}
          size="sm"
          className="justify-start gap-2 h-8 text-xs"
          onClick={() => setActiveFilter('weather')}
        >
          <CloudRain className="w-3 h-3" />
          Weather (Hyperlocal)
        </Button>
        
        <Button
          variant={activeFilter === 'host' ? "default" : "ghost"}
          size="sm"
          className="justify-start gap-2 h-8 text-xs"
          onClick={() => setActiveFilter('host')}
        >
          <TreeDeciduous className="w-3 h-3" />
          Host Trees
        </Button>
        
        <Button
          variant={activeFilter === 'season' ? "default" : "ghost"}
          size="sm"
          className="justify-start gap-2 h-8 text-xs"
          onClick={() => setActiveFilter('season')}
        >
          <Calendar className="w-3 h-3" />
          Seasonality
        </Button>

        <Button
          variant={activeFilter === 'habitat' ? "default" : "ghost"}
          size="sm"
          className="justify-start gap-2 h-8 text-xs"
          onClick={() => setActiveFilter('habitat')}
        >
          <MapIcon className="w-3 h-3" />
          Habitat (NLCD)
        </Button>

        <Button
          variant={activeFilter === 'aspect' ? "default" : "ghost"}
          size="sm"
          className="justify-start gap-2 h-8 text-xs"
          onClick={() => setActiveFilter('aspect')}
        >
          <Compass className="w-3 h-3" />
          Aspect (Slope)
        </Button>
      </div>

      {/* Locate Me Control */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-32 right-8 z-10 rounded-full shadow-lg border border-white/10"
        onClick={() => {
          if (navigator.geolocation && mapRef.current) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const pos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                mapRef.current?.setCenter(pos);
                mapRef.current?.setZoom(14);
                new google.maps.Marker({
                  position: pos,
                  map: mapRef.current,
                  title: "You are here",
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                  },
                });
              },
              () => {
                console.error("Error: The Geolocation service failed.");
              }
            );
          }
        }}
      >
        <Locate className="w-5 h-5" />
      </Button>
      
      {/* Loading Overlay */}
      {!mapReady && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-primary font-mono text-sm animate-pulse">INITIALIZING SATELLITE UPLINK...</span>
          </div>
        </div>
      )}
    </div>
  );
}
