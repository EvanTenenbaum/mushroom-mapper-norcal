import { useEffect, useRef, useState } from 'react';
import { MapView } from '@/components/Map';
import { updateProbabilityLayer } from './ProbabilityLayer';
import { addUncertaintyLayer } from './UncertaintyLayer';
import { DARK_MAP_STYLE, NORCAL_BOUNDS, INITIAL_VIEW } from '@/config/mapConfig';

interface MainMapProps {
  onMapLoad?: (map: google.maps.Map) => void;
  selectedGuildId?: string;
  showUncertainty?: boolean;
}

export default function MainMap({ onMapLoad, selectedGuildId, showUncertainty }: MainMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const probabilityLayerRef = useRef<{ remove: () => void } | null>(null);
  const uncertaintyLayerRef = useRef<{ remove: () => void } | null>(null);

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
    
    // Set initial view to NorCal
    map.setCenter(INITIAL_VIEW.center);
    map.setZoom(INITIAL_VIEW.zoom);
    
    // Restrict bounds
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

  // Update Probability Layer (Guilds)
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedGuildId) return;

    // Cleanup previous layer
    if (probabilityLayerRef.current) {
      probabilityLayerRef.current.remove();
    }

    // Add new layer
    probabilityLayerRef.current = updateProbabilityLayer(mapRef.current, selectedGuildId);

    return () => {
      if (probabilityLayerRef.current) probabilityLayerRef.current.remove();
    };
  }, [mapReady, selectedGuildId]);

  // Update Uncertainty Layer
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


